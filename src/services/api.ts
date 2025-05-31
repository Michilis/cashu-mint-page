import axios from 'axios';
import { MintInfo } from '../types';

export async function getMintInfoByDomain(domain: string): Promise<MintInfo> {
  try {
    const response = await axios.get(`https://${domain}/v1/info`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch mint info for ${domain}:`, error);
    throw error;
  }
}

export async function getMintPubkey(mintUrl: string): Promise<string | null> {
  try {
    // Extract domain from URL
    const domain = mintUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    console.log('🔑 Fetching mint pubkey from:', `https://${domain}/v1/info`);
    
    const response = await axios.get(`https://${domain}/v1/info`);
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