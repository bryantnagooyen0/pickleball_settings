import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mapPaddleFields } from './mapper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const rawLimit = process.env.SCRAPE_LIMIT ? parseInt(process.env.SCRAPE_LIMIT, 10) : null;
if (rawLimit !== null && isNaN(rawLimit)) throw new Error(`Invalid SCRAPE_LIMIT: "${process.env.SCRAPE_LIMIT}"`);
const LIMIT = rawLimit;

const BASE_URL = 'https://pickleballstudio.com';

const SPEC_LABELS = {
  shape: 'Shape',
  thickness: 'Core Thickness',
  handleLength: 'Handle Length',
  core: 'Core Material',
};

async function collectPaddleUrls(page) {
  await page.goto(`${BASE_URL}/paddles`, { waitUntil: 'networkidle', timeout: 30000 });

  // Scroll to load all paddles (infinite scroll / load more)
  let previousCount = 0;
  let attempts = 0;
  while (attempts < 20) {
    const links = await page.$$eval(
      'a[href^="/paddles/"]',
      els => [...new Set(els.map(el => el.getAttribute('href')).filter(h => h && h !== '/paddles/'))]
    );
    if (links.length === previousCount) break;
    previousCount = links.length;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    attempts++;
  }

  const hrefs = await page.$$eval(
    'a[href^="/paddles/"]',
    els => [...new Set(els.map(el => el.getAttribute('href')).filter(h => h && h !== '/paddles/'))]
  );

  return hrefs.map(h => `${BASE_URL}${h}`);
}

async function scrapeDetailPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  const name = await page.$eval('h1', el => el.innerText.trim()).catch(() => null);
  const brand = await page.$eval('div.flex.items-center.gap-3 > span', el => el.innerText.trim()).catch(() => null);

  // Extract spec fields from the labeled grid
  const specs = {};
  for (const [field, label] of Object.entries(SPEC_LABELS)) {
    specs[field] = await page.evaluate((labelText) => {
      const grids = document.querySelectorAll('div.grid.grid-cols-2.items-center');
      for (const grid of grids) {
        const spans = grid.querySelectorAll('span');
        if (spans.length >= 2 && spans[0].innerText.trim() === labelText) {
          return spans[1].innerText.trim() || null;
        }
      }
      return null;
    }, label).catch(() => null);
  }

  // Fields not available on site
  const length = null;
  const width = null;
  const weight = null;
  const priceLink = null;

  const image = await page.$eval('img.object-contain.p-8', el => el.src).catch(() => null);
  const description = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null);

  return { name, brand, ...specs, length, width, weight, image, description, priceLink };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
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

    mkdirSync(join(__dirname, 'output'), { recursive: true });
    writeFileSync(join(__dirname, 'output', 'paddles.json'), JSON.stringify(output, null, 2));
    console.log(`\nDone. ${scraped.length} scraped, ${failed.length} failed → output/paddles.json`);
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
