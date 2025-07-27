import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';

export const MINT_RECOMMENDATION_KIND = 38000; // NIP-87: Mint recommendation/review
export const CASHU_MINT_KIND = 38172; // NIP-87: Cashu mint announcement

// Primary relay pool for Cashu mint data
export const CASHU_RELAY_POOL = [
  'wss://relay.damus.io', // Most reliable relay
  'wss://nos.lol', // Another reliable relay
  'wss://relay.azzamo.net', // Secondary relay
  'wss://relay.cashumints.space', // Cashu-specific relay
];

// Comprehensive relay list for better profile discovery
export const PROFILE_RELAYS = [
  ...CASHU_RELAY_POOL,
  'wss://nos.lol', // Another popular relay
  'wss://relay.azzamo.net', // Secondary relay
];

// Singleton NDK instance to be shared across the app
let ndkInstance: NDK | null = null;
let ndkPromise: Promise<NDK> | null = null;

/**
 * Get or create a shared NDK instance
 * This ensures only one connection is used across the entire app
 */
export async function getSharedNDK(): Promise<NDK> {
  // If we already have an instance, return it
  if (ndkInstance) {
    return ndkInstance;
  }

  // If we're already initializing, wait for that promise
  if (ndkPromise) {
    return ndkPromise;
  }

  // Create new NDK instance
  ndkPromise = createNDKInstance();
  ndkInstance = await ndkPromise;
  return ndkInstance;
}

/**
 * Create a new NDK instance with relay pool
 */
async function createNDKInstance(): Promise<NDK> {
  console.log('🔗 Initializing shared NDK with relay pool...');
  console.log('📡 Relay URLs:', CASHU_RELAY_POOL);

  try {
    const ndk = new NDK({
      explicitRelayUrls: CASHU_RELAY_POOL,
      enableOutboxModel: false,
    });

    console.log('✅ NDK instance created, attempting to connect...');

    // Connect to relays
    await ndk.connect();

    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ NDK initialized successfully');
    return ndk;

  } catch (error) {
    console.error('❌ Failed to initialize NDK:', error);
    
    // Fallback to single relay
    console.log('🔄 Falling back to single relay...');
    const fallbackNDK = new NDK({
      explicitRelayUrls: ['wss://relay.damus.io'],
      enableOutboxModel: false,
    });
    
    await fallbackNDK.connect();
    console.log('✅ Fallback NDK connected');
    return fallbackNDK;
  }
}

/**
 * Clean up the shared NDK instance
 */
export function cleanupSharedNDK() {
  if (ndkInstance) {
    // NDK doesn't have a disconnect method, just clear the instance
    ndkInstance = null;
    ndkPromise = null;
  }
}

export const initializeNDK = async (): Promise<NDK> => {
  console.log('🔗 Initializing NDK with relay pool...');
  console.log('📡 Relay URLs:', CASHU_RELAY_POOL);
  
  try {
  const ndkInstance = new NDK({
      explicitRelayUrls: CASHU_RELAY_POOL,
      enableOutboxModel: true, // Enable for better data discovery across relays
  });

    console.log('✅ NDK instance created, attempting to connect...');

    // Add timeout to prevent hanging
    const connectWithTimeout = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ NDK connection timeout after 5 seconds, continuing anyway...');
        resolve(); // Continue even if connection times out
      }, 5000);

      ndkInstance.connect().then(() => {
        clearTimeout(timeout);
        console.log('✅ NDK connected to relay pool:', CASHU_RELAY_POOL.length, 'relays');
        resolve();
      }).catch((error) => {
        clearTimeout(timeout);
        console.warn('⚠️ NDK connection failed, continuing anyway:', error);
        resolve(); // Continue even if connection fails
      });
    });

    await connectWithTimeout;
    
    // Test connection by subscribing to a simple filter
    console.log('🧪 Testing relay connection...');
    const testSub = ndkInstance.subscribe([{ kinds: [1], limit: 1 }], { closeOnEose: true });
    
    let testEventCount = 0;
    let testTimeout: NodeJS.Timeout;
    
    testSub.on('event', () => {
      testEventCount++;
      console.log('✅ Test event received from relay');
      clearTimeout(testTimeout);
    });
    
    testSub.on('eose', () => {
      console.log(`✅ Relay test complete: ${testEventCount} test events received`);
      clearTimeout(testTimeout);
      testSub.stop();
    });
    
    // Timeout for test
    testTimeout = setTimeout(() => {
      if (testEventCount === 0) {
        console.warn('⚠️ No test events received - relays may be slow or unreachable');
        console.log('📝 Continuing anyway - some relays may still work for specific queries');
      }
      testSub.stop();
    }, 10000); // Increased timeout to 10 seconds
  
  return ndkInstance;
  } catch (error) {
    console.error('❌ Failed to initialize NDK:', error);
    console.log('📝 Attempting to continue with limited functionality...');
    
    // Return a basic NDK instance even if connection fails
    const fallbackNDK = new NDK({
      explicitRelayUrls: ['wss://relay.damus.io'], // Single reliable relay as fallback
      enableOutboxModel: false,
    });
    
    try {
      await fallbackNDK.connect();
      console.log('✅ Fallback NDK connected to single relay');
    } catch (fallbackError) {
      console.error('❌ Even fallback connection failed:', fallbackError);
    }
    
    return fallbackNDK;
  }
};

// Initialize NDK specifically for profile fetching with multiple relays
export const initializeProfileNDK = async (): Promise<NDK> => {
  const ndkInstance = new NDK({
    explicitRelayUrls: PROFILE_RELAYS,
    enableOutboxModel: true, // Enable for better profile discovery
  });

  await ndkInstance.connect();
  console.log('Profile NDK connected to relays:', PROFILE_RELAYS.length);
  
  return ndkInstance;
};

export const generateRandomHex = (length: number): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Test function to verify relay pool connectivity
export const testRelayPool = async (): Promise<{
  connectedRelays: number;
  totalEvents: number;
  cashuEvents: number;
}> => {
  console.log('🧪 Testing relay pool connectivity...');
  
  const ndk = new NDK({
    explicitRelayUrls: CASHU_RELAY_POOL,
    enableOutboxModel: true,
  });

  try {
    await ndk.connect();
    console.log('✅ Connected to relay pool');
    
    let totalEvents = 0;
    let cashuEvents = 0;
    
    // Test subscription to get event counts
    const sub = ndk.subscribe([{
      kinds: [MINT_RECOMMENDATION_KIND],
      limit: 100
    }], { closeOnEose: true });
    
    sub.on('event', (event: NDKEvent) => {
      totalEvents++;
      
      // Check if it's a Cashu mint review
      const kTag = event.tags?.find((tag: string[]) => tag[0] === 'k')?.[1];
      if (kTag === CASHU_MINT_KIND.toString()) {
        cashuEvents++;
      }
    });
    
    // Wait for subscription to complete
    await new Promise((resolve) => {
      sub.on('eose', () => {
        console.log(`📊 Relay pool test results:`);
        console.log(`  - Total events found: ${totalEvents}`);
        console.log(`  - Cashu mint events: ${cashuEvents}`);
        resolve(void 0);
      });
      
      // Timeout after 10 seconds
      setTimeout(resolve, 10000);
    });
    
    return {
      connectedRelays: CASHU_RELAY_POOL.length,
      totalEvents,
      cashuEvents
    };
    
  } catch (error) {
    console.error('❌ Relay pool test failed:', error);
    throw error;
  } finally {
    // NDK doesn't have a disconnect method, just let it clean up
  }
}; 