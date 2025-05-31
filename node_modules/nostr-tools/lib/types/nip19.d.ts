export type NProfile = `nprofile1${string}`;
export type NEvent = `nevent1${string}`;
export type NAddr = `naddr1${string}`;
export type NSec = `nsec1${string}`;
export type NPub = `npub1${string}`;
export type Note = `note1${string}`;
export type Ncryptsec = `ncryptsec1${string}`;
export declare const NostrTypeGuard: {
    isNProfile: (value?: string | null) => value is NProfile;
    isNEvent: (value?: string | null) => value is NEvent;
    isNAddr: (value?: string | null) => value is NAddr;
    isNSec: (value?: string | null) => value is NSec;
    isNPub: (value?: string | null) => value is NPub;
    isNote: (value?: string | null) => value is Note;
    isNcryptsec: (value?: string | null) => value is Ncryptsec;
};
export declare const Bech32MaxSize = 5000;
/**
 * Bech32 regex.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#bech32
 */
export declare const BECH32_REGEX: RegExp;
export type ProfilePointer = {
    pubkey: string;
    relays?: string[];
};
export type EventPointer = {
    id: string;
    relays?: string[];
    author?: string;
    kind?: number;
};
export type AddressPointer = {
    identifier: string;
    pubkey: string;
    kind: number;
    relays?: string[];
};
export declare function decodeNostrURI(nip19code: string): ReturnType<typeof decode> | {
    type: 'invalid';
    data: null;
};
export declare function decode(code: string): {
    type: 'nevent';
    data: EventPointer;
} | {
    type: 'nprofile';
    data: ProfilePointer;
} | {
    type: 'naddr';
    data: AddressPointer;
} | {
    type: 'npub';
    data: string;
} | {
    type: 'nsec';
    data: Uint8Array;
} | {
    type: 'note';
    data: string;
};
export declare function nsecEncode(key: Uint8Array): NSec;
export declare function npubEncode(hex: string): NPub;
export declare function noteEncode(hex: string): Note;
export declare function encodeBytes<Prefix extends string>(prefix: Prefix, bytes: Uint8Array): `${Prefix}1${string}`;
export declare function nprofileEncode(profile: ProfilePointer): NProfile;
export declare function neventEncode(event: EventPointer): NEvent;
export declare function naddrEncode(addr: AddressPointer): NAddr;
