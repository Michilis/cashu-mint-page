import { useState, useEffect, useRef } from 'react';
import { getSharedNDK } from '../utils/ndk';
import { MINT_RECOMMENDATION_KIND } from '../utils/ndk';

export interface ReviewWithMint {
  id: string;
  pubkey: string;
  content: string;
  title: string;
  rating: number;
  mintUrl: string;
  created_at: number;
  mintName: string;
  mintIcon?: string;
}

export function useGlobalReviews(limit: number = 10) {
  const [recentReviews, setRecentReviews] = useState<ReviewWithMint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchedReviewsRef = useRef<ReviewWithMint[]>([]);

  useEffect(() => {
    let sub: any = null;
    let timeoutId: NodeJS.Timeout;

    const fetchGlobalReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        fetchedReviewsRef.current = [];

        console.log('🔗 Initializing NDK for global reviews...');
        const ndk = await getSharedNDK();
        console.log('✅ NDK initialized successfully for global reviews');

        console.log('🌍 Fetching recent Cashu mint reviews (excluding Fedi)...');
        
        // Filters for Cashu mint reviews (NIP-87)
        const filters = [
          { kinds: [MINT_RECOMMENDATION_KIND], limit: 100 },
          { kinds: [MINT_RECOMMENDATION_KIND], limit: 100, since: Math.floor(Date.now() / 1000) - 86400 * 30 } // Last 30 days
        ];

        console.log('🔍 Cashu-only review filters:', filters);

        sub = ndk.subscribe(filters, { closeOnEose: true });
        
        let totalEvents = 0;
        let validReviews = 0;
        let excludedReviews = 0;

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
              excludedReviews++;
              return;
            }

            // Check if we already have this review (deduplication)
            const existingReview = fetchedReviewsRef.current.find(r => r.id === event.id);
            if (existingReview) {
              return; // Skip duplicate
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

            // Extract title from content (first line or first 50 chars)
            const contentLines = event.content.split('\n');
            const title = contentLines[0]?.trim() || event.content.substring(0, 50);

            const review: ReviewWithMint = {
              id: event.id,
              pubkey: event.pubkey,
              content: event.content,
              title,
              rating,
              mintUrl,
              created_at: event.created_at,
              mintName,
              mintIcon: undefined
            };

            fetchedReviewsRef.current.push(review);
            validReviews++;

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
  ✅ Successfully parsed review
  ✅ Valid Cashu mint review (${validReviews} total)
  ✅ Added Cashu review (total: ${fetchedReviewsRef.current.length})`);

          } catch (parseError) {
            console.error('❌ Error parsing review event:', parseError);
          }
        });

        sub.on('eose', () => {
          console.log(`
🏁 End of Cashu reviews: processed ${totalEvents} events total
✅ Found ${validReviews} valid Cashu mint reviews
❌ Excluded ${excludedReviews} non-Cashu reviews
🎯 Final Cashu reviews result: ${fetchedReviewsRef.current.length} recent reviews`);

          const sortedReviews = [...fetchedReviewsRef.current]
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, limit);

          setRecentReviews(sortedReviews);
          setLoading(false);
          sub.stop();
        });

        // Timeout fallback
        timeoutId = setTimeout(() => {
          if (loading) {
            const sortedReviews = [...fetchedReviewsRef.current]
              .sort((a, b) => b.created_at - a.created_at)
              .slice(0, limit);
            
            setRecentReviews(sortedReviews);
            setLoading(false);
            
            console.log(`⏰ Cashu reviews timeout: Found ${sortedReviews.length} reviews`);
            sub.stop();
          }
        }, 15000); // Increased to 15 seconds for real data only

      } catch (error) {
        console.error('❌ Error fetching global reviews:', error);
        setError('Failed to fetch global reviews');
        setLoading(false);
      }
    };

    fetchGlobalReviews();

    return () => {
      if (sub) {
        console.log('❌ Cashu reviews subscription closed unexpectedly');
        sub.stop();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [limit]);

  return { recentReviews, loading, error };
} 