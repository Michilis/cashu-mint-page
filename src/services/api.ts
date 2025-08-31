import axios from 'axios';
import { MintInfo } from '../types';
import { normalizeMintPath, buildMintInfoFetchUrl, normalizeMintInfoUrls, getTorProxyCandidates } from '../utils/url';

export async function getMintInfoByDomain(mintPath: string): Promise<MintInfo> {
  const { hostPath, isOnion } = normalizeMintPath(mintPath);

  const path = '/v1/info';
  const primaryUrl = buildMintInfoFetchUrl(hostPath, isOnion);
  const candidates = isOnion ? getTorProxyCandidates(hostPath, path) : [primaryUrl];
  
  if (isOnion) {
    console.log('🧅 Tor fetch candidates:', candidates);
  }

  let lastError: unknown = null;

  for (const url of candidates) {
    try {
      console.log('🔍 Fetching mint info from:', url);
      console.log('📍 Original mint path:', mintPath);
      console.log('🧹 Normalized hostPath:', hostPath, 'isOnion:', isOnion);
      
      const response = await axios.get(url, {
        timeout: isOnion ? 25000 : 15000, // Longer for Tor
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      const data: MintInfo = response.data;

      // Normalize URLs for display
      const normalized = normalizeMintInfoUrls(isOnion, hostPath);
      data.url = data.url || normalized.url;
      data.urls = data.urls && data.urls.length > 0 ? data.urls : normalized.urls;

      console.log('✅ Mint info response:', data);
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch mint info using candidate ${url}:`, error);
      lastError = error;
      continue;
    }
  }

  // All candidates failed – surface a generic network error similar to earlier behavior
  if (lastError && axios.isAxiosError(lastError)) {
    if (lastError.code === 'ECONNABORTED') {
      throw new Error(`Request timeout when connecting to ${hostPath} (Tor)`);
    } else if (lastError.response) {
      throw new Error(`Server responded with ${lastError.response.status}: ${lastError.response.statusText}`);
    } else if (lastError.request) {
      throw new Error(`Network error: Could not connect to ${hostPath} (Tor)`);
    }
  }

  throw new Error(`Failed to fetch mint info for ${hostPath}`);
}

export async function getMintPubkey(mintUrl: string): Promise<string | null> {
  try {
    const { hostPath, isOnion } = normalizeMintPath(mintUrl);

    if (isOnion) {
      // We could attempt Tor proxy as above, but pubkey is optional for reviews
      return null;
    }

    const url = `https://${hostPath}/v1/info`;
    
    console.log('🔑 Fetching mint pubkey from:', url);
    console.log('📍 Original mint URL:', mintUrl);
    console.log('🧹 Normalized hostPath:', hostPath);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    const pubkey = response.data.pubkey;
    
    if (!pubkey) {
      console.warn('⚠️ Mint info does not contain pubkey:', response.data);
      return null;
    }
    
    console.log('✅ Found mint pubkey:', pubkey);
    return pubkey;
  } catch (error) {
    console.error(`❌ Failed to fetch mint pubkey for ${mintUrl}:`, error);
    return null;
  }
}