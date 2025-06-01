import axios from 'axios';
import { MintInfo } from '../types';

export async function getMintInfoByDomain(mintPath: string): Promise<MintInfo> {
  try {
    // Clean the mint path to remove protocol and trailing slashes, but preserve the path
    const cleanPath = mintPath.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const url = `https://${cleanPath}/v1/info`;
    
    console.log('🔍 Fetching mint info from:', url);
    console.log('📍 Original mint path:', mintPath);
    console.log('🧹 Cleaned path:', cleanPath);
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Mint info response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch mint info for ${mintPath}:`, error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timeout when connecting to ${mintPath}`);
      } else if (error.response) {
        throw new Error(`Server responded with ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error(`Network error: Could not connect to ${mintPath}`);
      }
    }
    
    throw error;
  }
}

export async function getMintPubkey(mintUrl: string): Promise<string | null> {
  try {
    // Preserve the full URL path instead of just extracting the domain
    const cleanUrl = mintUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const url = `https://${cleanUrl}/v1/info`;
    
    console.log('🔑 Fetching mint pubkey from:', url);
    console.log('📍 Original mint URL:', mintUrl);
    console.log('🧹 Cleaned URL:', cleanUrl);
    
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