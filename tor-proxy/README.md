# Cashu Tor Proxy

Minimal HTTP proxy to fetch .onion endpoints over Tor (SOCKS) with CORS enabled.

## Prerequisites
- Tor running locally with SOCKS on 127.0.0.1:9050 (e.g. `sudo apt install tor && sudo systemctl start tor`)

## Run
```
cd tor-proxy
npm install
PORT=8080 TOR_SOCKS=socks5h://127.0.0.1:9050 npm start
```

## Usage from frontend
Set in your `.env.local`:
```
VITE_TOR_PROXY_URL=http://localhost:8080/tor?url={URL}
```
Or host/path variant:
```
VITE_TOR_PROXY_URL=http://localhost:8080/tor/{HOST}{PATH}
```
Multiple proxies can be comma-separated for fallback. 