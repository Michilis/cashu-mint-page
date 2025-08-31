import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';

const app = express();
const PORT = process.env.PORT || 8082;
const TOR_SOCKS = process.env.TOR_SOCKS || 'socks5h://127.0.0.1:9050';

// CORS configuration
const ALLOW_ALL_ORIGINS = process.env.ALLOW_ALL_ORIGINS === 'true';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptionsDelegate = (req, callback) => {
  const requestOrigin = req.header('Origin');
  let corsOptions;

  if (ALLOW_ALL_ORIGINS || !requestOrigin || ALLOWED_ORIGINS.includes(requestOrigin)) {
    corsOptions = {
      origin: requestOrigin || '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Authorization'],
      exposedHeaders: ['Content-Type'],
      credentials: false,
      maxAge: 86400,
    };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate));

app.use(express.json({ limit: '1mb' }));

const agent = new SocksProxyAgent(TOR_SOCKS);

async function proxyRequest(targetUrl, method = 'GET', body) {
  const options = {
    method,
    agent,
    redirect: 'follow',
    headers: { 'Accept': 'application/json' },
  };
  if (method === 'POST' && body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const r = await fetch(targetUrl, options);
  const contentType = r.headers.get('content-type') || 'application/json';
  const text = await r.text();
  return { status: r.status, contentType, text };
}

app.get('/tor', cors(corsOptionsDelegate), async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    console.log('🔁 Tor proxy GET:', url);

    const { status, contentType, text } = await proxyRequest(url, 'GET');
    res.status(status);
    res.set('content-type', contentType);
    res.send(text);
  } catch (e) {
    console.error('❌ Tor proxy error:', e);
    res.status(500).json({ error: 'Tor proxy error', details: String(e) });
  }
});

app.post('/tor', cors(corsOptionsDelegate), async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    console.log('🔁 Tor proxy POST:', url);

    const { status, contentType, text } = await proxyRequest(url, 'POST', req.body);
    res.status(status);
    res.set('content-type', contentType);
    res.send(text);
  } catch (e) {
    console.error('❌ Tor proxy error:', e);
    res.status(500).json({ error: 'Tor proxy error', details: String(e) });
  }
});

// Convenience path: /tor/{HOST}{PATH} for GET and POST
app.get('/tor/:host(*?)', cors(corsOptionsDelegate), async (req, res) => {
  try {
    const host = req.params.host || '';
    const path = req.url.replace(`/tor/${host}`, '') || '';
    const url = `http://${host}${path}`;
    console.log('🔁 Tor proxy host/path GET:', url);

    const { status, contentType, text } = await proxyRequest(url, 'GET');
    res.status(status);
    res.set('content-type', contentType);
    res.send(text);
  } catch (e) {
    console.error('❌ Tor proxy error:', e);
    res.status(500).json({ error: 'Tor proxy error', details: String(e) });
  }
});

app.post('/tor/:host(*?)', cors(corsOptionsDelegate), async (req, res) => {
  try {
    const host = req.params.host || '';
    const path = req.url.replace(`/tor/${host}`, '') || '';
    const url = `http://${host}${path}`;
    console.log('🔁 Tor proxy host/path POST:', url);

    const { status, contentType, text } = await proxyRequest(url, 'POST', req.body);
    res.status(status);
    res.set('content-type', contentType);
    res.send(text);
  } catch (e) {
    console.error('❌ Tor proxy error:', e);
    res.status(500).json({ error: 'Tor proxy error', details: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`🧅 Tor proxy listening on http://localhost:${PORT} using ${TOR_SOCKS}`);
  if (ALLOW_ALL_ORIGINS) {
    console.log('🔓 CORS: allowing all origins');
  } else if (ALLOWED_ORIGINS.length > 0) {
    console.log('🔐 CORS: allowed origins:', ALLOWED_ORIGINS.join(', '));
  } else {
    console.log('⚠️ CORS: no explicit origins configured; only same-origin or no Origin will be allowed');
  }
}); 