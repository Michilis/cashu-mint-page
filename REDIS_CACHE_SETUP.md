# Redis Cache Setup for Cashu Mint Page

> **Note**: Redis cache support is currently not implemented due to package compatibility issues with `@nostr-dev-kit/ndk-cache-redis`. The relay pool implementation provides excellent performance without additional caching.

## Current Status

The Cashu mint page uses a **relay pool** approach for optimal performance:

- **4 Primary Relays**: `relay.cashumints.space`, `relay.damus.io`, `relay.snort.social`, `relay.primal.net`
- **Parallel Connections**: Multiple relays for redundancy and speed
- **Outbox Model**: Better data discovery across relays
- **No External Dependencies**: Works without Redis or additional services

## Performance Benefits

Even without Redis cache, the current implementation provides:

- **Fast Loading**: Parallel relay connections
- **High Availability**: Multiple relay redundancy
- **Better Discovery**: More comprehensive data collection
- **Reliable Performance**: No external service dependencies

## Future Redis Implementation

If Redis cache support is needed in the future, we can implement:

1. **Custom Cache Layer**: Build our own Redis integration
2. **Alternative Packages**: Use different caching solutions
3. **In-Memory Cache**: Browser-based caching for better performance

## Current Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cashu Mint    │    │   Relay Pool    │    │   Nostr Events  │
│     Page        │◄──►│                 │◄──►│                 │
│                 │    │ • cashumints    │    │ • Mint Reviews  │
│ • Home          │    │ • damus.io      │    │ • Mint Info     │
│ • Discover      │    │ • snort.social  │    │ • User Profiles │
│ • Mint Pages    │    │ • primal.net    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Monitoring Performance

Check browser console for performance indicators:

- `NDK connected to relay pool: 4 relays`
- `📊 Found X total events`
- `🏆 Found Y Cashu mint events`

## Troubleshooting

### Relay Connection Issues

1. **Check Console**: Look for connection messages
2. **Network**: Ensure outbound connections to relay URLs
3. **Fallback**: App works with partial relay connectivity

### Performance Optimization

1. **Relay Selection**: Current relays are optimized for Cashu data
2. **Parallel Queries**: Multiple relays queried simultaneously
3. **Smart Filtering**: Efficient NIP-87 filter implementation

## Alternative Caching Strategies

If you need additional performance:

### 1. Browser Caching
```javascript
// Cache popular mints in localStorage
localStorage.setItem('popularMints', JSON.stringify(mints));
```

### 2. Service Worker
```javascript
// Cache API responses
caches.open('cashu-mints').then(cache => {
  cache.addAll(['/api/mints', '/api/reviews']);
});
```

### 3. CDN Caching
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Support

For performance issues:
1. Check browser console for relay connection status
2. Verify network connectivity to relay URLs
3. Monitor relay response times
4. Consider adding more relays to the pool

The current relay pool implementation provides excellent performance without the complexity of Redis caching. 