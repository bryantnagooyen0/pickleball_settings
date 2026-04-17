# Pickleball Settings — Project Overview

## What This Is

A full-stack web application that tracks and displays professional pickleball players' equipment configurations. Users can browse pros, view their exact paddle specs and gear modifications, and discuss equipment in a community comment section. The site serves as the definitive reference for pickleball enthusiasts who want to know exactly how the pros set up their gear.

---

## Target Audience

- **Pickleball enthusiasts** researching what equipment pros use
- **Gear-obsessed players** trying to replicate pro setups
- **Equipment shoppers** comparing paddles and shoes before buying
- **Content creators** who cover pickleball equipment
- **Admins/content managers** who maintain player data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7 |
| UI Library | Chakra UI v2, Emotion, next-themes |
| Animations | Framer Motion |
| State | Zustand |
| Backend | Node.js, Express.js v5 |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (bcrypt password hashing) |
| Security | Helmet.js, CORS, express-rate-limit, Joi validation |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |
| Analytics | Vercel Analytics + Speed Insights |

---

## Pages & Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page — hero, featured players, search, stats |
| `/players` | Public | Full player grid with search and filter |
| `/player/:id` | Public | Individual player profile with equipment breakdown |
| `/paddles` | Public | Browse all paddles in the database |
| `/paddle/:id` | Public | Detailed paddle specs and community comments |
| `/create` | Admin | Form to add a new player profile |
| `/edit/:id` | Admin | Edit existing player profile |
| `/login` | Public (unauthed) | Login with username/password + remember me |
| `/signup` | Public (unauthed) | Create new user account |
| `/account` | Authenticated | User profile, personal comment history |
| `/privacy-policy` | Public | Legal page |
| `/legal-notice` | Public | Legal page |

---

## Core Features

### Player Profiles
Each player profile tracks:
- **Identity**: Name, photo, age, height, weight, current location, MLP team, sponsor
- **Paddle**: Brand, model, shape, thickness, core material, weight, color, price link, image
- **Shoes**: Model, image
- **Modifications**: Overgrip type/image, weight/balance mods (location, total weight), tape details, custom modifications
- **About section**: Bio/notes (hidden when empty)
- **Timestamp**: Last equipment update

### Paddle Database
Standalone paddle catalog independent of player profiles:
- Brand, model, shape, thickness, weight, core, dimensions, handle length
- Description, price link, image
- Searchable and filterable
- Active/inactive status flag

### Community Comments
- Threaded replies (nested depth tracking)
- Upvote/downvote voting system
- Users can edit and soft-delete their own comments
- Admins can hard-delete any comment
- Rate limited: 10 comments/minute per user
- Available on both player profiles and paddle pages

### Authentication
- JWT-based auth (7-day default, 30-day with "remember me")
- Role system: `user` vs `admin`
- Protected routes for create/edit/account
- Token stored in localStorage, verified on page load

---

## Data Models

### Player
```
name, image, age, height, weight
paddle, paddleBrand, paddleModel, paddleShape, paddleThickness, paddleCore,
paddleWeight, paddleColor, paddleImage, paddleLength, paddleWidth, paddleHandleLength
shoes, shoeImage, shoeModel
overgrips, overgripImage
weight (mod), weightImage, totalWeight, weightLocation
tapeDetails, additionalModification, additionalModificationImage
mlpTeam, currentLocation, about, sponsor
createdAt, updatedAt
```

### Paddle
```
name, brand, model, shape, thickness, weight, core
handleLength, length, width, color
image, description, priceLink, isActive
createdAt, updatedAt
```

### User
```
username, passwordHash, role (user | admin)
createdAt, updatedAt
```

### Comment
```
content (max 1000 chars), author (ref: User), authorName
targetType (player | paddle), targetId
isActive, parentComment (ref: Comment), depth
upvotes, downvotes, votes [{user, voteType}]
createdAt, updatedAt
```

---

## API Endpoints

### Players
- `GET /api/players` — All players
- `GET /api/players/:id` — Single player
- `POST /api/players` — Create (admin)
- `PUT /api/players/:id` — Update (admin)
- `DELETE /api/players/:id` — Delete (admin)

### Paddles
- `GET /api/paddles` — All active paddles
- `GET /api/paddles/search?q=` — Search paddles
- `GET /api/paddles/:id` — Single paddle
- `POST /api/paddles` — Create (admin)
- `PUT /api/paddles/:id` — Update (admin)
- `DELETE /api/paddles/:id` — Delete (admin)

### Comments
- `GET /api/comments/:targetType/:targetId` — Comments for player or paddle (public)
- `GET /api/comments/user/my-comments` — User's own comments (auth)
- `GET /api/comments/admin/all` — All comments (admin)
- `POST /api/comments` — Create comment (auth)
- `PUT /api/comments/:id` — Edit comment (auth, author only)
- `DELETE /api/comments/:id` — Soft delete (auth, author only)
- `DELETE /api/comments/admin/:id` — Hard delete (admin)
- `POST /api/comments/:id/vote` — Upvote/downvote (auth)

### Users
- `POST /api/users/signup` — Register
- `POST /api/users/login` — Login
- `GET /api/users/profile` — Profile (auth)
- `GET /api/users/admin/settings` — Admin settings (admin)

---

## Security

- **Helmet.js**: HTTP security headers (CSP, XSS protection, frame options)
- **CORS**: Whitelisted origins (production, localhost, Vercel preview)
- **Rate Limiting**: 1000 req/15min general, 5 req/15min auth, 10 comments/min
- **JWT**: Token expiry enforced server-side
- **Bcrypt**: 10 salt rounds for password hashing
- **Joi**: Schema validation on all write endpoints
- **Admin middleware**: Role verified on every protected route

---

## Concept & Direction

The site is positioned as the **"pro settings database" for pickleball** — similar in spirit to sites like prosettings.net (gaming peripheral tracker) but built specifically for pickleball. The core value proposition is that players who want to gear up like the pros have one authoritative, up-to-date reference.

The community layer (comments, voting) is designed to turn passive readers into active participants, building retention beyond just lookup traffic. The paddle catalog serves as a secondary discovery tool that can attract users searching for specific gear rather than specific players.

The site is in an early stage with admin-controlled content, meaning quality is curated but growth depends on admin bandwidth. The next natural evolution is expanding community participation and adding data-driven features that increase SEO footprint and return visits.

---

## Key Strengths

- Clean, modern UI with dark/light mode
- Comprehensive equipment data model (covers modifications most sites ignore)
- Community features already scaffolded (comments, voting)
- Solid security foundation
- Mobile responsive

## Current Limitations

- Content creation is admin-gated (no user-submitted content)
- No SEO optimization (no meta tags, structured data, or sitemaps)
- No social sharing features
- No notifications or engagement loops
- No equipment history tracking (just current state)
- No external data integration (ATP/MLP standings, tournament results)
- No personalization (favorites, wishlists, custom comparisons)
