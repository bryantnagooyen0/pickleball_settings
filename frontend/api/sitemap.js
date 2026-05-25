export default async function handler(req, res) {
  try {
    const response = await fetch('https://pickleball-settings.onrender.com/sitemap.xml');
    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send('Error fetching sitemap');
  }
}
