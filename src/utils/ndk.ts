import NDK from '@nostr-dev-kit/ndk';

export const RELAY_URL = 'wss://relay.cashumints.space';
export const MINT_RECOMMENDATION_KIND = 38000; // NIP-87: Mint recommendation/review
export const CASHU_MINT_KIND = 38172; // NIP-87: Cashu mint announcement

// Comprehensive relay list for better profile discovery
export const PROFILE_RELAYS = [
  'wss://relay.cashumints.space', // Primary mint relay
  'wss://relay.damus.io', // Popular relay with many profiles
  'wss://nos.lol', // Another popular relay
  'wss://relay.snort.social', // Snort relay
  'wss://relay.primal.net', // Primal relay
  'wss://relay.azzamo.net', // Secondary relay
];

export const initializeNDK = async (): Promise<NDK> => {
  const ndkInstance = new NDK({
    explicitRelayUrls: [RELAY_URL],
    enableOutboxModel: false, // Disable for simplicity with single relay
  });

  await ndkInstance.connect();
  console.log('NDK connected to:', RELAY_URL);
  
  return ndkInstance;
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