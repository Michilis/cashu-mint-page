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

export interface NutInfo {
  methods?: string[];
  disabled?: boolean;
  supported?: boolean;
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