# SEO & Structured Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-page dynamic meta tags, JSON-LD structured data, a sitemap, and robots.txt to maximize Google indexability and social shareability across all pages.

**Architecture:** Install `react-helmet-async` to manage `<head>` tags dynamically per route in the React SPA. A single reusable `SEO` component accepts title, description, image, url, and JSON-LD schema props and injects them into `<head>` on every page. The sitemap is served by a new Express route on the backend, and Vercel proxies `/sitemap.xml` to it.

**Tech Stack:** react-helmet-async, schema.org JSON-LD, Express.js (sitemap endpoint), Vercel rewrites

> **Note on social bots:** `react-helmet-async` updates meta tags client-side after JS executes. Google crawls JS-rendered pages so all changes apply for Google SEO. However, Discord/Slack/iMessage link previews do not execute JS — they will still show the generic homepage OG tags from `index.html` for individual player/paddle pages. The improvements here fully benefit Google rankings and JavaScript-capable bots.

---

## File Map

**Create:**
- `frontend/src/components/SEO.jsx` — reusable Helmet wrapper component
- `frontend/public/robots.txt` — static robots.txt
- `backend/routes/sitemap.route.js` — dynamic XML sitemap endpoint

**Modify:**
- `frontend/package.json` — add react-helmet-async dependency
- `frontend/src/main.jsx` — wrap app with HelmetProvider
- `frontend/src/pages/LandingPage.jsx` — add SEO + WebSite/Organization JSON-LD
- `frontend/src/pages/Players.jsx` — add SEO + CollectionPage JSON-LD
- `frontend/src/pages/PlayerDetailPage.jsx` — add SEO + Person JSON-LD (dynamic on player load)
- `frontend/src/pages/PaddleManagementPage.jsx` — add SEO + CollectionPage JSON-LD
- `frontend/src/pages/PaddleDetailPage.jsx` — add SEO + Product JSON-LD (dynamic on paddle load)
- `backend/server.js` — register sitemap route
- `vercel.json` — add rewrite for `/sitemap.xml` → backend

---

## Task 1: Install react-helmet-async and wrap app with HelmetProvider

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Install the package**

```bash
cd frontend && npm install react-helmet-async
```

Expected output: react-helmet-async added to node_modules and package.json dependencies.

- [ ] **Step 2: Wrap the app with HelmetProvider in `frontend/src/main.jsx`**

Replace the entire file contents with:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
```

- [ ] **Step 3: Verify dev server still starts**

```bash
cd frontend && npm run dev
```

Expected: Vite dev server starts with no errors. Visit http://localhost:5173 and confirm the site loads.

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/main.jsx
git commit -m "feat: install react-helmet-async and wrap app with HelmetProvider"
```

---

## Task 2: Create the reusable SEO component

**Files:**
- Create: `frontend/src/components/SEO.jsx`

- [ ] **Step 1: Create `frontend/src/components/SEO.jsx`**

```jsx
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.pickleballsettings.com';
const SITE_NAME = 'Pickleball Settings';
const DEFAULT_IMAGE = `${SITE_URL}/logo_preview_card.png`;
const DEFAULT_DESCRIPTION =
  'Discover the equipment, settings, and gear used by professional pickleball players. Find your perfect setup and elevate your game.';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = '',
  type = 'website',
  jsonLd = null,
}) => {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Professional Player Equipment Database`;
  const canonicalUrl = `${SITE_URL}${url}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/SEO.jsx
git commit -m "feat: add reusable SEO component with Helmet, OG tags, and JSON-LD support"
```

---

## Task 3: Add SEO to the Landing Page

**Files:**
- Modify: `frontend/src/pages/LandingPage.jsx`

- [ ] **Step 1: Import SEO at the top of LandingPage.jsx**

Add this import after the existing imports:

```jsx
import SEO from '../components/SEO';
```

- [ ] **Step 2: Add the SEO component as the first child inside the returned JSX**

Find the opening `return (` in `LandingPage` and add `<SEO ... />` as the very first element inside the outermost wrapper. The return should look like:

```jsx
return (
  <>
    <SEO
      description="Discover the equipment, settings, and gear used by professional pickleball players. Find your perfect setup and elevate your game."
      url="/"
      jsonLd={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Pickleball Settings',
          url: 'https://www.pickleballsettings.com',
          description: 'Professional pickleball player equipment database',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate:
                'https://www.pickleballsettings.com/players?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Pickleball Settings',
          url: 'https://www.pickleballsettings.com',
          logo: 'https://www.pickleballsettings.com/logo6.png',
        },
      ]}
    />
    {/* rest of existing JSX unchanged */}
  </>
);
```

If the existing return already uses a fragment `<>...</>` or a single wrapper element, add `<SEO ... />` as the first child inside it. Do not restructure the rest of the JSX.

- [ ] **Step 3: Verify in browser**

Start the dev server and open http://localhost:5173. Open DevTools → Elements → `<head>`. Confirm:
- `<title>` is `Pickleball Settings - Professional Player Equipment Database`
- `<meta name="description">` is present
- Two `<script type="application/ld+json">` blocks are present

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LandingPage.jsx
git commit -m "feat: add SEO meta tags and WebSite/Organization JSON-LD to landing page"
```

---

## Task 4: Add SEO to the Players List Page

**Files:**
- Modify: `frontend/src/pages/Players.jsx`

- [ ] **Step 1: Import SEO at the top of Players.jsx**

```jsx
import SEO from '../components/SEO';
```

- [ ] **Step 2: Add SEO as the first child in the return**

```jsx
return (
  <>
    <SEO
      title="Pro Players"
      description="Browse all professional pickleball players and their equipment settings. Discover what paddles, shoes, and gear the pros use."
      url="/players"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Professional Pickleball Players',
        description:
          'Complete database of professional pickleball player equipment settings',
        url: 'https://www.pickleballsettings.com/players',
      }}
    />
    {/* rest of existing JSX unchanged */}
  </>
);
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:5173/players. In DevTools → Elements → `<head>`, confirm:
- `<title>` is `Pro Players | Pickleball Settings`
- `<script type="application/ld+json">` is present with `CollectionPage` type

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Players.jsx
git commit -m "feat: add SEO meta tags and CollectionPage JSON-LD to players list page"
```

---

## Task 5: Add Dynamic SEO to the Player Detail Page

**Files:**
- Modify: `frontend/src/pages/PlayerDetailPage.jsx`

- [ ] **Step 1: Import SEO at the top of PlayerDetailPage.jsx**

```jsx
import SEO from '../components/SEO';
```

- [ ] **Step 2: Add SEO component inside the return, conditioned on player data being loaded**

Find the section in `PlayerDetailPage` where `player` state is used in the JSX (after the loading spinner). Add the SEO component as the first thing rendered when player data is available:

```jsx
{player && (
  <SEO
    title={player.name}
    description={`See ${player.name}'s professional pickleball equipment: ${
      player.paddleBrand
        ? `${player.paddleBrand}${player.paddleModel ? ` ${player.paddleModel}` : ''} paddle`
        : 'paddle setup'
    }, ${player.shoes ? player.shoes : 'shoes'}, and full gear configuration.`}
    image={player.image || undefined}
    url={`/player/${playerId}`}
    type="profile"
    jsonLd={{
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: player.name,
      image: player.image,
      jobTitle: 'Professional Pickleball Player',
      description:
        player.about ||
        `Professional pickleball player ${player.name}'s equipment settings and gear configuration.`,
      ...(player.mlpTeam
        ? { memberOf: { '@type': 'SportsTeam', name: player.mlpTeam } }
        : {}),
      ...(player.currentLocation
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: player.currentLocation,
            },
          }
        : {}),
      ...(player.sponsor ? { sponsor: { '@type': 'Organization', name: player.sponsor } } : {}),
    }}
  />
)}
```

Place this directly before the first visible content element (e.g., the header `Box` or `MotionBox`) in the return. If the outermost wrapper is not a fragment, wrap the entire return in `<>...</>` and put the SEO component first.

- [ ] **Step 3: Verify in browser**

Navigate to any player detail page (e.g., http://localhost:5173/player/{some-id}). In DevTools → Elements → `<head>`, confirm:
- `<title>` shows the player's name (e.g., `Ben Johns | Pickleball Settings`)
- `<meta name="description">` mentions their paddle brand
- `<script type="application/ld+json">` has `@type: "Person"` with the player's name

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PlayerDetailPage.jsx
git commit -m "feat: add dynamic SEO meta tags and Person JSON-LD to player detail page"
```

---

## Task 6: Add SEO to the Paddle Management (List) Page

**Files:**
- Modify: `frontend/src/pages/PaddleManagementPage.jsx`

- [ ] **Step 1: Import SEO at the top of PaddleManagementPage.jsx**

```jsx
import SEO from '../components/SEO';
```

- [ ] **Step 2: Add SEO as the first child in the return**

```jsx
return (
  <>
    <SEO
      title="Paddles"
      description="Browse the complete pickleball paddle database. Compare specs, shapes, core materials, and find which pros use each paddle."
      url="/paddles"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Pickleball Paddle Database',
        description:
          'Complete database of professional-grade pickleball paddles with full specifications',
        url: 'https://www.pickleballsettings.com/paddles',
      }}
    />
    {/* rest of existing JSX unchanged */}
  </>
);
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:5173/paddles. In DevTools → `<head>`, confirm:
- `<title>` is `Paddles | Pickleball Settings`
- `<script type="application/ld+json">` is present

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PaddleManagementPage.jsx
git commit -m "feat: add SEO meta tags and CollectionPage JSON-LD to paddle list page"
```

---

## Task 7: Add Dynamic SEO to the Paddle Detail Page

**Files:**
- Modify: `frontend/src/pages/PaddleDetailPage.jsx`

- [ ] **Step 1: Import SEO at the top of PaddleDetailPage.jsx**

```jsx
import SEO from '../components/SEO';
```

- [ ] **Step 2: Add SEO component conditioned on paddle data being loaded**

Find where `paddle` state is used in the JSX. Add immediately after the loading spinner / before main content:

```jsx
{paddle && (
  <SEO
    title={`${paddle.brand} ${paddle.model || paddle.name}`}
    description={`${paddle.brand} ${paddle.model || paddle.name} pickleball paddle specs${
      paddle.shape ? `: ${paddle.shape} shape` : ''
    }${paddle.thickness ? `, ${paddle.thickness}mm thick` : ''}${
      paddle.core ? `, ${paddle.core} core` : ''
    }. See which pros use this paddle on Pickleball Settings.`}
    image={paddle.image || undefined}
    url={`/paddle/${paddleId}`}
    jsonLd={{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${paddle.brand} ${paddle.model || paddle.name}`,
      brand: {
        '@type': 'Brand',
        name: paddle.brand,
      },
      image: paddle.image,
      description:
        paddle.description ||
        `${paddle.brand} ${paddle.model || paddle.name} pickleball paddle specifications and pro usage.`,
      ...(paddle.priceLink ? { url: paddle.priceLink } : {}),
    }}
  />
)}
```

- [ ] **Step 3: Verify in browser**

Navigate to any paddle detail page. In DevTools → `<head>`, confirm:
- `<title>` shows brand + model (e.g., `Joola Perseus | Pickleball Settings`)
- `<meta name="description">` mentions shape/thickness/core
- `<script type="application/ld+json">` has `@type: "Product"`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PaddleDetailPage.jsx
git commit -m "feat: add dynamic SEO meta tags and Product JSON-LD to paddle detail page"
```

---

## Task 8: Add robots.txt

**Files:**
- Create: `frontend/public/robots.txt`

- [ ] **Step 1: Create `frontend/public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://www.pickleballsettings.com/sitemap.xml
```

- [ ] **Step 2: Verify it's served**

Run `npm run dev` in frontend. Navigate to http://localhost:5173/robots.txt. Confirm the file contents are returned as plain text.

- [ ] **Step 3: Commit**

```bash
git add frontend/public/robots.txt
git commit -m "feat: add robots.txt with sitemap pointer"
```

---

## Task 9: Add dynamic sitemap endpoint to the backend

**Files:**
- Create: `backend/routes/sitemap.route.js`
- Modify: `backend/server.js`

- [ ] **Step 1: Create `backend/routes/sitemap.route.js`**

```js
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
```

- [ ] **Step 2: Register the sitemap route in `backend/server.js`**

Add the import near the top with the other route imports:

```js
import sitemapRoute from './routes/sitemap.route.js';
```

Then register it before the other API routes (it must come before any catch-all middleware):

```js
app.use('/', sitemapRoute);
```

Place this line before the existing `app.use('/api/players', playerRoutes);` line.

- [ ] **Step 3: Test the sitemap endpoint locally**

Start the backend server:

```bash
cd backend && node server.js
```

Then in another terminal:

```bash
curl http://localhost:5000/sitemap.xml
```

Expected: Valid XML output starting with `<?xml version="1.0"...` containing `<urlset>` with at least the 3 static URLs. Player and paddle URLs will appear if data exists in the local DB.

- [ ] **Step 4: Commit**

```bash
git add backend/routes/sitemap.route.js backend/server.js
git commit -m "feat: add dynamic /sitemap.xml endpoint to Express backend"
```

---

## Task 10: Configure Vercel to proxy /sitemap.xml to the backend

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Update `vercel.json` to add the sitemap rewrite before the catch-all**

Replace the current `vercel.json` with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "https://pickleball-settings.onrender.com/sitemap.xml"
    },
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

- [ ] **Step 2: Verify robots.txt still loads locally**

The robots.txt is a static file in `public/` which Vite serves before rewrites, so it is unaffected. Confirm: http://localhost:5173/robots.txt still returns the robots.txt content.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: proxy /sitemap.xml to backend via Vercel rewrite"
```

---

## Post-Deployment Checklist

After deploying to production, complete these one-time tasks:

- [ ] Submit `https://www.pickleballsettings.com/sitemap.xml` to [Google Search Console](https://search.google.com/search-console)
- [ ] Verify `https://www.pickleballsettings.com/robots.txt` is accessible
- [ ] Use [Google's Rich Results Test](https://search.google.com/test/rich-results) to validate JSON-LD on a player page and a paddle page
- [ ] Use [Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/) to inspect OG tags on the landing page
- [ ] Remove duplicate static OG tags from `frontend/index.html` that are now managed dynamically (the global description and keywords can stay, but the OG title/description/image can be removed since SEO.jsx handles them)
