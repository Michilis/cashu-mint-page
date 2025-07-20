import { useState, useEffect } from 'react';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { getSharedNDK, CASHU_MINT_KIND, MINT_RECOMMENDATION_KIND } from '../utils/ndk';

interface MintData {
  mintUrl: string;
  mintName: string;
  domain: string;
  reviewCount: number;
  averageRating: number;
}

export const useAllMints = () => {
  const [mints, setMints] = useState<MintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sub: any = null;
    let timeoutId: NodeJS.Timeout;

    const fetchAllMints = async () => {
      try {
        setLoading(true);
        setError(null);

        const ndk = await getSharedNDK();
        if (!ndk) {
          throw new Error('NDK not initialized');
        }

        console.log('🔗 Initializing NDK for all mints...');
        console.log('✅ NDK initialized successfully for all mints');

        // Track mints and reviews
        const mintMap = new Map<string, MintData>();
        const reviewMap = new Map<string, Map<string, { rating: number; created_at: number }>>();

        // First, fetch all mint announcements
        console.log('📊 Fetching all Cashu mint announcements...');
        
        const mintFilters = [
          { kinds: [CASHU_MINT_KIND as any], limit: 1000 }
        ];

        sub = ndk.subscribe(mintFilters, { closeOnEose: true });
        
        sub.on('event', (event: any) => {
          try {
            // Extract mint URL from tags
            const uTag = event.tags.find((tag: any) => tag[0] === 'u');

            if (!uTag || !uTag[1]) {
              return; // Skip events without mint URL
            }

            const mintUrl = uTag[1];
            
            // Extract domain from URL (same logic as usePopularMints)
            let domain = mintUrl;
            try {
              const url = new URL(mintUrl);
              domain = url.hostname;
            } catch (e) {
              // If URL parsing fails, use the original string
            }

            // Extract mint name from domain (same logic as usePopularMints)
            const mintName = domain.replace(/^mint\./, '').replace(/^www\./, '');

            // Initialize mint data if not exists
            if (!mintMap.has(mintUrl)) {
              mintMap.set(mintUrl, {
                mintUrl,
                mintName,
                domain,
                reviewCount: 0,
                averageRating: 0,
              });
            }

            console.log(`📝 Parsing mint announcement:
  Event ID: ${event.id}
  Event kind: ${event.kind}
  u tag (mint URL): ${mintUrl}
  Extracted domain: ${domain}
  Extracted mint name: ${mintName}
  ✅ Successfully parsed mint announcement`);

          } catch (err) {
            console.warn('Error processing mint event:', err);
          }
        });

        // Wait for mint events to complete
        await new Promise((resolve) => {
          sub.on('eose', () => {
            console.log('📊 Found mint announcements:', mintMap.size);
            resolve(void 0);
          });
          
          // Timeout after 10 seconds
          timeoutId = setTimeout(resolve, 10000);
        });

        // Now fetch review events
        console.log('📊 Fetching review events...');
        
        const reviewFilters = [
          { kinds: [MINT_RECOMMENDATION_KIND as any], limit: 1000 }
        ];

        sub = ndk.subscribe(reviewFilters, { closeOnEose: true });
        
        sub.on('event', (event: any) => {
          try {
            // Extract mint URL from tags
            const uTag = event.tags.find((tag: any) => tag[0] === 'u');
            const dTag = event.tags.find((tag: any) => tag[0] === 'd');
            const kTag = event.tags.find((tag: any) => tag[0] === 'k');
            const ratingTag = event.tags.find((tag: any) => tag[0] === 'rating');

            if (!uTag || !uTag[1]) {
              return; // Skip events without mint URL
            }

            const mintUrl = uTag[1];
            const mintPubkey = dTag ? dTag[1] : '';
            const referencedKind = kTag ? kTag[1] : '';
            
            // Parse rating with improved extraction for [X/5] format (same as reviewHelpers.ts)
            let rating = 5;
            
            // First check rating tag
            if (ratingTag) {
              const parsedRating = parseInt(ratingTag[1]);
              if (parsedRating >= 1 && parsedRating <= 5) {
                rating = parsedRating;
              }
            } else {
              // Parse from content - look for [X/5] pattern at beginning first
              const bracketRatingMatch = event.content.match(/^\s*\[([1-5])\/5\]/);
              if (bracketRatingMatch) {
                rating = parseInt(bracketRatingMatch[1]);
              } else {
                // Fallback to other rating formats
                const ratingMatch = event.content.match(/rating[:\s]*([1-5])|([1-5])[\/]5|([1-5])\s*star/i);
                if (ratingMatch) {
                  rating = parseInt(ratingMatch[1] || ratingMatch[2] || ratingMatch[3]) || 5;
                }
              }
            }

            // Only process Cashu mint reviews (NIP-87)
            if (referencedKind !== '38172') {
              return;
            }

            // Validate rating is between 1-5
            if (rating < 1 || rating > 5) {
              console.log(`⚠️ Skipping invalid rating: ${rating} for mint ${mintUrl}`);
              return;
            }

            console.log(`📝 Rating extraction debug:
  Rating tag: ${ratingTag}
  Rating tag value: ${ratingTag?.[1]}
  Content: ${event.content.substring(0, 100)}...
  Parsed rating: ${rating}
  Is valid rating: ${rating >= 1 && rating <= 5}`);

            // Initialize review map for this mint if not exists
            if (!reviewMap.has(mintUrl)) {
              reviewMap.set(mintUrl, new Map());
            }

            const mintReviews = reviewMap.get(mintUrl)!;

            // Check if this user has already reviewed this mint (deduplicate by pubkey)
            if (!mintReviews.has(event.pubkey)) {
              mintReviews.set(event.pubkey, {
                rating,
                created_at: event.created_at
              });
            }

            console.log(`📝 Parsing review:
  Event ID: ${event.id}
  Event kind: ${event.kind}
  d tag (mint pubkey): ${mintPubkey}
  u tag (mint URL): ${mintUrl}
  k tag (referenced kind): ${referencedKind}
  rating tag: ${ratingTag}
  Extracted mint URL: ${mintUrl}
  Extracted rating: ${rating}
  Review type: NIP-87
  ✅ Successfully parsed review`);

          } catch (err) {
            console.warn('Error processing review event:', err);
          }
        });

        // Wait for review events to complete
        await new Promise((resolve) => {
          sub.on('eose', () => {
            console.log('📊 Found review events:', reviewMap.size);
            reviewMap.forEach((reviews, url) => {
              const totalRating = Array.from(reviews.values()).reduce((sum, review) => sum + review.rating, 0);
              const avgRating = reviews.size > 0 ? totalRating / reviews.size : 0;
              console.log(`📊 ${url}: ${reviews.size} reviews, avg ${avgRating.toFixed(1)}`);
            });
            resolve(void 0);
          });
          
          // Timeout after 10 seconds
          timeoutId = setTimeout(resolve, 10000);
        });

        // Update mint data with review information
        reviewMap.forEach((reviews, mintUrl) => {
          const mint = mintMap.get(mintUrl);
          if (mint) {
            const totalRating = Array.from(reviews.values()).reduce((sum, review) => sum + review.rating, 0);
            mint.reviewCount = reviews.size; // Count unique reviews (one per user)
            mint.averageRating = reviews.size > 0 ? totalRating / reviews.size : 0;
            
            console.log(`📊 Final calculation for ${mint.mintName}:`);
            console.log(`  - Total reviews: ${reviews.size}`);
            console.log(`  - Total rating: ${totalRating}`);
            console.log(`  - Average rating: ${mint.averageRating.toFixed(1)}`);
            console.log(`  - Individual ratings:`, Array.from(reviews.values()).map(r => r.rating));
          }
        });

        // Convert to array and sort by name
        const mintsArray = Array.from(mintMap.values()).sort((a, b) => 
          a.mintName.localeCompare(b.mintName)
        );

        console.log('📊 Final mints array:', mintsArray.length, 'mints');
        mintsArray.forEach(mint => {
          console.log(`📊 ${mint.mintName}: ${mint.reviewCount} reviews, ${mint.averageRating.toFixed(1)} avg`);
        });

        setMints(mintsArray);
      } catch (err) {
        console.error('Error fetching all mints:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch mints');
      } finally {
        setLoading(false);
      }
    };

    fetchAllMints();

    return () => {
      if (sub) {
        sub.stop();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return { mints, loading, error };
}; 