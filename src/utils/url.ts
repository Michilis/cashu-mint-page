export interface NormalizedMintPath {
  hostPath: string; // domain[:port][/path]
  isOnion: boolean;
}

export const isOnionHost = (value: string): boolean => {
  return /\.onion(\:\d+)?(\/|$)/i.test(value);
};

export const normalizeMintPath = (input: string): NormalizedMintPath => {
  const withoutProtocol = input.replace(/^https?:\/\//i, '');
  const trimmed = withoutProtocol.replace(/\/+$/, '');
  const isOnion = isOnionHost(trimmed);
  return { hostPath: trimmed, isOnion };
};

const joinUrl = (base: string, suffix: string): string => {
  if (base.endsWith('/')) {
    return `${base}${suffix.replace(/^\//, '')}`;
  }
  return `${base}/${suffix.replace(/^\//, '')}`;
};

const buildSingleTorProxyUrl = (proxy: string, hostPath: string, path: string): string => {
  const onionHttpUrl = `http://${hostPath}${path}`; // Force http for onion to avoid TLS issues
  if (proxy.includes('{URL}')) {
    return proxy.replace('{URL}', encodeURIComponent(onionHttpUrl));
  }
  if (proxy.includes('{HOST}')) {
    return proxy.replace('{HOST}', hostPath).replace('{PATH}', path);
  }
  return joinUrl(proxy, joinUrl(hostPath, path));
};

export const getTorProxyCandidates = (hostPath: string, path: string): string[] => {
  const raw = (import.meta.env.VITE_TOR_PROXY_URL as string | undefined) || '';
  const configured = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Default production proxy endpoints (same-origin or public)
  const defaultGateways = [
    'https://cashumints.space/tor/{HOST}{PATH}',
    'https://cashumints.space/tor?url={URL}',
  ];

  const bases = configured.length > 0 ? configured : defaultGateways;
  const candidates = bases.map((p) => buildSingleTorProxyUrl(p, hostPath, path));

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique = candidates.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  return unique;
};

export const buildMintInfoFetchUrl = (hostPath: string, isOnion: boolean): string => {
  const path = '/v1/info';
  if (isOnion) {
    const candidates = getTorProxyCandidates(hostPath, path);
    return candidates[0];
  }
  return `https://${hostPath}${path}`;
};

export const normalizeMintInfoUrls = (
  isOnion: boolean,
  hostPath: string
): { url: string; urls: string[] } => {
  if (isOnion) {
    // Display onion without protocol per requirement
    return { url: hostPath, urls: [hostPath] };
  }
  const httpsUrl = `https://${hostPath}`;
  return { url: httpsUrl, urls: [httpsUrl] };
}; 