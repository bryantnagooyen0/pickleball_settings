---
title: Paddle Scraper Design
date: 2026-05-12
status: approved
---

# Paddle Scraper Design

## Goal

Automate collecting paddle specs from pickleballstudio.com/paddles into a JSON file that can be reviewed before importing into MongoDB. Images are captured as source URLs only — not downloaded or re-hosted.

## File Structure

```
scripts/
  scrape-paddles.js     ← single scraper script
  package.json          ← own deps (playwright, dotenv)
  .env                  ← SCRAPE_LIMIT=20 for sample runs
  output/
    paddles.json        ← written after each run (gitignored)
```

The `scripts/` folder lives at the repo root, separate from `backend/` and `frontend/`, to keep scraping tools isolated from the application.

## Approach

Single sequential script (Option A). One Playwright browser instance visits the index page, collects paddle URLs, then visits each detail page one at a time. Simple to debug, easy to limit with `SCRAPE_LIMIT`.

## Scraping Flow

1. Launch Playwright (Chromium, headless)
2. Navigate to `https://pickleballstudio.com/paddles`
3. Wait for paddle cards to render (Next.js dynamic content)
4. Collect all paddle detail page URLs from the index
5. Slice to `SCRAPE_LIMIT` if set (default: all)
6. For each URL:
   - Navigate to the paddle detail page
   - Wait for specs to load (10s timeout)
   - Extract all spec fields
   - Map to paddle schema
   - Log progress: `"Scraped 5/20 — Joola Hyperion CFS 16"`
7. Write `output/paddles.json`
8. Close browser

## Error Handling

Each paddle is wrapped in `try/catch`. Failures are collected and never crash the run. Output JSON includes three top-level keys:

```json
{
  "scraped": [...],
  "failed": [
    { "url": "...", "error": "Timeout waiting for specs element" }
  ],
  "meta": { "total": 20, "success": 18, "failed": 2, "timestamp": "..." }
}
```

Timeouts: 30s per page navigation, 10s for spec elements.

## Field Mapping

| Schema field   | Source on paddle detail page                         |
|----------------|------------------------------------------------------|
| `name`         | Full paddle name (e.g. "Joola Hyperion CFS 16")      |
| `brand`        | Brand name (e.g. "Joola")                            |
| `model`        | Model stripped of brand (e.g. "Hyperion CFS 16")     |
| `shape`        | Shape stat (e.g. "Elongated")                        |
| `thickness`    | Core thickness (e.g. "16mm")                         |
| `handleLength` | Handle length (e.g. "5.5\"")                         |
| `length`       | Paddle length in inches                              |
| `width`        | Paddle width in inches                               |
| `weight`       | Weight range (e.g. "7.9-8.3 oz")                    |
| `core`         | Core material (e.g. "Carbon Fiber")                  |
| `image`        | Image URL from the page (not downloaded)             |
| `description`  | Description text if present, else `null`             |
| `priceLink`    | Buy link if present, else `null`                     |

The field mapper is its own function, separate from navigation logic, so selectors can be adjusted without touching the scraping flow.

## Ethical Scraping

- `robots.txt` explicitly allows all crawlers on `/paddles`
- No anti-scraping measures to bypass
- Sequential requests with natural navigation delays (no hammering)
- Only capturing factual spec data and source image URLs — no images are copied or re-hosted
- Terms of service reviewed: no explicit prohibition on scraping

## Out of Scope (Next Scripts)

- Downloading and normalizing manufacturer images with Sharp
- Uploading images to Cloudinary
- Seeding the JSON into MongoDB
