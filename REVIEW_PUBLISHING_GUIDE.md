# How to Publish Cashu Mint Reviews with Nostr-NDK

This guide explains the complete implementation of publishing user reviews for Cashu mints using NIP-87 on Nostr with nostr-ndk. Each review is a `kind:38000` event containing metadata about the mint, a rating, and user content.

## 🎯 Overview

Our implementation follows the exact NIP-87 specification and provides a complete, production-ready solution for publishing Cashu mint reviews.

## 📋 Requirements

- **Node.js** or frontend environment
- **@nostr-dev-kit/ndk** installed: `npm install @nostr-dev-kit/ndk`
- **Mint's URL** and **public key** (from `/v1/info`)
- **Browser extension** (optional, for signing - e.g., Alby)

## 🏗️ Architecture

```
User Input (Rating + Content)
        ↓
ReviewForm Component
        ↓
CashuReviewPublisher Service
        ↓
NIP-87 Event Creation
        ↓
Nostr Relay Publishing
        ↓
Local State Update
```

## 🔧 Implementation

### Step 1: Initialize NDK Connection

```typescript
// services/reviewPublisher.ts
const RELAY_URLS = [
  "wss://relay.cashumints.space",
  "wss://relay.azzamo.net", 
  "wss://relay.damus.io"
];

export class CashuReviewPublisher {
  async initialize(): Promise<void> {
    this.ndk = new NDK({
      explicitRelayUrls: RELAY_URLS
    });
    
    await this.ndk.connect();
    
    // Browser extension detection for signing
    if (typeof window !== 'undefined' && (window as any).nostr) {
      console.log('🔐 Browser extension detected');
    }
  }
}
```

### Step 2: Fetch Mint Metadata

```typescript
async getMintMetadata(mintUrl: string): Promise<MintMetadata> {
  // Fetch from: https://yourmint.com/v1/info
  const pubkey = await getMintPubkey(mintUrl);
  
  return {
    url: mintUrl,
    pubkey: pubkey // from /v1/info
  };
}
```

### Step 3: Create NIP-87 Compliant Event

```typescript
createReviewEvent(mint: MintMetadata, review: ReviewData): NDKEvent {
  const event = new NDKEvent(this.ndk);
  event.kind = 38000; // MINT_RECOMMENDATION_KIND
  event.created_at = Math.floor(Date.now() / 1000);
  event.content = `[${review.rating}/5] ${review.content}`;

  // NIP-87 Required Tags
  event.tags = [
    ["k", "38172"],           // Event kind being recommended
    ["d", mint.pubkey],       // Mint identifier (pubkey from /v1/info)
    ["u", mint.url],          // URL of the mint
    ["a", `38172:${mint.pubkey}:${mint.pubkey}`, relay], // Reference
    ["rating", review.rating.toString()] // Rating (1–5)
  ];

  return event;
}
```

### Step 4: Sign and Publish

```typescript
async publishReview(event: NDKEvent): Promise<string> {
  // Sign the event (if signer available)
  if (this.ndk.signer) {
    await this.ndk.signer.blockUntilReady();
    await event.sign();
  }

  // Publish to relays
  await event.publish();
  return event.id;
}
```

## 🎮 Complete Usage Example

```typescript
import { publishCashuMintReview } from './services/reviewPublisher';

try {
  const result = await publishCashuMintReview('https://21mint.me', {
    rating: 5,
    content: 'Fast mint with low fees. Highly recommend!'
  });
  
  console.log('Review published:', result);
  // Output: { eventId: "abc123...", mintMetadata: {...}, publishedAt: 1674567890 }
} catch (error) {
  console.error('Failed to publish review:', error);
}
```

## 📊 Event Structure

The published event follows this exact structure:

```json
{
  "kind": 38000,
  "created_at": 1674567890,
  "content": "[5/5] Fast mint with low fees. Highly recommend!",
  "tags": [
    ["k", "38172"],
    ["d", "034c881b4cdb63e39ac18d1efe11c36d8c9b2ed9e0d62702d725a7a1786a3028bd"],
    ["u", "https://21mint.me"],
    ["a", "38172:034c881b4c...:034c881b4c...", "wss://relay.cashumints.space"],
    ["rating", "5"]
  ],
  "id": "abc123...",
  "pubkey": "user_pubkey...",
  "sig": "signature..."
}
```

## 🏷️ Tag Breakdown

| Tag | Purpose | Example |
|-----|---------|---------|
| `k` | Event kind being recommended | `"38172"` |
| `d` | Mint identifier (pubkey from /v1/info) | `"034c881b4c..."` |
| `u` | URL of the mint | `"https://21mint.me"` |
| `a` | Reference to kind:38172 announcement | `"38172:pubkey:pubkey"` |
| `rating` | Rating (1–5) as string | `"5"` |

## ✅ Validation Rules

```typescript
export function validateReview(review: ReviewData): string[] {
  const errors: string[] = [];

  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!review.content || review.content.trim().length < 10) {
    errors.push('Review content must be at least 10 characters');
  }

  if (review.content && review.content.length > 2000) {
    errors.push('Review content must be less than 2000 characters');
  }

  return errors;
}
```

## 🎨 UI Components

### ReviewForm Component

```typescript
// Simplified form with only rating and content
const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [review, setReview] = useState({
    rating: 5,
    content: ''
  });

  const handleSubmit = async () => {
    await onSubmit(review);
  };

  return (
    <div>
      <StarRating rating={review.rating} onRatingChange={setRating} />
      <textarea 
        value={review.content}
        onChange={(e) => setReview(prev => ({ ...prev, content: e.target.value }))}
        placeholder="Share your experience..."
      />
      <button onClick={handleSubmit}>Publish Review</button>
    </div>
  );
};
```

## 🔄 Integration with useReviews Hook

```typescript
const submitReview = useCallback(async (reviewData: ReviewData) => {
  // Validate
  const errors = validateReview(reviewData);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  // Publish using comprehensive service
  const result = await publishCashuMintReview(mintUrl, reviewData);
  
  // Update local state
  const newReview: MintReview = {
    id: result.eventId,
    rating: reviewData.rating,
    content: `[${reviewData.rating}/5] ${reviewData.content}`,
    // ... other fields
  };
  
  setReviews(prev => [newReview, ...prev]);
}, [mintUrl]);
```

## 🎯 Best Practices

1. **Relay Redundancy**: Use multiple trusted relays for better availability
2. **Browser Extension Integration**: Support Alby, nos2x for easy signing
3. **Validation**: Always validate input before publishing
4. **Error Handling**: Provide clear error messages to users
5. **Local State**: Update UI immediately after successful publish
6. **NIP-33**: Support replaceable events for review editing

## 🔍 Testing

```typescript
// Test the complete flow
describe('Review Publishing', () => {
  test('publishes valid review', async () => {
    const result = await publishCashuMintReview('https://21mint.me', {
      rating: 5,
      content: 'Great mint!'
    });
    
    expect(result.eventId).toBeDefined();
    expect(result.mintMetadata.pubkey).toBeDefined();
  });
});
```

## 🚀 Production Deployment

1. **Environment Variables**: Set relay URLs via env vars
2. **Error Monitoring**: Track failed publishes
3. **Rate Limiting**: Prevent spam publishing
4. **Content Moderation**: Validate review content
5. **Analytics**: Track publish success rates

## 📝 Summary

This implementation provides:

✅ **Complete NIP-87 compliance**  
✅ **Browser extension support**  
✅ **Comprehensive validation**  
✅ **Error handling**  
✅ **Local state management**  
✅ **Production-ready architecture**

The flow ensures reliable, standards-compliant publishing of Cashu mint reviews to the Nostr network. 