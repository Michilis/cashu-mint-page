import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import { getMintPubkey } from './api';

// NIP-87 Constants
const MINT_RECOMMENDATION_KIND = 38000; // Review event kind
const CASHU_MINT_KIND = 38172; // Cashu mint announcement kind

// Relay configuration - using the same pool as the main app
const RELAY_URLS = [
  "wss://relay.cashumints.space", // Primary Cashu mint relay
  "wss://relay.damus.io", // Popular relay with many profiles
  "wss://relay.snort.social", // Snort relay
  "wss://relay.primal.net", // Primal relay
];

export interface ReviewData {
  rating: number; // 1-5
  content: string;
}

export interface MintMetadata {
  url: string;
  pubkey: string;
  name?: string;
}

/**
 * Complete Cashu Mint Review Publisher
 * Implements NIP-87 specification for publishing mint reviews
 */
export class CashuReviewPublisher {
  private ndk: NDK | null = null;
  private isConnected = false;

  /**
   * Step 1: Initialize NDK
   * Sets up connection to Nostr relays
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing NDK for review publishing...');
    
    this.ndk = new NDK({
      explicitRelayUrls: RELAY_URLS
    });

    try {
      await this.ndk.connect();
      console.log('✅ NDK connected to relays:', RELAY_URLS);
      
      // Attempt to use browser signer (e.g., Alby, nos2x, etc.)
      if (typeof window !== 'undefined') {
        console.log('🔐 Checking for browser extensions...');
        
        // Check for window.nostr (NIP-07)
        if ((window as any).nostr) {
          console.log('✅ Browser extension detected!');
          try {
            // Test if we can get the public key (this will trigger permission request)
            const pubkey = await (window as any).nostr.getPublicKey();
            console.log('✅ Browser signer ready, pubkey:', pubkey.substring(0, 16) + '...');
            
            // NDK should automatically detect and use browser extensions
            // We don't need to manually configure the signer
            console.log('✅ Browser extension available for NDK');
          } catch (error) {
            console.error('❌ Browser signer setup failed:', error);
            console.log('💡 User may have denied permission or extension not working');
          }
        } else {
          console.log('⚠️ No browser extension detected');
          console.log('💡 Please install a Nostr extension like Alby, nos2x, or Flamingo');
        }
      }
      
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Failed to initialize NDK:', error);
      throw new Error('Failed to connect to Nostr relays');
    }
  }

  /**
   * Step 2: Get Mint Metadata
   * Fetches mint pubkey from /v1/info endpoint
   */
  async getMintMetadata(mintUrl: string): Promise<MintMetadata> {
    console.log('🔑 Fetching mint metadata from:', mintUrl);
    
    try {
      // Get mint pubkey from /v1/info endpoint
      const pubkey = await getMintPubkey(mintUrl);
      
      if (!pubkey) {
        throw new Error('Could not fetch mint pubkey from /v1/info');
      }

      const metadata: MintMetadata = {
        url: mintUrl,
        pubkey: pubkey
      };

      console.log('✅ Mint metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('❌ Failed to get mint metadata:', error);
      throw new Error(`Failed to fetch mint information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Step 3: Create Review Event
   * Creates NIP-87 compliant kind:38000 event
   */
  createReviewEvent(mint: MintMetadata, review: ReviewData): NDKEvent {
    if (!this.ndk) {
      throw new Error('NDK not initialized');
    }

    console.log('📝 Creating NIP-87 review event...');

    // Validate rating
    if (review.rating < 1 || review.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate content
    if (!review.content || review.content.trim().length < 10) {
      throw new Error('Review content must be at least 10 characters');
    }

    if (review.content.length > 2000) {
      throw new Error('Review content must be less than 2000 characters');
    }

    // Create the event
    const event = new NDKEvent(this.ndk);
    event.kind = MINT_RECOMMENDATION_KIND; // 38000
    event.created_at = Math.floor(Date.now() / 1000);
    event.content = `[${review.rating}/5] ${review.content.trim()}`;

    // NIP-87 Required Tags
    event.tags = [
      ["k", CASHU_MINT_KIND.toString()], // "38172" - Event kind being recommended
      ["d", mint.pubkey], // Mint identifier (pubkey from /v1/info)
      ["u", mint.url], // URL of the mint
      ["a", `${CASHU_MINT_KIND}:${mint.pubkey}:${mint.pubkey}`, RELAY_URLS[0]], // Reference to kind:38172 announcement
      ["rating", review.rating.toString()] // Rating (1–5) as a string
    ];

    console.log('✅ Review event created:', {
      kind: event.kind,
      content: event.content.substring(0, 100) + '...',
      tags: event.tags
    });

    return event;
  }

  /**
   * Step 4: Publish the review to Nostr
   * Signs and broadcasts the event to relays
   */
  async publishReview(mintInfo: MintMetadata, reviewData: ReviewData): Promise<{
    eventId: string;
    publishedAt: number;
    mintMetadata: MintMetadata;
  }> {
    if (!this.ndk) {
      throw new Error('NDK not initialized. Call initialize() first.');
    }

    console.log('📝 Creating NIP-87 review event...');
    
    // Check if browser extension is available
    if (typeof window === 'undefined' || !(window as any).nostr) {
      console.error('❌ No browser extension available');
      throw new Error('Browser extension required: Please install a Nostr extension like Alby, nos2x, or Flamingo and grant permission to sign events.');
    }

    const event = new NDKEvent(this.ndk);
    event.kind = MINT_RECOMMENDATION_KIND; // 38000
    event.content = `[${reviewData.rating}/5] ${reviewData.content}`;
    event.tags = [
      ['k', CASHU_MINT_KIND.toString()], // 38172 - Cashu mint kind
      ['u', mintInfo.url, 'cashu'], // Mint URL with protocol identifier
      ['d', mintInfo.pubkey] // Mint's pubkey as identifier (NIP-33)
    ];

    try {
      console.log('🔏 Signing review event with browser extension...');
      console.log('📋 Event details:', {
        kind: event.kind,
        tags: event.tags,
        content: event.content.substring(0, 100) + '...'
      });
      
      // Use window.nostr directly for signing
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
      
      console.log('✅ Event signed successfully');
      
      console.log('📡 Publishing to relays...');
      const relays = await event.publish();
      console.log('📤 Published to relays:', relays.size);
      
      const eventId = event.id;
      if (!eventId) {
        throw new Error('Failed to get event ID after publishing');
      }

      const result = {
        eventId,
        publishedAt: event.created_at || Math.floor(Date.now() / 1000),
        mintMetadata: mintInfo
      };

      console.log('✅ Review published successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to publish review:', error);
      
      // Provide specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('denied') || error.message.includes('rejected')) {
          throw new Error('Publishing cancelled: You need to approve the signing request in your browser extension to publish a review.');
        } else if (error.message.includes('signer') || error.message.includes('sign')) {
          throw new Error('Signing failed: Please check your browser extension (Alby, nos2x, etc.) and try again.');
        } else {
          throw new Error(`Publishing failed: ${error.message}`);
        }
      }
      
      throw new Error('Failed to publish review. Please check your internet connection and browser extension.');
    }
  }

  /**
   * Complete Review Publishing Flow
   * Combines all steps into one method
   */
  async publishCashuMintReview(mintUrl: string, review: ReviewData): Promise<{
    eventId: string;
    mintMetadata: MintMetadata;
    publishedAt: number;
  }> {
    console.log('🎯 Starting complete review publishing flow...');
    console.log('📍 Mint URL:', mintUrl);
    console.log('⭐ Rating:', review.rating);
    console.log('📝 Content length:', review.content.length, 'characters');

    try {
      // Step 1: Initialize if not already done
      if (!this.isConnected) {
        await this.initialize();
      }

      // Step 2: Get mint metadata
      const mintMetadata = await this.getMintMetadata(mintUrl);

      // Step 3: Create review event
      const event = this.createReviewEvent(mintMetadata, review);

      // Step 4: Sign and publish
      const result = await this.publishReview(mintMetadata, review);

      return {
        eventId: result.eventId,
        mintMetadata: result.mintMetadata,
        publishedAt: result.publishedAt
      };
    } catch (error) {
      console.error('💥 Review publishing failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from relays
   */
  async disconnect(): Promise<void> {
    if (this.ndk) {
      // Note: NDK doesn't have a built-in disconnect method
      // The connections will be closed when the instance is garbage collected
      this.isConnected = false;
      console.log('🔌 Disconnected from Nostr relays');
    }
  }
}

// Export singleton instance
export const reviewPublisher = new CashuReviewPublisher();

// Export convenience function
export async function publishCashuMintReview(
  mintUrl: string, 
  review: ReviewData
): Promise<{
  eventId: string;
  mintMetadata: MintMetadata;
  publishedAt: number;
}> {
  return await reviewPublisher.publishCashuMintReview(mintUrl, review);
}

// Export validation helpers
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

// Export example usage
export const EXAMPLE_USAGE = `
// Example: Publishing a review
import { publishCashuMintReview } from './services/reviewPublisher';

try {
  const result = await publishCashuMintReview('https://21mint.me', {
    rating: 5,
    content: 'Fast mint with low fees. Highly recommend!'
  });
  
  console.log('Review published with ID:', result.eventId);
} catch (error) {
  console.error('Failed to publish review:', error);
}
`; 