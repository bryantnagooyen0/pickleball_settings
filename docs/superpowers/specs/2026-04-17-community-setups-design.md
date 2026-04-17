# Community Setups Feature Design

**Date:** 2026-04-17  
**Status:** Approved

---

## Overview

Community Setups turns the site into a hub where players can look up their paddle and see how other users have set it up — lead tape placement, overgrip, edge guard, weight, and notes. Users submit their own setups, like and comment on others.

---

## Site Structure

- **`/community`** — new top-level community hub page (added to Navbar)
- **`/community/paddle/:paddleId`** — all setups for a specific paddle
- **`/community/new`** — setup submission form (protected, login required)
- **`/setup/:setupId`** — individual setup detail page
- **`/paddle/:paddleId`** — existing page gets a "Community Setups" preview section (top 3 setups + link to `/community/paddle/:paddleId`)

---

## Community Page Layout (`/community`)

Two-section hybrid layout:

1. **Header** — title, subtitle, "+ Share Your Setup" button, search bar (filters paddle cards)
2. **Newest Setups strip** — horizontal scroll of the 5 most recent setups across all paddles (setup cards showing paddle name, SVG canvas thumbnail, author, like count)
3. **Browse by Paddle grid** — cards for every paddle that has at least one setup, showing paddle name, paddle image, and setup count. Clicking a card navigates to `/community/paddle/:paddleId`.

Only paddles with at least one setup appear in the paddle grid.

---

## Paddle Setups Page (`/community/paddle/:paddleId`)

- Paddle info header (name, brand, image from existing paddle DB record)
- "Share a Setup for This Paddle" button (navigates to `/community/new?paddleId=:paddleId`)
- Grid of all setup cards for that paddle, sorted by most liked (toggle to newest)

---

## Setup Card

Shown in feeds and grids. Contains:
- Miniature SVG canvas thumbnail showing lead tape placement
- Photo badge if a photo was uploaded
- Paddle name
- Author username
- Mod summary badges: lead tape grams, overgrip brand
- Like count (❤️) and comment count (💬)
- Clicking navigates to `/setup/:setupId`

---

## Setup Detail Page (`/setup/:setupId`)

- Full-size SVG canvas rendered read-only from stored tape strip data
- Optional photo displayed alongside canvas
- Mod details: lead tape total grams, overgrip brand + notes, edge guard brand + notes, total weight, free-text notes
- Like button (toggle; requires login; shows count)
- Comment section — reuses existing `CommentSection` component with `targetType: 'setup'`
- Edit / Delete buttons visible only to the setup's author

---

## Submission Form (`/community/new`)

Protected route (login required). Multi-step:

1. **Step 1 — Select Paddle**: Searchable dropdown populated from existing paddle DB. Pre-selected if navigated from a paddle page (`?paddleId=`). Must link to an existing paddle — no free-text entry.
2. **Step 2 — Lead Tape Canvas**: Interactive SVG canvas. User clicks to start a tape strip, drags to size it, releases to open a popover for weight (grams) and optional label. Strips render in orange. User can click an existing strip to edit or delete it.
3. **Step 3 — Other Mods**: Fields for overgrip (brand, notes), edge guard (brand, notes), total weight after mods (grams), free-text notes.
4. **Step 4 — Photo**: Optional photo upload (same upload infrastructure as player/paddle images).
5. **Submit** → redirects to `/setup/:setupId` for the new setup.

Users may submit multiple setups for the same paddle.

---

## Interactive SVG Canvas

- Generic paddle silhouette (elongated oval head + rectangular handle) as SVG path — same outline for all paddles
- Tape strip interaction: `mousedown` → drag → `mouseup` triggers popover for weight + label entry
- Strips clipped to paddle boundary using SVG `clipPath`
- Touch events supported (`touchstart`/`touchmove`/`touchend`) for mobile
- Minimum canvas size: 300×450px
- Read-only mode (for display): renders strips from stored JSON, no interaction
- No additional libraries — pure React + SVG

---

## Data Model

### Setup (`backend/models/setup.model.js`)

```js
{
  paddle: ObjectId (ref: 'Paddle', required),
  author: ObjectId (ref: 'User', required),
  authorName: String (required),

  leadTapeStrips: [{
    x: Number,           // % from left of paddle bounding box (0-100)
    y: Number,           // % from top (0-100)
    width: Number,       // % of paddle bounding box width (0-100)
    height: Number,      // % of paddle bounding box height (0-100)
    weightGrams: Number,
    label: String        // optional, e.g. "12 o'clock"
  }],
  leadTapeTotalGrams: Number,

  overgrip: {
    brand: String,
    notes: String
  },
  edgeGuard: {
    brand: String,
    notes: String
  },
  totalWeightGrams: Number,
  notes: String,

  photoUrl: String,       // optional

  likes: [ObjectId],      // user IDs — prevents double-likes
  likesCount: Number,     // denormalized for fast sorting

  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

Indexes: `{ paddle: 1, likesCount: -1 }`, `{ paddle: 1, createdAt: -1 }`, `{ author: 1 }`

### Comment model extension

Add `'setup'` to the `targetType` enum in `comment.model.js`. No other changes to comments infrastructure.

---

## Backend Routes (`backend/routes/setup.route.js`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/setups` | No | List setups (query: `paddleId`, `sort`, `limit`, `page`) |
| GET | `/api/setups/recent` | No | 5 most recent setups (for newest strip) |
| GET | `/api/setups/paddles-with-setups` | No | Paddles that have ≥1 setup with counts |
| GET | `/api/setups/:id` | No | Single setup detail |
| POST | `/api/setups` | Yes | Create setup |
| PUT | `/api/setups/:id` | Yes (author only) | Update setup |
| DELETE | `/api/setups/:id` | Yes (author only) | Soft delete (`isActive: false`) |
| POST | `/api/setups/:id/like` | Yes | Toggle like |

---

## Frontend Components

### New
- `SetupCanvas.jsx` — SVG canvas component (interactive + read-only modes)
- `SetupCard.jsx` — card for feeds and grids
- `SetupSubmissionForm.jsx` — multi-step form

### New Pages
- `CommunityPage.jsx` — `/community`
- `PaddleSetupsPage.jsx` — `/community/paddle/:paddleId`
- `SetupDetailPage.jsx` — `/setup/:setupId`
- `NewSetupPage.jsx` — `/community/new`

### Extended
- `PaddleDetailPage.jsx` — add community setups preview section (top 3 + link)
- `Navbar.jsx` — add "Community" link
- `App.jsx` — add 4 new routes
- `comment.model.js` — add `'setup'` to targetType enum

### New Store
- `setup.js` (Zustand store) — mirrors existing `paddle.js` / `player.js` pattern

---

## Auth & Permissions

- Viewing setups: public (no login required)
- Submitting a setup: login required
- Editing/deleting a setup: login required + must be the author
- Liking a setup: login required
- Commenting: login required (existing comment auth unchanged)
- Admin: can delete any setup (isActive: false)

---

## Paddle Detail Page Integration

Existing `/paddle/:paddleId` page gets a new section below the current content:
- Heading: "Community Setups"
- Shows top 3 most-liked setups for that paddle as `SetupCard` components
- "See all X setups →" link to `/community/paddle/:paddleId`
- "Share Your Setup" button to `/community/new?paddleId=:paddleId`
- If no setups exist yet: show a call-to-action ("Be the first to share your setup")
