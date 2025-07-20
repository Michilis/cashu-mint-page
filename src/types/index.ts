export interface MintInfo {
  name: string;
  description?: string;
  description_long?: string;
  pubkey: string;
  version: string;
  motd?: string;
  nuts: Record<string, NutInfo>;
  contact?: Contact[];
  terms_of_service_url?: string;
  url?: string;
  urls?: string[];
  icon?: string;
  icon_url?: string;
  time?: number;
  nips?: Record<string, NipInfo>;
}

export interface NutMethod {
  method: string;
  unit?: string;
  min_amount?: number;
  max_amount?: number;
  description?: boolean;
  commands?: string[];
}

export interface NutInfo {
  methods?: NutMethod[];
  disabled?: boolean;
  supported?: boolean | NutMethod[];
  unit?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface Contact {
  method: string;
  value?: string;
  info?: string;
}

export interface NipInfo {
  supported?: boolean;
  disabled?: boolean;
  description?: string;
}

// Review-related types
export interface MintReview {
  id: string;
  pubkey: string;
  created_at: number;
  mintUrl: string;
  rating: number;
  title: string;
  content: string;
  author?: string;
  verified?: boolean;
  aTag?: string;
}

export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}