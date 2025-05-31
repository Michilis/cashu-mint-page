import { NDKEvent } from '@nostr-dev-kit/ndk';
import { MintReview } from '../types';
import { CASHU_MINT_KIND, MINT_RECOMMENDATION_KIND } from './ndk';

// NIP-87 Rating Scale
export const RATING_SCALE = {
  5: { label: 'Excellent', color: 'text-green-400', description: 'Outstanding service' },
  4: { label: 'Good', color: 'text-blue-400', description: 'Reliable and solid' },
  3: { label: 'Average', color: 'text-yellow-400', description: 'Works as expected' },
  2: { label: 'Poor', color: 'text-orange-400', description: 'Has significant issues' },
  1: { label: 'Avoid', color: 'text-red-400', description: 'Broken or scam' }
};

export const parseNIP87Review = (event: NDKEvent, mintUrl: string): MintReview | null => {
  try {
    const tags = event.tags || [];
    const dTag = tags.find((tag: string[]) => tag[0] === 'd')?.[1]; // Mint pubkey
    const uTag = tags.find((tag: string[]) => tag[0] === 'u')?.[1]; // Mint URL
    const kTag = tags.find((tag: string[]) => tag[0] === 'k')?.[1]; // Referenced kind
    const ratingTag = tags.find((tag: string[]) => tag[0] === 'rating')?.[1];
    const aTag = tags.find((tag: string[]) => tag[0] === 'a')?.[1];
    
    console.log('📝 Parsing review:');
    console.log('  Event ID:', event.id);
    console.log('  Event kind:', event.kind);
    console.log('  d tag (mint pubkey):', dTag);
    console.log('  u tag (mint URL):', uTag);
    console.log('  k tag (referenced kind):', kTag);
    console.log('  rating tag:', ratingTag);
    
    // Must be correct kind (38000)
    if (event.kind !== MINT_RECOMMENDATION_KIND) {
      console.log('  ❌ Wrong kind');
      return null;
    }

    // For proper NIP-87: must have d tag (mint pubkey) AND k tag (38172)
    // For legacy: just needs to be kind 38000 with some identifying info
    const isProperNIP87 = dTag && kTag === CASHU_MINT_KIND.toString();
    const hasIdentifyingInfo = dTag || uTag; // Either pubkey or URL
    
    if (!isProperNIP87 && !hasIdentifyingInfo) {
      console.log('  ❌ Neither proper NIP-87 nor identifiable legacy review');
      return null;
    }

    // Parse rating with improved extraction for [X/5] format
    let rating = 5; // Default to excellent
    
    // First check rating tag
    if (ratingTag) {
      const parsedRating = parseInt(ratingTag);
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

    // Use URL from u tag if available, otherwise fall back to provided mintUrl
    const reviewMintUrl = uTag || mintUrl;

    console.log('  Extracted mint URL:', reviewMintUrl);
    console.log('  Extracted rating:', rating);
    console.log('  Review type:', isProperNIP87 ? 'NIP-87' : 'Legacy');

    const parsedReview = {
      id: event.id,
      pubkey: event.pubkey,
      created_at: event.created_at || Math.floor(Date.now() / 1000),
      mintUrl: reviewMintUrl,
      rating: rating,
      title: extractTitle(event.content),
      content: event.content,
      author: extractAuthor(event, tags),
      verified: false, // TODO: Implement NIP-05 verification
      aTag: aTag // Store reference to mint announcement
    };

    console.log('  ✅ Successfully parsed review');
    return parsedReview;
  } catch (error) {
    console.warn('❌ Error parsing review:', error);
    return null;
  }
};

export const isValidReview = (review: MintReview): boolean => {
  // Basic spam detection and validation
  if (!review.content || review.content.length < 10) return false;
  if (review.content.length > 2000) return false; // Prevent spam
  if (review.rating < 1 || review.rating > 5) return false;
  
  // Check for obvious spam patterns
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf)/i, // Suspicious domains
  ];
  
  return !spamPatterns.some(pattern => pattern.test(review.content));
};

export const isReviewForThisMint = (review: MintReview, mintUrl: string): boolean => {
  console.log('🔍 Checking if review is for this mint:');
  console.log('  Target mint URL:', mintUrl);
  console.log('  Review mint URL:', review.mintUrl);
  
  // Normalize URLs for comparison (remove protocol, trailing slashes, convert to lowercase)
  const normalizeUrl = (url: string) => {
    return url.toLowerCase()
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/\/+$/, '') // Remove trailing slashes
      .replace(/\/$/, ''); // Remove any remaining slash
  };
  
  const normalizedMintUrl = normalizeUrl(mintUrl);
  const normalizedReviewUrl = normalizeUrl(review.mintUrl);
  
  console.log('  Normalized target:', normalizedMintUrl);
  console.log('  Normalized review:', normalizedReviewUrl);
  
  // Extract domain for comparison
  const mintDomain = normalizedMintUrl.split('/')[0];
  const reviewDomain = normalizedReviewUrl.split('/')[0];
  
  console.log('  Target domain:', mintDomain);
  console.log('  Review domain:', reviewDomain);
  
  // STRICT FILTERING: Only allow exact domain matches
  
  // 1. Direct URL match (most reliable)
  if (normalizedReviewUrl === normalizedMintUrl) {
    console.log('  ✅ MATCH: Direct URL match');
    return true;
  }
  
  // 2. Exact domain match only (no subdomain flexibility)
  if (reviewDomain === mintDomain) {
    console.log('  ✅ MATCH: Exact domain match');
    return true;
  }
  
  // 3. Handle www variations only for the exact same domain
  const removeWww = (domain: string) => domain.replace(/^www\./, '');
  const mintDomainNoWww = removeWww(mintDomain);
  const reviewDomainNoWww = removeWww(reviewDomain);
  
  if (mintDomainNoWww === reviewDomainNoWww && mintDomainNoWww.includes('.')) {
    console.log('  ✅ MATCH: Domain match (www variation)');
    return true;
  }
  
  // NO content-based matching, NO subdomain matching - too prone to false positives
  
  console.log('  ❌ NO MATCH: Review not for this mint (strict filtering)');
  return false;
};

export const aggregateReviews = (reviews: MintReview[]): MintReview[] => {
  // Group reviews by pubkey to handle replaceable events (NIP-33)
  const reviewMap = new Map<string, MintReview>();
  
  reviews.forEach(review => {
    const existing = reviewMap.get(review.pubkey);
    if (!existing || review.created_at > existing.created_at) {
      reviewMap.set(review.pubkey, review);
    }
  });
  
  // Sort by creation time (newest first)
  return Array.from(reviewMap.values()).sort((a, b) => b.created_at - a.created_at);
};

export const extractTitle = (content: string): string => {
  // Remove rating prefix if present (e.g., "[5/5]", "[4/5]")
  const cleanContent = content.replace(/^\s*\[\d\/5\]\s*/, '');
  
  // Extract first meaningful sentence as title
  const sentences = cleanContent.split(/[.!?]/);
  const firstSentence = sentences[0]?.trim();
  if (firstSentence && firstSentence.length > 5 && firstSentence.length < 120) {
    return firstSentence;
  }
  
  const lines = cleanContent.split('\n');
  const firstLine = lines[0]?.trim();
  if (firstLine && firstLine.length > 5 && firstLine.length < 120) {
    return firstLine;
  }
  
  return cleanContent.length > 60 ? cleanContent.substring(0, 60) + '...' : cleanContent;
};

// Clean review content by removing rating prefixes and extra metadata
export const cleanReviewContent = (content: string): string => {
  let cleaned = content;
  
  // Remove rating prefix patterns
  cleaned = cleaned.replace(/^\s*\[\d\/5\]\s*/, '');
  
  // Remove "Reviewing: [URL]" footer patterns
  cleaned = cleaned.replace(/\n\nReviewing:\s*https?:\/\/[^\s]+$/i, '');
  
  // Remove other common suffixes
  cleaned = cleaned.replace(/\n\n.*mint.*$/i, '');
  
  return cleaned.trim();
};

export const extractAuthor = (event: NDKEvent, tags: string[][]): string => {
  // Try to find name in tags or use shortened pubkey
  const nameTag = tags.find((tag: string[]) => tag[0] === 'name')?.[1];
  if (nameTag) return nameTag;
  
  return `${event.pubkey?.substring(0, 8)}...` || 'Anonymous';
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const loadDemoReviews = (mintUrl: string): MintReview[] => {
  return [
    {
      id: 'demo1',
      pubkey: 'demo_pubkey_1',
      created_at: Math.floor(Date.now() / 1000) - 86400,
      mintUrl: mintUrl,
      rating: 5,
      title: 'Excellent mint service',
      content: `[5/5] Fast and reliable transactions for ${mintUrl}. Great uptime and supports all major nuts. Highly recommended!`,
      author: 'Alice',
      verified: false
    },
    {
      id: 'demo2',
      pubkey: 'demo_pubkey_2',
      created_at: Math.floor(Date.now() / 1000) - 172800,
      mintUrl: mintUrl,
      rating: 4,
      title: 'Good experience overall',
      content: `[4/5] Using ${mintUrl} for weeks now. Works well but could use better documentation. Lightning integration is smooth.`,
      author: 'Bob',
      verified: false
    },
    {
      id: 'demo3',
      pubkey: 'demo_pubkey_3',
      created_at: Math.floor(Date.now() / 1000) - 259200,
      mintUrl: mintUrl,
      rating: 5,
      title: 'Excellent performance',
      content: `[5/5] ${mintUrl} does what it says and more! Great service with reliable token swaps.`,
      author: 'Charlie',
      verified: false
    }
  ];
}; 