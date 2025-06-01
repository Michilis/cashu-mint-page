import { useState, useEffect, useCallback, useRef } from 'react';
import NDK, { NDKEvent, NDKFilter, NDKSubscription } from '@nostr-dev-kit/ndk';
import { initializeNDK, MINT_RECOMMENDATION_KIND, CASHU_MINT_KIND } from '../utils/ndk';
import { parseNIP87Review, isValidReview } from '../utils/reviewHelpers';

export interface PopularMint {
  mintUrl: string;
  mintName: string;
  domain: string;
  reviewCount: number;
  averageRating: number;
  lastReviewAt: number;
}

// Helper function to determine if a review is for a Cashu mint (not Fedi)
const isCashuMintReview = (event: NDKEvent, mintUrl: string): boolean => {
  const tags = event.tags || [];
  const kTag = tags.find((tag: string[]) => tag[0] === 'k')?.[1];
  const uTag = tags.find((tag: string[]) => tag[0] === 'u')?.[1];
  const content = event.content.toLowerCase();
  
  // Must have k tag pointing to Cashu mint kind (38172)
  if (kTag === CASHU_MINT_KIND.toString()) {
    return true;
  }
  
  // For legacy reviews, check URL patterns and content
  if (uTag) {
    const urlLower = uTag.toLowerCase();
    
    // Exclude fedi-mint patterns
    if (urlLower.includes('fedi') || urlLower.includes('fedimint')) {
      return false;
    }
    
    // Check for cashu-specific patterns in URL
    const cashuPatterns = [
      'cashu',
      'mint',
      '/v1/info', // Cashu mint API endpoint
      '/api/v1/', // Common cashu mint pattern
    ];
    
    const hasCashuPattern = cashuPatterns.some(pattern => urlLower.includes(pattern));
    
    // Check content for cashu-specific terms
    const cashuContentTerms = [
      'cashu',
      'ecash',
      'blind signature',
      'lightning',
      'nuts', // Cashu protocol specification term
      'chaumian',
    ];
    
    const fediContentTerms = [
      'fedi',
      'fedimint',
      'federation',
      'guardian',
    ];
    
    const hasCashuContent = cashuContentTerms.some(term => content.includes(term));
    const hasFediContent = fediContentTerms.some(term => content.includes(term));
    
    if (hasFediContent) {
      return false;
    }
    
    if (hasCashuPattern || hasCashuContent) {
      return true;
    }
  }
  
  return false;
};

export const usePopularMints = (limit: number = 8) => {
  const [popularMints, setPopularMints] = useState<PopularMint[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [ndk, setNdk] = useState<NDK | null>(null);
  
  const subscriptionRef = useRef<NDKSubscription | null>(null);
  const mintStatsRef = useRef<Map<string, {
    reviews: number;
    totalRating: number;
    lastReviewAt: number;
    mintName: string;
    domain: string;
  }>>(new Map());

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.stop();
      subscriptionRef.current = null;
    }
  }, []);

  const initNDK = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      setLoading(true);
      const ndkInstance = await initializeNDK();
      setNdk(ndkInstance);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to initialize NDK for popular mints:', error);
      setConnectionStatus('error');
      setLoading(false);
    }
  }, []);

  const fetchPopularMints = useCallback(async () => {
    if (!ndk) return;

    try {
      cleanup();
      setLoading(true);
      mintStatsRef.current.clear();

      console.log('📊 Fetching popular Cashu mints by review count...');

      // Broader time range to get more comprehensive data
      const filters: NDKFilter[] = [
        // Primary filter: Proper NIP-87 Cashu mint reviews
        {
          kinds: [MINT_RECOMMENDATION_KIND], // 38000
          "#k": [CASHU_MINT_KIND.toString()], // 38172 - Cashu mint kind ONLY
          limit: 500, // Get more data for better statistics
          since: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60) // Last 90 days
        },
        // Fallback: Reviews with cashu-related URL tags
        {
          kinds: [MINT_RECOMMENDATION_KIND], // 38000
          "#u": [
            "*cashu*",
            "*mint*",
            "*ecash*"
          ],
          limit: 300,
          since: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60)
        }
      ];

      console.log('🔍 Popular mints filters:', filters);

      const sub = ndk.subscribe(filters, { closeOnEose: false });
      subscriptionRef.current = sub;

      let reviewEventCount = 0;
      let cashuReviewCount = 0;
      let uniqueMintsFound = 0;

      sub.on('event', (event: NDKEvent) => {
        reviewEventCount++;
        
        try {
          // Extract mint URL from tags
          const uTag = event.tags?.find((tag: string[]) => tag[0] === 'u')?.[1];
          
          if (!uTag) return;
          
          const mintUrl = uTag;
          
          // Check if this is specifically a Cashu mint review
          if (!isCashuMintReview(event, mintUrl)) {
            return;
          }
          
          const review = parseNIP87Review(event, mintUrl);
          
          if (review && isValidReview(review)) {
            cashuReviewCount++;
            
            // Clean and normalize the mint URL
            const cleanUrl = mintUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
            const domain = cleanUrl.split('/')[0];
            
            // Extract mint name from URL
            let mintName = domain.split('.')[0] || domain;
            
            // Clean up mint name - handle special cases
            if (mintName === 'mint' && domain.includes('.')) {
              const parts = domain.split('.');
              if (parts.length > 1) {
                mintName = parts[1]; // Use the main domain part
              }
            }
            
            // Capitalize mint name
            mintName = mintName.charAt(0).toUpperCase() + mintName.slice(1);
            
            // Update or create mint statistics
            const existing = mintStatsRef.current.get(cleanUrl);
            if (existing) {
              existing.reviews += 1;
              existing.totalRating += review.rating;
              existing.lastReviewAt = Math.max(existing.lastReviewAt, review.created_at);
            } else {
              mintStatsRef.current.set(cleanUrl, {
                reviews: 1,
                totalRating: review.rating,
                lastReviewAt: review.created_at,
                mintName,
                domain
              });
              uniqueMintsFound++;
            }
          }
        } catch (error) {
          console.warn('Error processing popular mints event:', error);
        }
      });

      // Handle end of stored events
      sub.on('eose', () => {
        console.log(`\n📊 Popular mints analysis complete:`);
        console.log(`  - Processed ${reviewEventCount} events`);
        console.log(`  - Found ${cashuReviewCount} valid Cashu reviews`);
        console.log(`  - Discovered ${uniqueMintsFound} unique Cashu mints`);
        
        // Convert to array and sort by review count
        const mintsArray: PopularMint[] = Array.from(mintStatsRef.current.entries())
          .map(([mintUrl, stats]) => ({
            mintUrl,
            mintName: stats.mintName,
            domain: stats.domain,
            reviewCount: stats.reviews,
            averageRating: stats.totalRating / stats.reviews,
            lastReviewAt: stats.lastReviewAt
          }))
          .sort((a, b) => {
            // Primary sort: review count (descending)
            if (b.reviewCount !== a.reviewCount) {
              return b.reviewCount - a.reviewCount;
            }
            // Secondary sort: average rating (descending)
            if (b.averageRating !== a.averageRating) {
              return b.averageRating - a.averageRating;
            }
            // Tertiary sort: most recent review (descending)
            return b.lastReviewAt - a.lastReviewAt;
          })
          .slice(0, limit);
        
        console.log(`🏆 Top ${mintsArray.length} popular Cashu mints:`, 
          mintsArray.map(m => `${m.mintName} (${m.reviewCount} reviews, ${m.averageRating.toFixed(1)} avg)`));
        
        setPopularMints(mintsArray);
        setLoading(false);
        sub.stop();
      });

      // Handle subscription close
      sub.on('close', () => {
        console.error('❌ Popular mints subscription closed unexpectedly');
        setConnectionStatus('error');
        setLoading(false);
      });

      // Timeout fallback
      setTimeout(() => {
        if (loading) {
          const mintsArray: PopularMint[] = Array.from(mintStatsRef.current.entries())
            .map(([mintUrl, stats]) => ({
              mintUrl,
              mintName: stats.mintName,
              domain: stats.domain,
              reviewCount: stats.reviews,
              averageRating: stats.totalRating / stats.reviews,
              lastReviewAt: stats.lastReviewAt
            }))
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, limit);
          
          setPopularMints(mintsArray);
          setLoading(false);
          
          console.log(`⏰ Popular mints timeout: Found ${mintsArray.length} mints`);
          sub.stop();
        }
      }, 15000);

    } catch (error) {
      console.error('Error fetching popular mints:', error);
      setConnectionStatus('error');
      setLoading(false);
    }
  }, [ndk, limit, cleanup, loading]);

  // Initialize NDK once on mount
  useEffect(() => {
    initNDK();
    return cleanup;
  }, [initNDK, cleanup]);

  // Fetch popular mints when NDK is ready
  useEffect(() => {
    if (ndk && connectionStatus === 'connected') {
      fetchPopularMints();
    }
  }, [ndk, connectionStatus, fetchPopularMints]);

  return {
    popularMints,
    loading,
    connectionStatus,
    refetch: fetchPopularMints
  };
}; 