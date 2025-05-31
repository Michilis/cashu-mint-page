import axios from 'axios';
import { MintInfo } from '../types';

const mintUrl = import.meta.env.VITE_MINT_URL || '';

export async function getMintInfo(): Promise<MintInfo> {
  try {
    const response = await axios.get(`${mintUrl}/v1/info`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch mint info:', error);
    throw error;
  }
}

export async function getMintInfoByDomain(domain: string): Promise<MintInfo> {
  try {
    const response = await axios.get(`https://${domain}/v1/info`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch mint info for ${domain}:`, error);
    throw error;
  }
}