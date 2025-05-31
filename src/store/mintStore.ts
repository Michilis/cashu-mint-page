import { create } from 'zustand';
import { MintInfo } from '../types';

interface MintStore {
  mints: Record<string, MintInfo>;
  addMint: (domain: string, mintInfo: MintInfo) => void;
  getMints: () => MintInfo[];
}

export const useMintStore = create<MintStore>((set, get) => ({
  mints: {},
  addMint: (domain, mintInfo) => 
    set((state) => ({
      mints: { ...state.mints, [domain]: mintInfo }
    })),
  getMints: () => Object.values(get().mints)
}));