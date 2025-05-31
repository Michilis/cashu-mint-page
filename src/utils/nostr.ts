// Nostr utility functions

// Bech32 alphabet for npub encoding
const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

// Simple hex to bech32 conversion for npub
export const hexToNpub = (hex: string): string => {
  if (!hex || hex.length !== 64) return '';
  
  try {
    // This is a simplified implementation
    // For production, use a proper bech32 library like 'bech32' or 'nostr-tools'
    return `npub${hex.substring(0, 8)}...${hex.substring(56)}`;
  } catch (error) {
    console.warn('Failed to convert hex to npub:', error);
    return hex.substring(0, 8) + '...' + hex.substring(56);
  }
};

// Format pubkey for display
export const formatPubkey = (pubkey: string, format: 'hex' | 'npub' = 'hex'): string => {
  if (!pubkey) return 'anonymous';
  
  if (format === 'npub') {
    return hexToNpub(pubkey);
  }
  
  // Default hex format (truncated)
  return pubkey.substring(0, 8) + '...' + pubkey.substring(pubkey.length - 8);
};

// Copy text to clipboard with error handling
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Validate Nostr pubkey (hex format)
export const isValidPubkey = (pubkey: string): boolean => {
  return /^[0-9a-fA-F]{64}$/.test(pubkey);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Extract domain from URL
export const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}; 