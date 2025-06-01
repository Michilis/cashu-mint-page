import { useState, useEffect, useCallback, useRef } from 'react';
import NDK, { NDKEvent, NDKFilter, NDKSubscription } from '@nostr-dev-kit/ndk';
import { MintReview } from '../types';
import { initializeNDK, MINT_RECOMMENDATION_KIND, CASHU_MINT_KIND } from '../utils/ndk';
import { parseNIP87Review, isValidReview, aggregateReviews } from '../utils/reviewHelpers';

export interface ReviewWithMint extends MintReview {
  mintName?: string;
  mintIcon?: string;
}

// Helper function to determine if a review is for a Cashu mint (not Fedi)
const isCashuMintReview = (event: NDKEvent, mintUrl: string): boolean => {
  const tags = event.tags || [];
  const kTag = tags.find((tag: string[]) => tag[0] === 'k')?.[1];
  const uTag = tags.find((tag: string[]) => tag[0] === 'u')?.[1];
  const content = event.content.toLowerCase();
  
  // Must have k tag pointing to Cashu mint kind (38172)
  if (kTag === CASHU_MINT_KIND.toString()) {
    console.log('✅ Proper NIP-87 Cashu mint review (k tag = 38172)');
    return true;
  }
  
  // For legacy reviews, check URL patterns and content
  if (uTag) {
    const urlLower = uTag.toLowerCase();
    
    // Exclude fedi-mint patterns
    if (urlLower.includes('fedi') || urlLower.includes('fedimint')) {
      console.log('❌ Excluded: Fedi mint review detected');
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
      console.log('❌ Excluded: Fedi-related content detected');
      return false;
    }
    
    if (hasCashuPattern || hasCashuContent) {
      console.log('✅ Legacy Cashu mint review (URL/content patterns)');
      return true;
    }
  }
  
  console.log('❌ Not a Cashu mint review');
  return false;
};

export const useGlobalReviews = (limit: number = 50) => {
  const [recentReviews, setRecentReviews] = useState<ReviewWithMint[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [ndk, setNdk] = useState<NDK | null>(null);
  
  const subscriptionRef = useRef<NDKSubscription | null>(null);
  const fetchedReviewsRef = useRef<ReviewWithMint[]>([]);

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
      console.error('Failed to initialize NDK for global reviews:', error);
      setConnectionStatus('error');
      setLoading(false);
    }
  }, []);

  const fetchGlobalReviews = useCallback(async () => {
    if (!ndk) return;

    try {
      cleanup();
      setLoading(true);
      fetchedReviewsRef.current = [];

      console.log('🌍 Fetching recent Cashu mint reviews (excluding Fedi)...');

      // More specific filters for Cashu mint reviews only
      const filters: NDKFilter[] = [
        // Primary filter: Proper NIP-87 Cashu mint reviews
        {
          kinds: [MINT_RECOMMENDATION_KIND], // 38000
          "#k": [CASHU_MINT_KIND.toString()], // 38172 - Cashu mint kind ONLY
          limit: limit,
          since: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // Last 30 days
        },
        // Fallback: Reviews with cashu-related URL tags
        {
          kinds: [MINT_RECOMMENDATION_KIND], // 38000
          "#u": [
            "*cashu*",
            "*mint*",
            "*ecash*"
          ],
          limit: Math.floor(limit / 2),
          since: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
        }
      ];

      console.log('🔍 Cashu-only review filters:', filters);

      const sub = ndk.subscribe(filters, { closeOnEose: false });
      subscriptionRef.current = sub;

      let reviewEventCount = 0;
      let cashuReviewCount = 0;
      let fediExcludedCount = 0;

      sub.on('event', (event: NDKEvent) => {
        reviewEventCount++;
        console.log(`\n📧 Review event ${reviewEventCount}:`, event.id?.substring(0, 16));
        
        try {
          // Extract mint URL from tags
          const uTag = event.tags?.find((tag: string[]) => tag[0] === 'u')?.[1];
          const dTag = event.tags?.find((tag: string[]) => tag[0] === 'd')?.[1];
          
          // Use the uTag as mintUrl if available
          const mintUrl = uTag || 'unknown';
          
          console.log(`  Mint URL: ${mintUrl}`);
          console.log(`  Content preview: ${event.content.substring(0, 100)}...`);
          
          // Check if this is specifically a Cashu mint review
          if (!isCashuMintReview(event, mintUrl)) {
            fediExcludedCount++;
            console.log(`  ❌ Excluded non-Cashu review (${fediExcludedCount} total excluded)`);
            return;
          }
          
          const review = parseNIP87Review(event, mintUrl);
          
          if (review && isValidReview(review)) {
            cashuReviewCount++;
            console.log(`  ✅ Valid Cashu mint review (${cashuReviewCount} total)`);
            
            // Extract mint name from URL, avoiding fedi-related names
            const mintDomain = mintUrl.replace(/^https?:\/\//, '').split('/')[0];
            let mintName = mintDomain.split('.')[0] || mintDomain;
            
            // Clean up mint name - remove common subdomains that aren't the actual name
            if (mintName === 'mint' && mintDomain.includes('.')) {
              const parts = mintDomain.split('.');
              if (parts.length > 2) {
                mintName = parts[1]; // Use the main domain part
              }
            }
            
            const reviewWithMint: ReviewWithMint = {
              ...review,
              mintName: mintName.charAt(0).toUpperCase() + mintName.slice(1),
              mintIcon: undefined // Could be fetched later
            };
            
            // Check if we already have this review (avoid duplicates)
            const existingIndex = fetchedReviewsRef.current.findIndex(r => r.id === review.id);
            if (existingIndex >= 0) {
              // Replace if this is newer
              if (review.created_at > fetchedReviewsRef.current[existingIndex].created_at) {
                fetchedReviewsRef.current[existingIndex] = reviewWithMint;
                console.log(`  🔄 Updated existing Cashu review`);
              }
            } else {
              fetchedReviewsRef.current.push(reviewWithMint);
              console.log(`  ✅ Added Cashu review (total: ${fetchedReviewsRef.current.length})`);
            }
          } else {
            console.log(`  ❌ Invalid review - failed parsing or validation`);
          }
        } catch (error) {
          console.warn('Error processing review event:', error);
        }
      });

      // Handle end of stored events
      sub.on('eose', () => {
        console.log(`\n🏁 End of Cashu reviews: processed ${reviewEventCount} events total`);
        console.log(`✅ Found ${cashuReviewCount} valid Cashu mint reviews`);
        console.log(`❌ Excluded ${fediExcludedCount} non-Cashu reviews`);
        
        // Sort by creation time and take the most recent
        const sortedReviews = [...fetchedReviewsRef.current]
          .sort((a, b) => b.created_at - a.created_at)
          .slice(0, limit);
        
        setRecentReviews(sortedReviews);
        setLoading(false);
        
        console.log(`🎯 Final Cashu reviews result: ${sortedReviews.length} recent reviews`);
        sub.stop();
      });

      // Handle subscription close
      sub.on('close', () => {
        console.error('❌ Cashu reviews subscription closed unexpectedly');
        setConnectionStatus('error');
        setLoading(false);
      });

      // Timeout fallback
      setTimeout(() => {
        if (loading) {
          const sortedReviews = [...fetchedReviewsRef.current]
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, limit);
          
          setRecentReviews(sortedReviews);
          setLoading(false);
          
          console.log(`⏰ Cashu reviews timeout: Found ${sortedReviews.length} reviews`);
          sub.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Error fetching Cashu reviews:', error);
      setConnectionStatus('error');
      setLoading(false);
    }
  }, [ndk, limit, cleanup, loading]);

  // Initialize NDK once on mount
  useEffect(() => {
    initNDK();
    return cleanup;
  }, [initNDK, cleanup]);

  // Fetch reviews when NDK is ready
  useEffect(() => {
    if (ndk && connectionStatus === 'connected') {
      fetchGlobalReviews();
    }
  }, [ndk, connectionStatus, fetchGlobalReviews]);

  return {
    recentReviews,
    loading,
    connectionStatus,
    refetch: fetchGlobalReviews
  };
}; 