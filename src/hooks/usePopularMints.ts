import { useState, useEffect, useRef } from 'react';
import { getSharedNDK } from '../utils/ndk';
import { MINT_RECOMMENDATION_KIND } from '../utils/ndk';

export interface PopularMint {
  mintUrl: string;
  mintName: string;
  domain: string;
  reviewCount: number;
  averageRating: number;
  lastReviewAt: number;
}

export function usePopularMints(limit: number = 10) {
  const [popularMints, setPopularMints] = useState<PopularMint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track reviews per mint, deduplicated by pubkey (one review per user)
  const mintStatsRef = useRef<Map<string, {
    mintName: string;
    domain: string;
    reviews: Map<string, any>; // pubkey -> review data
    totalRating: number;
    lastReviewAt: number;
  }>>(new Map());

  useEffect(() => {
    let sub: any = null;
    let timeoutId: NodeJS.Timeout;

    const fetchPopularMints = async () => {
      try {
        setLoading(true);
        setError(null);
        mintStatsRef.current.clear();

        console.log('🔗 Initializing NDK for popular mints...');
        const ndk = await getSharedNDK();
        console.log('✅ NDK initialized successfully for popular mints');

        console.log('📊 Fetching popular Cashu mints by review count...');
        
        // Filters for Cashu mint reviews (NIP-87)
        const filters = [
          { kinds: [MINT_RECOMMENDATION_KIND], limit: 100 },
          { kinds: [MINT_RECOMMENDATION_KIND], limit: 100, since: Math.floor(Date.now() / 1000) - 86400 * 30 } // Last 30 days
        ];

        console.log('🔍 Popular mints filters:', filters);

        sub = ndk.subscribe(filters, { closeOnEose: true });
        
        let totalEvents = 0;
        let validReviews = 0;
        let uniqueMints = 0;

        sub.on('event', (event: any) => {
          totalEvents++;
          
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
            const rating = ratingTag ? parseInt(ratingTag[1]) : 5;

            // Only process Cashu mint reviews (NIP-87)
            if (referencedKind !== '38172') {
              return;
            }

            // Extract domain from URL
            let domain = mintUrl;
            try {
              const url = new URL(mintUrl);
              domain = url.hostname;
            } catch (e) {
              // If URL parsing fails, use the original string
            }

            // Extract mint name from domain
            const mintName = domain.replace(/^mint\./, '').replace(/^www\./, '');

            // Update stats for this mint
            const existing = mintStatsRef.current.get(mintUrl) || {
              mintName,
              domain,
              reviews: new Map(), // Initialize reviews as a Map
              totalRating: 0,
              lastReviewAt: event.created_at
            };

            // Check if this user has already reviewed this mint
            if (!existing.reviews.has(event.pubkey)) {
              existing.reviews.set(event.pubkey, {
                rating,
                created_at: event.created_at
              });
              existing.totalRating += rating;
              existing.lastReviewAt = Math.max(existing.lastReviewAt, event.created_at);
              validReviews++;
            }

            mintStatsRef.current.set(mintUrl, existing);
            uniqueMints = mintStatsRef.current.size;

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

          } catch (parseError) {
            console.error('❌ Error parsing review event:', parseError);
          }
        });

        sub.on('eose', () => {
          console.log(`
📊 Popular mints analysis complete:
  - Processed ${totalEvents} events
  - Found ${validReviews} valid Cashu reviews
  - Discovered ${uniqueMints} unique Cashu mints`);

          const mintsArray: PopularMint[] = Array.from(mintStatsRef.current.entries())
            .map(([mintUrl, stats]) => ({
              mintUrl,
              mintName: stats.mintName,
              domain: stats.domain,
              reviewCount: stats.reviews.size, // Count unique reviews
              averageRating: stats.reviews.size > 0 ? stats.totalRating / stats.reviews.size : 0,
              lastReviewAt: stats.lastReviewAt
            }))
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, limit);

          console.log(`🏆 Top ${limit} popular Cashu mints:`, mintsArray.map(m => 
            `${m.mintName} (${m.reviewCount} reviews, ${m.averageRating.toFixed(1)} avg)`
          ));

          setPopularMints(mintsArray);
          setLoading(false);
          sub.stop();
        });

        // Timeout fallback
        timeoutId = setTimeout(() => {
          if (loading) {
            const mintsArray: PopularMint[] = Array.from(mintStatsRef.current.entries())
              .map(([mintUrl, stats]) => ({
                mintUrl,
                mintName: stats.mintName,
                domain: stats.domain,
                reviewCount: stats.reviews.size, // Count unique reviews
                averageRating: stats.reviews.size > 0 ? stats.totalRating / stats.reviews.size : 0,
                lastReviewAt: stats.lastReviewAt
              }))
              .sort((a, b) => b.reviewCount - a.reviewCount)
              .slice(0, limit);
            
            setPopularMints(mintsArray);
            setLoading(false);
            
            console.log(`⏰ Popular mints timeout: Found ${mintsArray.length} mints`);
            sub.stop();
          }
        }, 20000); // Increased to 20 seconds for real data only

      } catch (error) {
        console.error('❌ Error fetching popular mints:', error);
        setError('Failed to fetch popular mints');
        setLoading(false);
      }
    };

    fetchPopularMints();

    return () => {
      if (sub) {
        console.log('❌ Popular mints subscription closed unexpectedly');
        sub.stop();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [limit]);

  return { popularMints, loading, error };
} 