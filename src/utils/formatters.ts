export function formatUnixTime(unixTime?: number): string {
  if (!unixTime) return 'Unknown';
  return new Date(unixTime * 1000).toLocaleString();
}

export function formatNutNumber(nutKey: string): string {
  // NUT keys are typically formatted as "nut0", "nut1", etc.
  const match = nutKey.match(/^nut(\d+)$/);
  return match ? match[1] : nutKey;
}

export function getContactIcon(method: string): string {
  switch (method.toLowerCase()) {
    case 'email':
      return 'mail';
    case 'twitter':
      return 'twitter';
    case 'nostr':
      return 'zap';
    case 'telegram':
      return 'send';
    case 'github':
      return 'github';
    case 'website':
      return 'globe';
    default:
      return 'user';
  }
}