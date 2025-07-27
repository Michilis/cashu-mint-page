import { useState, useEffect, useCallback, useRef } from 'react';
import NDK, { NDKEvent, NDKFilter, NDKSubscription } from '@nostr-dev-kit/ndk';
import { MintReview } from '../types';
import { initializeNDK, MINT_RECOMMENDATION_KIND, CASHU_MINT_KIND, generateRandomHex, getSharedNDK } from '../utils/ndk';
import { getMintPubkey } from '../services/api';
import { publishCashuMintReview, validateReview, type ReviewData } from '../services/reviewPublisher';
import { 
  parseNIP87Review, 
  isValidReview, 
  aggregateReviews
} from '../utils/reviewHelpers';

// Profile cache for usernames
export const profileCache = new Map<string, { name?: string; displayName?: string; image?: string } | null>();

export const useReviews = (mintUrl: string) => {
  const [reviews, setReviews] = useState<MintReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mintPubkey, setMintPubkey] = useState<string | null>(null);
  const [hasMoreReviews, setHasMoreReviews] = useState(true); // Track if more reviews available
  
  // Use refs to avoid dependency issues
  const subscriptionRef = useRef<NDKSubscription | null>(null);
  const fetchedReviewsRef = useRef<MintReview[]>([]);
  const isLoadingRef = useRef(true);
  const currentLimitRef = useRef(500); // Start with much higher limit
  const lastFetchCountRef = useRef(0); // Track reviews from last fetch

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.stop();
      subscriptionRef.current = null;
    }
  }, []);

  const initNDK = useCallback(async () => {
    try {
      console.log('🔄 useReviews: Starting NDK initialization...');
      setConnectionStatus('connecting');
      setLoading(true);
      const ndkInstance = await initializeNDK();
      console.log('✅ useReviews: NDK initialized successfully, setting ndk state...');
      setNdk(ndkInstance);
      setConnectionStatus('connected');
      console.log('✅ useReviews: NDK state set and connection status updated to connected');
    } catch (error) {
      console.error('❌ useReviews: Failed to initialize NDK:', error);
      setConnectionStatus('error');
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Fetch mint pubkey from /v1/info endpoint
  const fetchMintPubkey = useCallback(async (): Promise<string | null> => {
    if (!mintUrl) return null;
    
    console.log('🔑 Fetching mint pubkey for NIP-87 filtering...');
    const pubkey = await getMintPubkey(mintUrl);
    setMintPubkey(pubkey);
    
    if (!pubkey) {
      console.warn('⚠️ Could not get mint pubkey, reviews may not work properly');
    }
    
    return pubkey;
  }, [mintUrl]);

  const fetchReviews = useCallback(async (isLoadingMore = false) => {
    if (!ndk || !mintUrl) return;

    try {
      // Only clean up if not loading more
      if (!isLoadingMore) {
        cleanup();
        setLoading(true);
        isLoadingRef.current = true;
        fetchedReviewsRef.current = [];
        lastFetchCountRef.current = 0;
        currentLimitRef.current = 500; // Reset to high initial limit
        setHasMoreReviews(true); // Reset for new mint
      } else {
        setIsLoadingMore(true);
      }

      // Get mint pubkey if we don't have it (but don't fail if we can't get it)
      let pubkey = mintPubkey;
      if (!pubkey) {
        pubkey = await fetchMintPubkey();
        if (!pubkey) {
          console.warn('⚠️ Could not get mint pubkey, falling back to URL-based filtering only');
        }
      }

      console.log('📡 Starting NIP-87 review fetch for mint:', mintUrl);
      console.log('🔑 Using mint pubkey:', pubkey);
      console.log('📊 Fetch limit:', currentLimitRef.current);

      // First, let's test what events actually exist for debugging
      console.log('🔍 DEBUGGING: Testing multiple filter strategies...');

      // TEST 1: Check if there are ANY kind 38000 events at all
      const testAllReviews = ndk.subscribe([{
        kinds: [MINT_RECOMMENDATION_KIND],
        limit: 20
      }], { closeOnEose: true });

      let anyReviewsFound = 0;
      testAllReviews.on('event', (event: NDKEvent) => {
        anyReviewsFound++;
        console.log(`🔍 TEST: Found kind 38000 event ${anyReviewsFound}:`, {
          id: event.id?.substring(0, 16),
          tags: event.tags,
          content: event.content.substring(0, 100)
        });
      });

      // Wait for test to complete
      await new Promise((resolve) => {
        testAllReviews.on('eose', () => {
          console.log(`🔍 TEST RESULT: Found ${anyReviewsFound} total kind 38000 events on relay`);
          testAllReviews.stop();
          resolve(void 0);
        });
        setTimeout(resolve, 5000); // 5 second timeout
      });

      // TEST 2: Try URL-based filtering (legacy approach)
      const testUrlFilter = ndk.subscribe([{
        kinds: [MINT_RECOMMENDATION_KIND],
        "#u": [mintUrl, mintUrl.replace(/\/$/, ''), `${mintUrl}/`],
        limit: 20
      }], { closeOnEose: true });

      let urlReviewsFound = 0;
      testUrlFilter.on('event', (event: NDKEvent) => {
        urlReviewsFound++;
        console.log(`🔍 URL TEST: Found review ${urlReviewsFound} with URL tag:`, {
          id: event.id?.substring(0, 16),
          tags: event.tags,
          content: event.content.substring(0, 100)
        });
      });

      await new Promise((resolve) => {
        testUrlFilter.on('eose', () => {
          console.log(`🔍 URL TEST RESULT: Found ${urlReviewsFound} reviews with URL tags`);
          testUrlFilter.stop();
          resolve(void 0);
        });
        setTimeout(resolve, 5000);
      });

      // Build filters conditionally based on whether we have a mint pubkey
      const filters: NDKFilter[] = [];

      // NIP-87 filter (only if we have mint pubkey)
      if (pubkey) {
        filters.push({
          kinds: [MINT_RECOMMENDATION_KIND], // 38000
          "#d": [pubkey], // Use mint pubkey as identifier
          "#k": [CASHU_MINT_KIND.toString()], // 38172 - Cashu mint kind
          limit: currentLimitRef.current
        });
      }

      // URL-based filtering for legacy reviews (always include)
      filters.push({
        kinds: [MINT_RECOMMENDATION_KIND], // 38000
        "#u": [
          mintUrl,
          mintUrl.replace(/\/$/, ''), // without trailing slash
          `${mintUrl}/`, // with trailing slash
          mintUrl.replace(/^https?:\/\//, ''), // without protocol
          `https://${mintUrl.replace(/^https?:\/\//, '')}`, // ensure https
          `http://${mintUrl.replace(/^https?:\/\//, '')}` // try http
        ],
        limit: currentLimitRef.current
      });

      console.log('🔍 NIP-87 + Fallback filters:', filters);

      const sub = ndk.subscribe(filters, { closeOnEose: false });
      if (!isLoadingMore) {
        subscriptionRef.current = sub;
      }

      let reviewEventCount = 0;
      sub.on('event', (event: NDKEvent) => {
        reviewEventCount++;
        console.log(`\n📧 NIP-87 Review event ${reviewEventCount}:`);
        console.log('  Event ID:', event.id);
        console.log('  Kind:', event.kind);
        console.log('  Tags:', event.tags);
        
        try {
          // Parse the review
          const review = parseNIP87Review(event, mintUrl);
          if (review && isValidReview(review)) {
            
            // Check if this is a proper NIP-87 review or legacy review
            const dTag = event.tags?.find((tag: string[]) => tag[0] === 'd')?.[1];
            const kTag = event.tags?.find((tag: string[]) => tag[0] === 'k')?.[1];
            const uTag = event.tags?.find((tag: string[]) => tag[0] === 'u')?.[1];
            
            const isProperNIP87 = pubkey && dTag === pubkey && kTag === CASHU_MINT_KIND.toString();
            const isLegacyReview = uTag && (
              uTag === mintUrl || 
              uTag === mintUrl.replace(/\/$/, '') ||
              uTag === `${mintUrl}/` ||
              uTag === mintUrl.replace(/^https?:\/\//, '') ||
              mintUrl.includes(uTag.replace(/^https?:\/\//, '')) ||
              uTag.replace(/^https?:\/\//, '').includes(mintUrl.replace(/^https?:\/\//, '')) ||
              // More flexible path matching - extract base domain
              mintUrl.replace(/^https?:\/\//, '').split('/')[0] === uTag.replace(/^https?:\/\//, '').split('/')[0] ||
              uTag.replace(/^https?:\/\//, '').split('/')[0] === mintUrl.replace(/^https?:\/\//, '').split('/')[0]
            );

            // Accept reviews that are either proper NIP-87 or have explicit URL matches
            if (isProperNIP87) {
              console.log(`  ✅ Valid NIP-87 review found (proper format)`);
            } else if (isLegacyReview) {
              console.log(`  ✅ Valid legacy review found (URL-based)`);
            } else {
              console.log(`  ❌ Review not for this mint`);
              console.log(`    dTag: ${dTag}, expected: ${pubkey || 'none'}`);
              console.log(`    uTag: ${uTag}, target: ${mintUrl}`);
              console.log(`    isProperNIP87: ${isProperNIP87}, isLegacyReview: ${isLegacyReview}`);
              return; // Skip this review
            }
            
            console.log(`    - Rating: ${review.rating}/5`);
            console.log(`    - Author: ${review.author}`);
            console.log(`    - Content: ${review.content.substring(0, 100)}...`);
            
            // Fetch username for this review
            const fetchUsername = async () => {
              if (!profileCache.has(review.pubkey)) {
                try {
                  const ndk = await getSharedNDK();
                  const user = ndk.getUser({ pubkey: review.pubkey });
                  const userProfile = await user.fetchProfile();
                  
                  if (userProfile) {
                    profileCache.set(review.pubkey, {
                      name: userProfile.name,
                      displayName: userProfile.displayName,
                      image: userProfile.image
                    });
                    console.log(`  👤 Fetched username: ${userProfile.displayName || userProfile.name}`);
                  } else {
                    profileCache.set(review.pubkey, null);
                  }
                } catch (error) {
                  console.warn(`  ❌ Failed to fetch username for ${review.pubkey.substring(0, 16)}...`);
                  profileCache.set(review.pubkey, null);
                }
              }
            };
            
            // Fetch username in background
            fetchUsername();
            
            // Check if we already have this review (avoid duplicates)
            const existingIndex = fetchedReviewsRef.current.findIndex(r => r.id === review.id);
            if (existingIndex >= 0) {
              // Replace if this is newer (NIP-33 replaceable events)
              if (review.created_at > fetchedReviewsRef.current[existingIndex].created_at) {
                fetchedReviewsRef.current[existingIndex] = review;
                console.log(`  🔄 Updated existing review`);
              } else {
                console.log(`  ⏭️  Skipped older duplicate`);
              }
            } else {
              fetchedReviewsRef.current.push(review);
              console.log(`  ✅ Added review (total: ${fetchedReviewsRef.current.length})`);
            }
          } else {
            console.log(`  ❌ Invalid review - failed parsing or validation`);
            if (review) {
              console.log(`    Parsed successfully but failed validation`);
            } else {
              console.log(`    Failed to parse from event`);
            }
          }
        } catch (error) {
          console.warn('Error processing review event:', error);
        }
      });

      // Handle end of stored events
      sub.on('eose', () => {
        console.log(`\n🏁 End of stored events: processed ${reviewEventCount} review events total`);
        
        // Track if we found new reviews in this fetch
        const currentReviewCount = fetchedReviewsRef.current.length;
        const newReviewsFound = currentReviewCount - lastFetchCountRef.current;
        
        // Update state with all reviews at once to avoid multiple re-renders
        const aggregatedReviews = aggregateReviews([...fetchedReviewsRef.current]);
        setReviews(aggregatedReviews);
        
        // Determine if more reviews might be available
        if (isLoadingMore) {
          // If this was a "load more" request and we found fewer new reviews than expected,
          // we've probably reached the end
          if (newReviewsFound === 0) {
            setHasMoreReviews(false);
            console.log(`📊 No new reviews found in load more - reached end`);
          } else {
            console.log(`📊 Found ${newReviewsFound} new reviews in load more`);
            // Keep load more available if we found new reviews
            setHasMoreReviews(true);
          }
        } else {
          // Initial load - show load more if we have some reviews or if we're below the limit
          // This handles cases where some reviews might be filtered out but more could exist
          const shouldShowLoadMore = aggregatedReviews.length > 0 && (
            reviewEventCount >= currentLimitRef.current || // We hit our limit, more might exist
            aggregatedReviews.length >= 2 // We have some reviews, try for more
          );
          setHasMoreReviews(shouldShowLoadMore);
          console.log(`📊 Initial load: ${aggregatedReviews.length} reviews, ${reviewEventCount} events processed, showing load more: ${shouldShowLoadMore}`);
        }
        
        // Update tracking
        lastFetchCountRef.current = currentReviewCount;
        
        if (!isLoadingMore) {
          setLoading(false);
          isLoadingRef.current = false;
        } else {
          setIsLoadingMore(false);
        }
        
        console.log(`🎯 Final result: ${aggregatedReviews.length} reviews for mint ${pubkey || mintUrl}`);
        console.log(`📈 Has more reviews: ${isLoadingMore ? 'checking...' : aggregatedReviews.length >= 2}`);
        sub.stop(); // Stop subscription after EOSE
      });

      // Handle subscription close
      sub.on('close', () => {
        console.error('❌ Review subscription closed unexpectedly');
        
        // Update with whatever we have
        const aggregatedReviews = aggregateReviews([...fetchedReviewsRef.current]);
        setReviews(aggregatedReviews);
        setConnectionStatus('error');
        
        if (!isLoadingMore) {
          setLoading(false);
          isLoadingRef.current = false;
        } else {
          setIsLoadingMore(false);
        }
      });

      // Timeout fallback
      setTimeout(() => {
        if ((!isLoadingMore && isLoadingRef.current) || (isLoadingMore && isLoadingMore)) {
          const aggregatedReviews = aggregateReviews([...fetchedReviewsRef.current]);
          setReviews(aggregatedReviews);
          
          if (!isLoadingMore) {
            setLoading(false);
            isLoadingRef.current = false;
          } else {
            setIsLoadingMore(false);
          }
          
          console.log(`⏰ Timeout: Found ${aggregatedReviews.length} reviews for mint ${pubkey || mintUrl}`);
          sub.stop();
        }
      }, 8000);

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setConnectionStatus('error');
      
      if (!isLoadingMore) {
        setLoading(false);
        isLoadingRef.current = false;
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [ndk, mintUrl, mintPubkey, fetchMintPubkey, cleanup]);

  // Load more reviews function
  const loadMoreReviews = useCallback(async () => {
    if (!ndk || isLoadingMore || loading) return;
    
    // Dramatically increase the limit for next fetch
    currentLimitRef.current += 500; // Increase by 500 instead of 100
    console.log('📈 Loading WAY more reviews, new limit:', currentLimitRef.current);
    
    await fetchReviews(true);
  }, [ndk, isLoadingMore, loading, fetchReviews]);

  const submitReview = useCallback(async (reviewData: {
    rating: number;
    content: string;
  }) => {
    console.log('🎯 Starting review submission using comprehensive publisher...');
    
    // Validate review data
    const validationErrors = validateReview(reviewData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    setSubmitting(true);
    try {
      // Use the comprehensive review publisher
      const result = await publishCashuMintReview(mintUrl, reviewData);
      
      console.log('✅ Review published successfully:', result);

      // Add review locally for immediate feedback
      const newMintReview: MintReview = {
        id: result.eventId,
        pubkey: 'user', // Will be set by the signed event
        created_at: result.publishedAt,
        mintUrl: mintUrl,
        rating: reviewData.rating,
        title: `Review for ${result.mintMetadata.url}`,
        content: `[${reviewData.rating}/5] ${reviewData.content}`,
        author: 'You',
        verified: true, // User's own review
        aTag: `${CASHU_MINT_KIND}:${result.mintMetadata.pubkey}:${result.mintMetadata.pubkey}`
      };
      
      setReviews(prev => [newMintReview, ...prev]);
      console.log('✅ Review added to local state');

    } catch (error) {
      console.error('❌ Review submission failed:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [mintUrl]);

  // Initialize NDK once on mount
  useEffect(() => {
    initNDK();
    return cleanup;
  }, [initNDK, cleanup]);

  // Fetch mint pubkey when mintUrl changes
  useEffect(() => {
    if (mintUrl) {
      fetchMintPubkey();
    }
  }, [mintUrl, fetchMintPubkey]);

  // Fetch reviews when NDK is ready (don't wait for mintPubkey since it's optional)
  useEffect(() => {
    console.log('🔄 useReviews fetchReviews effect triggered:', { ndk: !!ndk, mintUrl, mintPubkey });
    if (ndk && mintUrl) {
      console.log('✅ Conditions met, calling fetchReviews...');
      fetchReviews();
    } else {
      console.log('❌ Conditions not met for fetchReviews:', { hasNdk: !!ndk, hasMintUrl: !!mintUrl });
    }
  }, [ndk, mintUrl, mintPubkey]); // Keep mintPubkey to refetch when it becomes available

  return {
    reviews,
    loading,
    submitting,
    connectionStatus,
    submitReview,
    loadMoreReviews,
    mintPubkey, // Export mint pubkey for debugging
    hasMoreReviews,
    isLoadingMore
  };
}; 