import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';

const app = express();
const PORT = process.env.PORT || 8082;
const TOR_SOCKS = process.env.TOR_SOCKS || 'socks5h://127.0.0.1:9050';

app.use(cors());
app.use(express.json());

const agent = new SocksProxyAgent(TOR_SOCKS);

app.get('/tor', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    console.log('🔁 Tor proxy GET:', url);

    const r = await fetch(url, { agent, redirect: 'follow', headers: { 'Accept': 'application/json' } });
    const contentType = r.headers.get('content-type') || 'application/json';
    const bodyText = await r.text();

    res.status(r.status);
    res.set('content-type', contentType);
    res.send(bodyText);
  } catch (e) {
    console.error('❌ Tor proxy error:', e);
    res.status(500).json({ error: 'Tor proxy error', details: String(e) });
  }
});

// Convenience path: /tor/{HOST}{PATH}
app.get('/tor/:host(*?)', async (req, res) => {
  try {
    const host = req.params.host || '';
    const path = req.url.replace(`/tor/${host}`, '') || '';
    const url = `http://${host}${path}`;
    console.log('🔁 Tor proxy host/path GET:', url);
    const r = await fetch(url, { agent, redirect: 'follow', headers: { 'Accept': 'application/json' } });
    const contentType = r.headers.get('content-type') || 'application/json';
    const bodyText = await r.text();

    res.status(r.status);
    res.set('content-type', contentType);
    res.send(bodyText);
  } catch (e) {
    console.error('❌ Tor proxy error:', e);
    res.status(500).json({ error: 'Tor proxy error', details: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`🧅 Tor proxy listening on http://localhost:${PORT} using ${TOR_SOCKS}`);
}); 