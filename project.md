# Pickleball Settings — Project Overview

## What This Is

A full-stack web app that serves as the go-to reference for pickleball gear. It tracks pro players and their complete equipment setups, hosts a searchable paddle catalog, and provides a community hub where regular players can share and discover how others have set up their paddles (lead tape placement, overgrip, edge guard, weight).

**Live site:** pickleballsettings.com  
**Backend host:** Render (keep-alive ping every 10 min to prevent cold starts)  
**Frontend host:** Vercel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Chakra UI, Zustand, Framer Motion, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (stored in localStorage), bcrypt |
| Security | Helmet, CORS, rate limiting (express-rate-limit) |
| Analytics | Vercel Analytics + Speed Insights |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Guest** | View all public content, browse players/paddles/community setups |
| **User** | Everything guest can do + post comments, vote, submit community setups, like setups |
| **Admin** | Everything user can do + create/edit/delete players and paddles, moderate all comments |

---

## Features

### 1. Landing Page (`/`)
- Animated hero with parallax scroll and mouse-tracking effect
- Live stats: total player count, paddle count
- Search bar that filters players in real time
- Player grid preview with links to full player list
- Animated section reveals using Framer Motion + IntersectionObserver

### 2. Pro Players (`/players`)
- Full searchable/filterable grid of all pro players
- Filter drawer with options for paddle brand, MLP team, location
- Scroll position restoration when navigating back from a player detail page
- Player cards showing name, photo, paddle, and sponsor

### 3. Player Detail (`/player/:playerId`)
- Full player profile: photo, bio, age, height, location, MLP team
- Complete equipment breakdown:
  - Paddle (brand, model, shape, thickness, handle length, weight, core, color)
  - Shoes (brand, model, image)
  - Overgrip
  - Lead tape (weight, location, details)
  - Additional modifications
  - Sponsor
- Equipment displayed via `EquipmentModule` component (hidden if no info)
- Clickable paddle badge that links to the paddle's detail page in the catalog
- Threaded comment section with upvote/downvote
- Admin-only edit/delete controls

### 4. Paddle Catalog (`/paddles`)
- Full paddle grid with search
- Admin modal for adding new paddles and editing existing ones
- Each paddle card shows brand, model, shape, thickness, and image
- Scroll position restoration when navigating back from a paddle detail

### 5. Paddle Detail (`/paddle/:paddleId`)
- Full paddle specs: brand, model, shape, thickness, handle length, length, width, weight, core, color
- "Check Price" button (links to external pricing URL if set)
- Pro players section — shows all pros currently using that paddle (matched by name, shape, and thickness)
- Community Setups preview — top 3 most-liked community setups for this paddle with links to submit or see all
- Threaded comment section with upvote/downvote
- Admin-only edit/delete controls

### 6. Community Setups (`/community`)

The hub for player-submitted paddle setup configurations.

**Community Hub page (`/community`):**
- "Newest Setups" horizontal strip — 5 most recently submitted setups across all paddles
- Search bar filters the paddle grid
- "Browse by Paddle" grid — shows every paddle that has at least one setup, with setup count
- "+ Share Your Setup" button (requires login)

**Paddle Setups page (`/community/paddle/:paddleId`):**
- All setups submitted for one specific paddle
- Sort by Most Liked or Newest
- Empty state CTA if no setups yet

**New Setup page (`/community/new`):**
4-step submission form (login required, links to existing DB paddles only):
1. **Select Paddle** — searchable list of all paddles in the catalog
2. **Lead Tape Canvas** — interactive SVG canvas; click and drag to place tape strips on a generic paddle outline; each strip stores position as % of paddle bounding box so it scales to any screen; weight and label per strip; strips clip to paddle shape
3. **Other Mods** — overgrip brand + notes, edge guard brand + notes, total weight after mods (grams), free-text notes
4. **Photo & Submit** — optional photo upload (stored as base64), setup summary review, submit

**Setup Detail page (`/setup/:setupId`):**
- Full-size read-only SVG canvas showing lead tape placement
- Optional photo displayed alongside canvas
- Full mod details panel (lead tape total, overgrip, edge guard, total weight, notes)
- Like button (toggle; requires login; shows live count)
- Threaded comment section (reuses existing CommentSection with `targetType: 'setup'`)
- Author-only edit/delete controls

**Setup Card component:**
- Miniature SVG canvas thumbnail
- Paddle name, author username
- Mod badges (lead tape grams, overgrip brand, total weight)
- Like count, photo indicator badge
- Used in all feeds and grids

### 7. Comments & Voting
- Threaded comments (nested replies) on players, paddles, and community setups
- Upvote / downvote on comments
- User can only vote once per comment (toggling removes vote)
- Admins can delete any comment; users can edit/delete their own
- Rate limited: 10 comments per minute per IP
- Comment section reused via `CommentSection` component across all three target types

### 8. Auth (`/login`, `/signup`)
- JWT-based auth stored in localStorage
- "Remember Me" option
- Token expiry checked on every page load
- Protected routes redirect to `/login` if unauthenticated
- Public routes (login/signup) redirect to home if already authenticated

### 9. Account Page (`/account`)
- Shows logged-in username and role badge
- User: view their own comments
- Admin: view and moderate all comments via `AdminComments` component

### 10. Security & Performance
- Helmet for HTTP security headers (CSP, X-Frame-Options, MIME sniffing prevention, XSS protection)
- Rate limiting: 1000 req/15 min general, 5 req/15 min for auth endpoints, 10/min for comments
- CORS configured for production domains + local dev
- Keep-alive ping every 10 minutes to prevent Render cold starts
- Scroll restoration on list → detail → back navigation
- Vercel Analytics + Speed Insights for production monitoring

---

## Data Models

### Player
```
name, paddle, paddleBrand, paddleModel, paddleShape, paddleThickness,
paddleHandleLength, paddleLength, paddleWidth, paddleColor, paddleImage,
paddleCore, paddleWeight, shoes, shoeImage, shoeModel, image, age,
height, mlpTeam, currentLocation, about, overgrips, overgripImage,
weight, weightImage, totalWeight, weightLocation, tapeDetails,
additionalModification, additionalModificationImage, sponsor
```

### Paddle
```
name, brand, model, shape, thickness, handleLength, length, width,
color, weight, core, image, description, priceLink, isActive
```

### Setup (Community Setups)
```
paddle (ref), author (ref), authorName,
leadTapeStrips: [{ x%, y%, width%, height%, weightGrams, label }],
leadTapeTotalGrams, overgrip: { brand, notes },
edgeGuard: { brand, notes }, totalWeightGrams, notes,
photoUrl, likes: [userId], likesCount, isActive
```

### Comment
```
content, author (ref), authorName, targetType (player|paddle|setup),
targetId, parentComment (ref), depth, upvotes, downvotes,
votes: [{ user, voteType }], isActive
```

### User
```
username, passwordHash, role (user|admin)
```

---

## Key File Locations

| What | Where |
|------|-------|
| Express server | `backend/server.js` |
| Auth middleware | `backend/middleware/auth.js` |
| Setup controller | `backend/controllers/setup.controller.js` |
| Interactive SVG canvas | `frontend/src/components/SetupCanvas.jsx` |
| Setup submission form | `frontend/src/pages/NewSetupPage.jsx` |
| Community hub | `frontend/src/pages/CommunityPage.jsx` |
| Zustand setup store | `frontend/src/store/setup.js` |
| API utility | `frontend/src/utils/api.js` |
| Auth hook | `frontend/src/hooks/useAuth.js` |
| App routes | `frontend/src/App.jsx` |

---

## Routes Summary

| Path | Page | Auth |
|------|------|------|
| `/` | Landing Page | Public |
| `/players` | Player list | Public |
| `/player/:id` | Player detail | Public |
| `/paddles` | Paddle catalog | Public |
| `/paddle/:id` | Paddle detail | Public |
| `/community` | Community hub | Public |
| `/community/paddle/:id` | Paddle setups | Public |
| `/community/new` | Submit setup | Login required |
| `/setup/:id` | Setup detail | Public |
| `/login` | Login | Guest only |
| `/signup` | Sign up | Guest only |
| `/account` | Account | Login required |
| `/create` | Create player | Admin only |
| `/edit/:id` | Edit player | Admin only |
| `/privacy-policy` | Privacy Policy | Public |
| `/legal-notice` | Legal Notice | Public |
