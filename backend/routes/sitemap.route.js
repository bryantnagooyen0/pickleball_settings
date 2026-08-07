import express from 'express';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';

const router = express.Router();

const SITE_URL = 'https://www.pickleballsettings.com';

const toDate = (d) => new Date(d).toISOString().split('T')[0];

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [players, paddles] = await Promise.all([
      Player.find({}, '_id updatedAt').lean(),
      Paddle.find({ isActive: true }, '_id updatedAt').lean(),
    ]);

    const staticUrls = [
      `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
      `  <url>\n    <loc>${SITE_URL}/players</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
      `  <url>\n    <loc>${SITE_URL}/paddles</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    ];

    const playerUrls = players.map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}/player/${p._id}</loc>\n    <lastmod>${toDate(p.updatedAt)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );

    const paddleUrls = paddles.map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}/paddle/${p._id}</loc>\n    <lastmod>${toDate(p.updatedAt)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...playerUrls, ...paddleUrls].join('\n')}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
