# Cashu Mint Review Publishing Guide

A comprehensive guide for implementing decentralized Cashu mint reviews using the NIP-87 protocol on Nostr with NDK. This implementation provides a complete, production-ready solution for publishing and fetching mint reviews.

🌐 **Live Demo**: [https://mintpage.azzamo.net](https://mintpage.azzamo.net)

## 🎯 Overview

Our implementation follows the NIP-87 specification and provides:
- **Decentralized reviews** stored on Nostr relays
- **Browser extension signing** (Alby, nos2x, Flamingo)
- **Multi-relay architecture** for reliability
- **Real-time profile fetching** for review authors
- **Comprehensive validation** and spam protection
- **Responsive UI components** with modern design

## 📋 Requirements

### Development Dependencies
```bash
npm install @nostr-dev-kit/ndk @types/node
```

### Browser Extensions (for users)
- **[Alby](https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe)** (Recommended)
- **[nos2x](https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp)**
- **[Flamingo](https://chrome.google.com/webstore/detail/flamingo/blndijckeohkahjephlcdpbmohmbgjip)**

### API Access
- **Mint `/v1/info` endpoint** for pubkey retrieval
- **Network access** to Nostr relays

## 🏗️ Architecture

```
User Input (Rating + Content)
        ↓
ReviewForm Component (Browser Extension Detection)
        ↓
CashuReviewPublisher Service
        ↓
NIP-87 Event Creation + Direct Signing
        ↓
Multi-Relay Publishing
        ↓
useReviews Hook (State Management)
        ↓
ReviewsCard (Real-time Display)
```

## 🔧 Implementation

### Step 1: Multi-Relay NDK Configuration

```typescript
// utils/ndk.ts
export const PROFILE_RELAYS = [
  'wss://relay.cashumints.space', // Primary mint relay
  'wss://relay.damus.io', // Popular relay with many profiles
  'wss://nos.lol', // Another popular relay
  'wss://relay.snort.social', // Snort relay
  'wss://relay.primal.net', // Primal relay
  'wss://relay.azzamo.net', // Secondary relay
];

export const initializeProfileNDK = async (): Promise<NDK> => {
  const ndkInstance = new NDK({
    explicitRelayUrls: PROFILE_RELAYS,
    enableOutboxModel: true, // Enable for better profile discovery
  });

  await ndkInstance.connect();
  return ndkInstance;
};
```

### Step 2: Browser Extension Integration

```typescript
// services/reviewPublisher.ts
export class CashuReviewPublisher {
  async initialize(): Promise<void> {
    this.ndk = new NDK({
      explicitRelayUrls: RELAY_URLS
    });

    try {
      await this.ndk.connect();
      
      // Browser extension detection and setup
      if (typeof window !== 'undefined') {
        if ((window as any).nostr) {
          // Test extension availability
          const pubkey = await (window as any).nostr.getPublicKey();
          console.log('✅ Browser signer ready, pubkey:', pubkey.substring(0, 16) + '...');
        } else {
          console.log('⚠️ No browser extension detected');
        }
      }
      
      this.isConnected = true;
    } catch (error) {
      throw new Error('Failed to connect to Nostr relays');
    }
  }
}
```

### Step 3: Updated NIP-87 Event Structure

```typescript
async publishReview(mintInfo: MintMetadata, reviewData: ReviewData): Promise<{
  eventId: string;
  publishedAt: number;
  mintMetadata: MintMetadata;
}> {
  // Check for browser extension
  if (typeof window === 'undefined' || !(window as any).nostr) {
    throw new Error('Browser extension required: Please install a Nostr extension like Alby, nos2x, or Flamingo');
  }

  const event = new NDKEvent(this.ndk);
  event.kind = MINT_RECOMMENDATION_KIND; // 38000
  event.content = `[${reviewData.rating}/5] ${reviewData.content}`;
  
  // Updated NIP-87 tag structure
  event.tags = [
    ['k', CASHU_MINT_KIND.toString()], // 38172 - Cashu mint kind
    ['u', mintInfo.url, 'cashu'], // Mint URL with protocol identifier
    ['d', mintInfo.pubkey] // Mint's pubkey as identifier (NIP-33)
  ];

  try {
    // Direct browser extension signing
    const rawEvent = {
      kind: event.kind,
      created_at: event.created_at || Math.floor(Date.now() / 1000),
      tags: event.tags,
      content: event.content,
      pubkey: await (window as any).nostr.getPublicKey()
    };
    
    // Sign with browser extension
    const signedEvent = await (window as any).nostr.signEvent(rawEvent);
    
    // Update NDK event with signed data
    event.id = signedEvent.id;
    event.sig = signedEvent.sig;
    event.pubkey = signedEvent.pubkey;
    event.created_at = signedEvent.created_at;
    
    // Publish to relays
    const relays = await event.publish();
    
    return {
      eventId: event.id,
      publishedAt: event.created_at,
      mintMetadata: mintInfo
    };
  } catch (error) {
    // Enhanced error handling
    if (error instanceof Error) {
      if (error.message.includes('denied') || error.message.includes('rejected')) {
        throw new Error('Publishing cancelled: You need to approve the signing request in your browser extension');
      } else if (error.message.includes('signer') || error.message.includes('sign')) {
        throw new Error('Signing failed: Please check your browser extension and try again');
      }
    }
    throw new Error('Failed to publish review. Please check your internet connection and browser extension');
  }
}
```

### Step 4: Real-time Review Fetching with Profile Integration

```typescript
// hooks/useReviews.ts
export const useReviews = (mintUrl: string) => {
  const [reviews, setReviews] = useState<MintReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile cache for performance
  const profileCache = new Map<string, UserProfile | null>();
  
  const fetchReviews = useCallback(async () => {
    const ndk = await initializeNDK();
    const profileNdk = await initializeProfileNDK();
    
    // Multiple filter strategies for comprehensive review fetching
    const filters: NDKFilter[] = [
      {
        kinds: [MINT_RECOMMENDATION_KIND], // 38000
        "#d": [mintPubkey], // Use mint pubkey as identifier
        "#k": [CASHU_MINT_KIND.toString()], // 38172 - Cashu mint kind
        limit: 500
      },
      // Fallback filters for legacy reviews
      {
        kinds: [MINT_RECOMMENDATION_KIND],
        "#u": [mintUrl, mintUrl.replace(/\/$/, ''), `${mintUrl}/`],
        limit: 500
      }
    ];

    const sub = ndk.subscribe(filters, { closeOnEose: true });
    
    sub.on('event', async (event: NDKEvent) => {
      const review = parseNIP87Review(event, mintUrl);
      if (review && isValidReview(review)) {
        // Fetch author profile from multiple relays
        try {
          const user = profileNdk.getUser({ pubkey: review.pubkey });
          const userProfile = await user.fetchProfile();
          // Update review with profile data
        } catch (error) {
          console.warn('Failed to fetch profile for:', review.pubkey);
        }
        
        setReviews(prev => aggregateReviews([...prev, review]));
      }
    });
  }, [mintUrl]);
  
  return { reviews, loading, submitReview, loadMoreReviews };
};
```

## 🎨 Enhanced UI Components

### ReviewForm with Extension Detection

```typescript
// components/reviews/ReviewForm.tsx
const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  
  // Browser extension detection
  const hasNostrExtension = typeof window !== 'undefined' && (window as any).nostr;

  return (
    <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
      {/* Extension requirement notification */}
      {!hasNostrExtension && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium mb-1">Browser Extension Required</p>
              <p className="text-blue-200 text-xs">
                To publish reviews, please install a Nostr browser extension like{' '}
                <a href="https://chrome.google.com/webstore/detail/alby/..." 
                   className="underline">Alby</a>, {' '}
                <a href="https://chrome.google.com/webstore/detail/nos2x/..." 
                   className="underline">nos2x</a>, or{' '}
                <a href="https://chrome.google.com/webstore/detail/flamingo/..." 
                   className="underline">Flamingo</a>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Interactive star rating */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star className={`w-8 h-8 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
              }`} />
            </button>
          ))}
        </div>

        {/* Content textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          rows={4}
          minLength={10}
          maxLength={2000}
          required
        />

        {/* Submit button - disabled without extension */}
        <button
          type="submit"
          disabled={!content.trim() || !hasNostrExtension}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg"
        >
          Publish Review
        </button>
      </form>
    </div>
  );
};
```

### ReviewItem with Profile Display

```typescript
// components/reviews/ReviewItem.tsx
const ReviewItem: React.FC<{ review: MintReview }> = ({ review }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile with caching
  useEffect(() => {
    const fetchProfile = async () => {
      // Check cache first
      if (profileCache.has(review.pubkey)) {
        setProfile(profileCache.get(review.pubkey));
        setLoadingProfile(false);
        return;
      }

      try {
        const ndk = await initializeProfileNDK();
        const user = ndk.getUser({ pubkey: review.pubkey });
        const userProfile = await user.fetchProfile();
        
        profileCache.set(review.pubkey, userProfile);
        setProfile(userProfile);
      } catch (error) {
        // Fallback to direct kind:0 event fetch
        const profileEvents = await ndk.fetchEvents({
          kinds: [0],
          authors: [review.pubkey],
          limit: 1
        });
        
        if (profileEvents.size > 0) {
          const profileData = JSON.parse(Array.from(profileEvents)[0].content);
          const profile = {
            name: profileData.name,
            displayName: profileData.display_name,
            image: profileData.picture,
            // ... other fields
          };
          profileCache.set(review.pubkey, profile);
          setProfile(profile);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [review.pubkey]);

  return (
    <div className="bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-700/70 transition-colors">
      {/* Profile display with avatar and metadata */}
      <div className="flex items-start space-x-3">
        <img 
          src={profile?.image || '/default-avatar.png'}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="font-medium text-white">
            {profile?.displayName || profile?.name || 'Anonymous'}
          </h4>
          <StarRating rating={review.rating} />
          <p className="text-gray-300 mt-2">{cleanReviewContent(review.content)}</p>
        </div>
      </div>
    </div>
  );
};
```

## 📊 Updated Event Structure

```json
{
  "kind": 38000,
  "created_at": 1748721929,
  "content": "[5/5] Great mint! Fast transactions and reliable service.",
  "tags": [
    ["k", "38172"],
    ["u", "https://21mint.me", "cashu"],
    ["d", "g02otmd6dpqhdkct"]
  ],
  "id": "81cfaf7294f0d1bbb2a876451e7e7caeed7d9c79f664f16fbba2e2cc45e0faaa",
  "pubkey": "972f233aa467bc9804032c0bce0a117daead5473c56c91e811a216bdd08c08cf",
  "sig": "signature..."
}
```

## 🔍 Enhanced Review Parsing

```typescript
// utils/reviewHelpers.ts
export const parseNIP87Review = (event: NDKEvent, mintUrl: string): MintReview | null => {
  const tags = event.tags || [];
  const dTag = tags.find((tag: string[]) => tag[0] === 'd')?.[1];
  const uTag = tags.find((tag: string[]) => tag[0] === 'u')?.[1];
  const kTag = tags.find((tag: string[]) => tag[0] === 'k')?.[1];
  
  // Support both proper NIP-87 and legacy formats
  const isProperNIP87 = dTag && kTag === CASHU_MINT_KIND.toString();
  const isLegacyReview = uTag && matchesMintUrl(uTag, mintUrl);
  
  if (!isProperNIP87 && !isLegacyReview) {
    return null;
  }

  // Parse rating from content [X/5] format or default to 5
  let rating = 5; // Default to excellent for N/A ratings
  const bracketRatingMatch = event.content.match(/^\s*\[([1-5])\/5\]/);
  if (bracketRatingMatch) {
    rating = parseInt(bracketRatingMatch[1]);
  }

  return {
    id: event.id,
    pubkey: event.pubkey,
    created_at: event.created_at || Math.floor(Date.now() / 1000),
    mintUrl: uTag || mintUrl,
    rating,
    content: event.content,
    author: extractAuthor(event, tags),
    verified: false,
    aTag: tags.find((tag: string[]) => tag[0] === 'a')?.[1]
  };
};
```

## ✅ Comprehensive Validation

```typescript
export function validateReview(review: ReviewData): string[] {
  const errors: string[] = [];

  // Rating validation
  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  // Content validation
  if (!review.content || review.content.trim().length < 10) {
    errors.push('Review content must be at least 10 characters');
  }

  if (review.content && review.content.length > 2000) {
    errors.push('Review content must be less than 2000 characters');
  }

  // Spam detection
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf)/i, // Suspicious domains
  ];
  
  if (spamPatterns.some(pattern => pattern.test(review.content))) {
    errors.push('Content appears to be spam');
  }

  return errors;
}
```

## 🎯 Production Best Practices

### Error Handling

```typescript
try {
  const result = await publishCashuMintReview(mintUrl, reviewData);
  console.log('✅ Review published:', result.eventId);
} catch (error) {
  if (error.message.includes('Browser extension required')) {
    // Show extension installation guide
  } else if (error.message.includes('denied')) {
    // User cancelled signing
  } else {
    // Network or other error
  }
}
```

### Performance Optimization

- **Profile Caching**: Avoid re-fetching same user profiles
- **Batch Updates**: Update review state once when all data loaded
- **Lazy Loading**: Load more reviews with pagination
- **Connection Pooling**: Reuse NDK connections

### Security Measures

- **Signature Verification**: All events must be properly signed
- **Content Validation**: Length and format requirements
- **Spam Detection**: Pattern matching for suspicious content
- **Rate Limiting**: Prevent review spam

## 🚀 Deployment Configuration

### Environment Variables

```env
VITE_ENABLE_CONTACT=true
VITE_ENABLE_MOTD=true
VITE_ENABLE_ICON=true
VITE_ENABLE_TOS=true
VITE_ENABLE_NUT_TABLE=true
VITE_PORT=5174
```

### Production Build

```bash
npm run build
npm run serve  # Serves on port 5174
```

### Systemd Service

```ini
[Unit]
Description=Cashu Mint Page - Static Web Application
After=network.target

[Service]
Type=simple
User=cashupage
WorkingDirectory=/home/cashupage/cashu-mint-page
ExecStart=/usr/bin/npm run serve
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 📈 Monitoring & Analytics

### Key Metrics
- Review publish success rate
- Browser extension adoption
- Profile fetch success rate
- Relay connection health
- User engagement metrics

### Error Tracking
- Failed review publishes
- Extension compatibility issues
- Network connectivity problems
- Invalid mint URLs

## 🔗 Integration Examples

### Complete Review Publishing Flow

```typescript
// Complete implementation example
const handleReviewSubmit = async (reviewData: { rating: number; content: string }) => {
  try {
    // Step 1: Validate input
    const errors = validateReview(reviewData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Step 2: Check browser extension
    if (!window.nostr) {
      throw new Error('Browser extension required');
    }

    // Step 3: Publish review
    const result = await publishCashuMintReview(mintUrl, reviewData);
    
    // Step 4: Update local state
    const newReview: MintReview = {
      id: result.eventId,
      pubkey: 'user',
      created_at: result.publishedAt,
      mintUrl,
      rating: reviewData.rating,
      content: `[${reviewData.rating}/5] ${reviewData.content}`,
      author: 'You',
      verified: true
    };
    
    setReviews(prev => [newReview, ...prev]);
    
    // Step 5: Success feedback
    console.log('✅ Review published successfully');
    
  } catch (error) {
    console.error('❌ Review publication failed:', error);
    // Handle specific error types
  }
};
```

## 📝 Summary

This implementation provides a complete, production-ready solution for Cashu mint reviews with:

✅ **NIP-87 Protocol Compliance**  
✅ **Browser Extension Integration** (Alby, nos2x, Flamingo)  
✅ **Multi-Relay Architecture** for reliability  
✅ **Real-time Profile Fetching** from multiple relays  
✅ **Comprehensive Validation** and spam protection  
✅ **Modern UI Components** with responsive design  
✅ **Performance Optimization** with caching  
✅ **Production Deployment** configuration  
✅ **Error Handling** and user feedback  
✅ **Security Best Practices**  

The system ensures reliable, decentralized publishing and fetching of Cashu mint reviews while providing an excellent user experience through modern UI components and comprehensive error handling. 