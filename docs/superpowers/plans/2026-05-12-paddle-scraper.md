# Paddle Scraper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Playwright script at `scripts/scrape-paddles.js` that scrapes paddle specs from pickleballstudio.com and writes them to `scripts/output/paddles.json`.

**Architecture:** A single sequential Node.js ESM script with three responsibilities separated into functions: URL collection from the index page, field extraction from each detail page, and output writing. The field mapper is a pure function so it can be tested independently without a browser.

**Tech Stack:** Playwright (Chromium headless), dotenv, Node.js 18+ built-in test runner (`node --test`), ESM modules.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `scripts/package.json` | Create | Scripts package with playwright + dotenv deps |
| `scripts/.gitignore` | Create | Ignore `output/` and `node_modules/` |
| `scripts/.env` | Create | `SCRAPE_LIMIT=20` for sample runs |
| `scripts/mapper.js` | Create | Pure `mapPaddleFields(raw)` function |
| `scripts/mapper.test.js` | Create | Unit tests for mapper |
| `scripts/scrape-paddles.js` | Create | Main entry point: collects URLs, scrapes details, writes JSON |

---

## Task 1: Scaffold the scripts package

**Files:**
- Create: `scripts/package.json`
- Create: `scripts/.gitignore`
- Create: `scripts/.env`

- [ ] **Step 1: Create `scripts/package.json`**

```json
{
  "name": "pickleball-scraper",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "scrape": "node --env-file=.env scrape-paddles.js",
    "test": "node --test"
  },
  "dependencies": {
    "playwright": "^1.44.0",
    "dotenv": "^16.4.5"
  }
}
```

- [ ] **Step 2: Create `scripts/.gitignore`**

```
node_modules/
output/
.env
```

- [ ] **Step 3: Create `scripts/.env`**

```
SCRAPE_LIMIT=20
```

- [ ] **Step 4: Install dependencies**

Run from inside the `scripts/` directory:

```bash
cd scripts && npm install
```

Expected: `node_modules/` created, `package-lock.json` written, no errors.

- [ ] **Step 5: Install Playwright browsers**

```bash
npx playwright install chromium
```

Expected: Chromium downloaded, ends with "✓ Chromium ... chromium" line.

- [ ] **Step 6: Commit**

```bash
git add scripts/package.json scripts/.gitignore scripts/package-lock.json
git commit -m "chore: scaffold scripts package with playwright"
```

---

## Task 2: Discover page selectors (headed browser session)

The site is Next.js with dynamic rendering — selectors cannot be known ahead of time. Run this diagnostic script to inspect the live page structure before writing the real scraper.

**Files:**
- Create: `scripts/discover-selectors.js` (temporary, deleted after this task)

- [ ] **Step 1: Create the diagnostic script**

```js
// scripts/discover-selectors.js
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

console.log('--- INDEX PAGE ---');
await page.goto('https://pickleballstudio.com/paddles', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Dump all anchor hrefs that look like paddle detail pages
const links = await page.$$eval('a[href]', els =>
  els.map(el => el.href).filter(h => h.includes('/paddles/'))
);
console.log('Paddle links found:', links.slice(0, 5));

// Visit first paddle detail page
if (links.length > 0) {
  console.log('\n--- DETAIL PAGE ---');
  await page.goto(links[0], { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Dump all text content of elements that might be specs
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page text (first 3000 chars):\n', bodyText.slice(0, 3000));

  // Dump all img srcs
  const imgs = await page.$$eval('img', els => els.map(el => el.src));
  console.log('\nImages found:', imgs);
}

// Pause so you can inspect in the browser window
console.log('\nBrowser is open — inspect DevTools and note selectors. Press Ctrl+C when done.');
await page.waitForTimeout(60000);
await browser.close();
```

- [ ] **Step 2: Run the diagnostic**

```bash
cd scripts && node discover-selectors.js
```

Expected: A headed Chromium window opens showing pickleballstudio.com/paddles, then navigates to the first paddle. The terminal prints paddle links and page text.

- [ ] **Step 3: Record the selectors you find**

While the browser is open, use DevTools (F12) to inspect and record:

1. The CSS selector for paddle card links on the index page (the `<a>` tags that link to `/paddles/[slug]`)
2. The selector for the paddle name/title on the detail page
3. The selector or pattern for each spec field (thickness, weight, shape, etc.) — these are often in a table or a list of `<dt>/<dd>` pairs or labeled `<div>`s
4. The selector for the main paddle image
5. The selector for a buy/price link if present

Write these down — you will hardcode them into `mapper.js` in Task 4.

- [ ] **Step 4: Delete the diagnostic script and commit**

```bash
cd scripts && del discover-selectors.js
git add -A
git commit -m "chore: run selector discovery (script removed)"
```

---

## Task 3: Implement and test the field mapper

The mapper is a pure function: it takes a plain object of raw scraped strings and returns an object matching the paddle schema. No browser involved.

**Files:**
- Create: `scripts/mapper.js`
- Create: `scripts/mapper.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// scripts/mapper.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapPaddleFields } from './mapper.js';

describe('mapPaddleFields', () => {
  it('maps all fields from a complete raw object', () => {
    const raw = {
      name: 'Joola Hyperion CFS 16',
      brand: 'Joola',
      shape: 'Elongated',
      thickness: '16mm',
      handleLength: '5.5"',
      length: '16.5"',
      width: '7.5"',
      weight: '7.9-8.3 oz',
      core: 'Carbon Fiber',
      image: 'https://example.com/paddle.jpg',
      description: 'A great paddle.',
      priceLink: 'https://example.com/buy',
    };

    const result = mapPaddleFields(raw);

    assert.equal(result.name, 'Joola Hyperion CFS 16');
    assert.equal(result.brand, 'Joola');
    assert.equal(result.model, 'Hyperion CFS 16');
    assert.equal(result.shape, 'Elongated');
    assert.equal(result.thickness, '16mm');
    assert.equal(result.handleLength, '5.5"');
    assert.equal(result.length, '16.5"');
    assert.equal(result.width, '7.5"');
    assert.equal(result.weight, '7.9-8.3 oz');
    assert.equal(result.core, 'Carbon Fiber');
    assert.equal(result.image, 'https://example.com/paddle.jpg');
    assert.equal(result.description, 'A great paddle.');
    assert.equal(result.priceLink, 'https://example.com/buy');
  });

  it('derives model by stripping brand prefix from name', () => {
    const raw = { name: 'Selkirk Vanguard Power Air', brand: 'Selkirk' };
    const result = mapPaddleFields(raw);
    assert.equal(result.model, 'Vanguard Power Air');
  });

  it('sets missing fields to null', () => {
    const raw = { name: 'Some Paddle', brand: 'SomeBrand' };
    const result = mapPaddleFields(raw);
    assert.equal(result.shape, null);
    assert.equal(result.thickness, null);
    assert.equal(result.image, null);
    assert.equal(result.description, null);
    assert.equal(result.priceLink, null);
  });

  it('handles brand not found in name gracefully', () => {
    const raw = { name: 'Mystery Paddle', brand: 'Joola' };
    const result = mapPaddleFields(raw);
    assert.equal(result.model, 'Mystery Paddle');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd scripts && npm test
```

Expected: `ReferenceError: Cannot find module './mapper.js'` or similar — tests fail because mapper doesn't exist yet.

- [ ] **Step 3: Implement `mapper.js`**

```js
// scripts/mapper.js

export function mapPaddleFields(raw) {
  const name = raw.name?.trim() || null;
  const brand = raw.brand?.trim() || null;

  let model = null;
  if (name && brand && name.toLowerCase().startsWith(brand.toLowerCase())) {
    model = name.slice(brand.length).trim() || name;
  } else if (name) {
    model = name;
  }

  return {
    name,
    brand,
    model,
    shape: raw.shape?.trim() || null,
    thickness: raw.thickness?.trim() || null,
    handleLength: raw.handleLength?.trim() || null,
    length: raw.length?.trim() || null,
    width: raw.width?.trim() || null,
    weight: raw.weight?.trim() || null,
    core: raw.core?.trim() || null,
    image: raw.image?.trim() || null,
    description: raw.description?.trim() || null,
    priceLink: raw.priceLink?.trim() || null,
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd scripts && npm test
```

Expected output:
```
▶ mapPaddleFields
  ✔ maps all fields from a complete raw object
  ✔ derives model by stripping brand prefix from name
  ✔ sets missing fields to null
  ✔ handles brand not found in name gracefully
▶ mapPaddleFields (Xms)
```

- [ ] **Step 5: Commit**

```bash
git add scripts/mapper.js scripts/mapper.test.js
git commit -m "feat: add paddle field mapper with tests"
```

---

## Task 4: Build the main scraper script

**Files:**
- Create: `scripts/scrape-paddles.js`

Replace `INDEX_LINK_SELECTOR`, `DETAIL_*` constants below with the actual selectors you found in Task 2.

- [ ] **Step 1: Create `scripts/scrape-paddles.js`**

```js
// scripts/scrape-paddles.js
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { mapPaddleFields } from './mapper.js';

// ─── Selectors (fill in from Task 2 discovery) ───────────────────────────────
const INDEX_LINK_SELECTOR = 'a[href*="/paddles/"]'; // refine if needed
const DETAIL_NAME_SELECTOR = 'h1';                  // replace with actual
const DETAIL_IMAGE_SELECTOR = 'img';                // replace with actual — pick the main paddle img
const DETAIL_PRICE_LINK_SELECTOR = 'a[href*="amazon"], a[href*="buy"]'; // refine

// Spec labels as they appear on the detail page (adjust text to match exactly)
const SPEC_LABELS = {
  shape:        'Shape',
  thickness:    'Thickness',
  handleLength: 'Handle Length',
  length:       'Length',
  width:        'Width',
  weight:       'Weight',
  core:         'Core',
};
// ─────────────────────────────────────────────────────────────────────────────

const LIMIT = process.env.SCRAPE_LIMIT ? parseInt(process.env.SCRAPE_LIMIT, 10) : null;
const BASE_URL = 'https://pickleballstudio.com';

async function collectPaddleUrls(page) {
  await page.goto(`${BASE_URL}/paddles`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector(INDEX_LINK_SELECTOR, { timeout: 10000 });

  const hrefs = await page.$$eval(INDEX_LINK_SELECTOR, els =>
    [...new Set(els.map(el => el.href).filter(h => h.includes('/paddles/') && !h.endsWith('/paddles/')))]
  );

  return hrefs;
}

async function scrapeDetailPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  const name = await page.$eval(DETAIL_NAME_SELECTOR, el => el.innerText.trim()).catch(() => null);

  // Extract brand from the URL slug (first segment after /paddles/)
  const slugParts = new URL(url).pathname.replace('/paddles/', '').split('-');
  const brand = slugParts[0].charAt(0).toUpperCase() + slugParts[0].slice(1);

  // Extract spec fields by finding label text and reading the adjacent value
  const specs = {};
  for (const [field, label] of Object.entries(SPEC_LABELS)) {
    specs[field] = await page.evaluate((labelText) => {
      const els = [...document.querySelectorAll('*')];
      const labelEl = els.find(el =>
        el.children.length === 0 &&
        el.innerText?.trim().toLowerCase() === labelText.toLowerCase()
      );
      if (!labelEl) return null;
      // Try next sibling, parent's next sibling, or adjacent dd/td
      const next = labelEl.nextElementSibling
        || labelEl.parentElement?.nextElementSibling
        || null;
      return next?.innerText?.trim() || null;
    }, label).catch(() => null);
  }

  const image = await page.$eval(DETAIL_IMAGE_SELECTOR, el => el.src).catch(() => null);
  const priceLink = await page.$eval(DETAIL_PRICE_LINK_SELECTOR, el => el.href).catch(() => null);
  const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);

  return { name, brand, ...specs, image, description, priceLink };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Collecting paddle URLs from index...');
  let urls = await collectPaddleUrls(page);

  if (LIMIT) {
    urls = urls.slice(0, LIMIT);
    console.log(`SCRAPE_LIMIT=${LIMIT} — scraping first ${urls.length} paddles`);
  } else {
    console.log(`Scraping all ${urls.length} paddles`);
  }

  const scraped = [];
  const failed = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const raw = await scrapeDetailPage(page, url);
      const paddle = mapPaddleFields(raw);
      scraped.push(paddle);
      console.log(`Scraped ${i + 1}/${urls.length} — ${paddle.name ?? url}`);
    } catch (err) {
      console.error(`Failed ${i + 1}/${urls.length} — ${url}: ${err.message}`);
      failed.push({ url, error: err.message });
    }
  }

  await browser.close();

  const output = {
    scraped,
    failed,
    meta: {
      total: urls.length,
      success: scraped.length,
      failed: failed.length,
      timestamp: new Date().toISOString(),
    },
  };

  mkdirSync('output', { recursive: true });
  writeFileSync('output/paddles.json', JSON.stringify(output, null, 2));
  console.log(`\nDone. ${scraped.length} scraped, ${failed.length} failed → output/paddles.json`);
}

main();
```

- [ ] **Step 2: Commit**

```bash
git add scripts/scrape-paddles.js
git commit -m "feat: add paddle scraper main script"
```

---

## Task 5: Run sample scrape and verify output

- [ ] **Step 1: Run the scraper with the 20-paddle limit**

```bash
cd scripts && npm run scrape
```

Expected terminal output:
```
Collecting paddle URLs from index...
SCRAPE_LIMIT=20 — scraping first 20 paddles
Scraped 1/20 — Joola Hyperion CFS 16
Scraped 2/20 — ...
...
Done. 18 scraped, 2 failed → output/paddles.json
```

- [ ] **Step 2: Inspect the output**

Open `scripts/output/paddles.json` and verify:

1. `scraped` array has objects that match the paddle schema fields
2. `name` and `brand` are populated for most paddles
3. `model` is correctly derived (brand stripped from name)
4. Spec fields (`thickness`, `weight`, `shape`, etc.) have real values, not `null` everywhere
5. `image` has a URL (not null) for most paddles
6. `meta.total` equals 20, `meta.success` is close to 20

- [ ] **Step 3: If most spec fields are null — fix the selectors**

If the output shows most spec fields as `null`, the selectors from Task 2 need adjusting. Open `scrape-paddles.js` and update the `SPEC_LABELS` values or the `scrapeDetailPage` extraction logic to match the actual page structure. Repeat Step 1 until spec fields populate correctly.

- [ ] **Step 4: Commit the verified run**

```bash
git add scripts/scrape-paddles.js
git commit -m "fix: tune selectors after sample run verification"
```

(Skip this commit if no changes were needed.)

---

## Task 6: Run full scrape (all 336+ paddles)

Only do this after the sample run in Task 5 looks correct.

- [ ] **Step 1: Remove the limit and run**

Edit `scripts/.env`:
```
# SCRAPE_LIMIT=20
```

Then run:
```bash
cd scripts && npm run scrape
```

Expected: Logs all paddles sequentially, finishes with a summary line. Full run may take 10-20 minutes.

- [ ] **Step 2: Verify the final output**

Check `output/paddles.json`:
- `meta.total` is 336 or more
- `meta.success` is high (>300)
- `failed` array is small; review each failure to see if it's a real issue or a one-off page error

- [ ] **Step 3: Restore the sample limit for future runs**

Edit `scripts/.env` back to:
```
SCRAPE_LIMIT=20
```

- [ ] **Step 4: Final commit**

```bash
git add scripts/
git commit -m "feat: complete paddle scraper — full run verified"
```
