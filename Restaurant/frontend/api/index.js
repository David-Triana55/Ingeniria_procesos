export default async function handler(req, res) {
  const backend = process.env.BACKEND_URL || 'http://localhost:4000';
  const url = new URL(req.url.replace('/api', '/api'), backend);

  const headers = { 'Content-Type': req.headers['content-type'] || 'application/json' };
  if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined;

  try {
    const response = await fetch(url.toString(), { method: req.method, headers, body });
    const data = await response.text();
    res.status(response.status);
    for (const [k, v] of response.headers) res.setHeader(k, v);
    res.end(data);
  } catch (err) {
    res.status(502).json({ error: 'Backend unavailable', message: err.message });
  }
}
