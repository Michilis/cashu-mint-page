export interface NutDetails {
  title: string;
  description: string;
  features: string[];
  useCase: string;
  technicalDetails?: string;
}

export const NUT_INFO: Record<string, NutDetails> = {
  '1': {
    title: 'Mint Information',
    description: 'Provides basic information about the mint including name, description, and supported features.',
    features: ['Mint name and description', 'Supported nuts and methods', 'Contact information', 'Terms of service'],
    useCase: 'Essential for mint discovery and basic mint information display.',
    technicalDetails: 'Returns mint metadata including pubkey, version, and supported capabilities.'
  },
  '2': {
    title: 'Keysets',
    description: 'Manages the cryptographic keys used for minting and spending tokens.',
    features: ['Key generation and management', 'Keyset rotation', 'Cryptographic security', 'Token minting'],
    useCase: 'Core functionality for creating and managing Cashu tokens.',
    technicalDetails: 'Handles RSA key pairs and provides minting capabilities for tokens.'
  },
  '3': {
    title: 'Token Minting',
    description: 'Creates new Cashu tokens with specified amounts and denominations.',
    features: ['Token creation', 'Amount specification', 'Denomination handling', 'Blind signature generation'],
    useCase: 'Primary function for minting new Cashu tokens.',
    technicalDetails: 'Uses blind signatures to create tokens without linking them to the user.'
  },
  '4': {
    title: 'Token Spending',
    description: 'Validates and processes token spending requests.',
    features: ['Token validation', 'Double-spend prevention', 'Signature verification', 'Amount checking'],
    useCase: 'Core functionality for spending Cashu tokens.',
    technicalDetails: 'Verifies blind signatures and prevents double-spending attacks.'
  },
  '5': {
    title: 'Token Melt',
    description: 'Destroys tokens and returns them to the mint for replacement.',
    features: ['Token destruction', 'Replacement token generation', 'Amount preservation', 'Security validation'],
    useCase: 'Allows users to exchange tokens for new ones or cash out.',
    technicalDetails: 'Destroys spent tokens and generates new ones with the same value.'
  },
  '6': {
    title: 'Split',
    description: 'Splits tokens into smaller denominations for easier spending.',
    features: ['Token splitting', 'Denomination optimization', 'Amount preservation', 'Fee handling'],
    useCase: 'Breaks down large tokens into smaller, more spendable amounts.',
    technicalDetails: 'Splits tokens while preserving total value and handling fees.'
  },
  '7': {
    title: 'Swap',
    description: 'Exchanges tokens between different mints or currencies.',
    features: ['Cross-mint transfers', 'Currency conversion', 'Rate handling', 'Fee calculation'],
    useCase: 'Enables interoperability between different Cashu mints and currencies.',
    technicalDetails: 'Handles cross-mint token exchanges with rate conversion and fees.'
  },
  '8': {
    title: 'Melt',
    description: 'Destroys tokens and returns the value to the user.',
    features: ['Token destruction', 'Value return', 'Fee handling', 'Confirmation'],
    useCase: 'Allows users to cash out their tokens for real currency.',
    technicalDetails: 'Destroys tokens and returns the equivalent value minus fees.'
  },
  '9': {
    title: 'Restore',
    description: 'Recovers lost or damaged tokens using backup information.',
    features: ['Token recovery', 'Backup validation', 'Security verification', 'Amount restoration'],
    useCase: 'Provides recovery mechanism for lost or corrupted tokens.',
    technicalDetails: 'Uses backup data to reconstruct and restore token value.'
  },
  '10': {
    title: 'Proofs',
    description: 'Provides cryptographic proofs for token validity and ownership.',
    features: ['Proof generation', 'Validity verification', 'Ownership proof', 'Security guarantees'],
    useCase: 'Ensures token authenticity and prevents counterfeiting.',
    technicalDetails: 'Uses cryptographic proofs to verify token validity and ownership.'
  },
  '11': {
    title: 'Pay-To-Pubkey (P2PK)',
    description: 'Enables payments to specific public keys with cryptographic verification.',
    features: ['Public key payments', 'Cryptographic verification', 'Secure transfers', 'Identity binding'],
    useCase: 'Allows direct payments to specific users or entities.',
    technicalDetails: 'Uses public key cryptography for secure, verifiable payments.'
  },
  '12': {
    title: 'DLEQ Proofs',
    description: 'Provides Discrete Logarithm Equality proofs for enhanced security.',
    features: ['DLEQ verification', 'Enhanced security', 'Cryptographic proofs', 'Zero-knowledge'],
    useCase: 'Ensures mathematical security of token operations.',
    technicalDetails: 'Uses discrete logarithm equality proofs for cryptographic security.'
  },
  '13': {
    title: 'Deterministic Secrets',
    description: 'Generates deterministic secrets for consistent token operations.',
    features: ['Deterministic generation', 'Consistent behavior', 'Reproducible results', 'Security'],
    useCase: 'Ensures consistent token behavior across different sessions.',
    technicalDetails: 'Uses deterministic algorithms for predictable and secure token operations.'
  },
  '14': {
    title: 'Hashed Timelock Contracts (HTLCs)',
    description: 'Enables time-based and condition-based payment contracts.',
    features: ['Time-based payments', 'Conditional transfers', 'Escrow functionality', 'Atomic swaps'],
    useCase: 'Enables complex payment scenarios with time and condition constraints.',
    technicalDetails: 'Uses hash timelock contracts for conditional and time-based payments.'
  },
  '15': {
    title: 'Partial Multi-Path Payments (MPP)',
    description: 'Splits payments across multiple paths for better routing and reliability.',
    features: ['Payment splitting', 'Multi-path routing', 'Reliability improvement', 'Fee optimization'],
    useCase: 'Improves payment success rates and reduces fees through path splitting.',
    technicalDetails: 'Splits large payments across multiple Lightning Network paths.'
  },
  '16': {
    title: 'Animated QR Codes',
    description: 'Provides animated QR codes for enhanced user experience.',
    features: ['Animated QR codes', 'Enhanced UX', 'Dynamic content', 'Visual feedback'],
    useCase: 'Improves user experience with animated payment codes.',
    technicalDetails: 'Generates animated QR codes for better visual communication.'
  },
  '17': {
    title: 'WebSocket Subscriptions',
    description: 'Enables real-time updates and notifications via WebSocket connections.',
    features: ['Real-time updates', 'WebSocket connections', 'Live notifications', 'Event streaming'],
    useCase: 'Provides real-time updates for mint operations and token status.',
    technicalDetails: 'Uses WebSocket connections for live event streaming and notifications.'
  },
  '18': {
    title: 'Payment Requests',
    description: 'Standardizes payment request format for consistent payment handling.',
    features: ['Standardized requests', 'Payment formatting', 'Consistent handling', 'Interoperability'],
    useCase: 'Ensures consistent payment request format across different implementations.',
    technicalDetails: 'Defines standard format for payment requests and responses.'
  },
  '19': {
    title: 'Cached Responses',
    description: 'Provides caching mechanisms for improved performance and reduced load.',
    features: ['Response caching', 'Performance optimization', 'Load reduction', 'Efficiency'],
    useCase: 'Improves performance by caching frequently requested data.',
    technicalDetails: 'Implements caching strategies for better resource utilization.'
  },
  '20': {
    title: 'Signature on Mint Quote',
    description: 'Adds cryptographic signatures to mint quotes for authenticity verification.',
    features: ['Quote signatures', 'Authenticity verification', 'Cryptographic proof', 'Trust establishment'],
    useCase: 'Ensures mint quotes are authentic and tamper-proof.',
    technicalDetails: 'Uses cryptographic signatures to verify mint quote authenticity.'
  },
  '21': {
    title: 'Clear Authentication',
    description: 'Provides clear text authentication for mint operations.',
    features: ['Clear authentication', 'Text-based auth', 'Simple verification', 'Basic security'],
    useCase: 'Provides basic authentication for mint operations.',
    technicalDetails: 'Uses clear text authentication for simple security requirements.'
  },
  '22': {
    title: 'Blind Authentication',
    description: 'Provides privacy-preserving authentication without revealing user identity.',
    features: ['Privacy-preserving auth', 'Blind signatures', 'Identity protection', 'Zero-knowledge'],
    useCase: 'Enables authentication while preserving user privacy.',
    technicalDetails: 'Uses blind signature techniques for privacy-preserving authentication.'
  },
  '23': {
    title: 'Payment Method: BOLT11',
    description: 'Integrates BOLT11 Lightning Network payment method support.',
    features: ['BOLT11 support', 'Lightning payments', 'Invoice handling', 'Network integration'],
    useCase: 'Enables Lightning Network payments using BOLT11 invoices.',
    technicalDetails: 'Implements BOLT11 standard for Lightning Network payment integration.'
  },
  '24': {
    title: 'HTTP 402 Payment Required',
    description: 'Implements HTTP 402 status code for payment-required responses.',
    features: ['HTTP 402 support', 'Payment required responses', 'Standard compliance', 'Web integration'],
    useCase: 'Provides standard HTTP responses for payment-required scenarios.',
    technicalDetails: 'Uses HTTP 402 status code for payment-required responses.'
  }
};

export const getNutInfo = (nutNumber: string): NutDetails | null => {
  return NUT_INFO[nutNumber] || null;
};

export const getNutDescription = (nutNumber: string): string => {
  const info = getNutInfo(nutNumber);
  return info ? info.description : `NUT-${nutNumber} support`;
}; 