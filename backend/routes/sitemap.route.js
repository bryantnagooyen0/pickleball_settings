import express from 'express';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';
import Setup from '../models/setup.model.js';

const router = express.Router();

const SITE_URL = 'https://www.pickleballsettings.com';

const toDate = (d) => new Date(d).toISOString().split('T')[0];

const urlEntry = ({ loc, lastmod, changefreq, priority }) =>
  [
    '  <url>',
    `    <loc>${loc}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [players, paddles, setups] = await Promise.all([
      Player.find({}, '_id updatedAt').lean(),
      Paddle.find({ isActive: true }, '_id updatedAt').lean(),
      Setup.find({ isActive: true }, '_id updatedAt').lean(),
    ]);

    const staticUrls = [
      { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${SITE_URL}/players`, changefreq: 'daily', priority: '0.9' },
      { loc: `${SITE_URL}/paddles`, changefreq: 'daily', priority: '0.9' },
      { loc: `${SITE_URL}/community`, changefreq: 'daily', priority: '0.9' },
    ].map(urlEntry);

    const playerUrls = players.map((p) =>
      urlEntry({
        loc: `${SITE_URL}/player/${p._id}`,
        lastmod: toDate(p.updatedAt),
        changefreq: 'weekly',
        priority: '0.8',
      })
    );

    const paddleUrls = paddles.map((p) =>
      urlEntry({
        loc: `${SITE_URL}/paddle/${p._id}`,
        lastmod: toDate(p.updatedAt),
        changefreq: 'monthly',
        priority: '0.7',
      })
    );

    const setupUrls = setups.map((s) =>
      urlEntry({
        loc: `${SITE_URL}/setup/${s._id}`,
        lastmod: toDate(s.updatedAt),
        changefreq: 'monthly',
        priority: '0.6',
      })
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
      ...staticUrls,
      ...playerUrls,
      ...paddleUrls,
      ...setupUrls,
    ].join('\n')}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
