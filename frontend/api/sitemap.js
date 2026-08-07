const FALLBACK_BACKEND = 'https://pickleball-settings.onrender.com';

export default async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL || FALLBACK_BACKEND;
  try {
    const response = await fetch(`${backendUrl}/sitemap.xml`);
    if (!response.ok) {
      return res.status(502).send('Error fetching sitemap');
    }
    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send('Error fetching sitemap');
  }
}
