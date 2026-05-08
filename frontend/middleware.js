import { next } from '@vercel/edge';

const CRAWLER_RE =
  /Discordbot|Twitterbot|facebookexternalhit|Slackbot|WhatsApp|Applebot|LinkedInBot|TelegramBot/i;

const SITE_URL = 'https://pickleball-settings.vercel.app';

const escHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const config = {
  matcher: '/setup/:path*',
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  if (!CRAWLER_RE.test(ua)) {
    return next();
  }

  const segments = new URL(request.url).pathname.split('/');
  const setupId = segments[2];
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) return next();

  try {
    const res = await fetch(`${backendUrl}/api/setups/${setupId}`, {
      headers: { 'User-Agent': 'PickleballSettings-Middleware/1.0' },
    });

    if (!res.ok) return next();

    const body = await res.json();
    const setup = body.data;
    const paddleName = setup?.paddle?.name || 'Pickleball Setup';
    const authorName = setup?.authorName || '';
    const totalGrams = setup?.leadTapeTotalGrams ?? '';
    const description = authorName
      ? `${authorName}'s lead tape setup${totalGrams ? ` · ${totalGrams}g total` : ''}`
      : 'Lead tape setup on Pickleball Settings';

    const title = `${paddleName} Setup`;
    const imageUrl = `${SITE_URL}/api/og/${setupId}`;
    const pageUrl = `${SITE_URL}/setup/${setupId}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escHtml(title)}</title>
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:image" content="${escHtml(imageUrl)}" />
  <meta property="og:url" content="${escHtml(pageUrl)}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <meta name="twitter:image" content="${escHtml(imageUrl)}" />
  <meta http-equiv="refresh" content="0; url=${escHtml(pageUrl)}" />
</head>
<body></body>
</html>`;

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch {
    return next();
  }
}
