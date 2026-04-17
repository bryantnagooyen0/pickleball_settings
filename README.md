# Pickleball Settings

A full-stack web application that tracks pro pickleball players and their gear setups, hosts a paddle catalog, and provides a community hub where players can share and discover paddle setup configurations.

## Features

- **Pro Players** — Browse pro players and their equipment (paddle, shoes, sponsors)
- **Paddle Catalog** — View all paddles, see which pros use them, check specs and pricing
- **Community Setups** — Share your paddle setup with an interactive lead tape canvas, browse what other players are running, like and comment on setups
- **Comments & Voting** — Threaded comments with upvote/downvote on players, paddles, and community setups
- **User Auth** — Sign up, log in, role-based access (user / admin)
- **Admin Controls** — Create/edit players and paddles, moderate comments

## Tech Stack

### Frontend
- **React 19** + **Vite**
- **Chakra UI** — component library
- **Zustand** — state management
- **Framer Motion** — animations
- **React Router** — client-side routing

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** — authentication
- **bcrypt** — password hashing

### Deployment
- Frontend: **Vercel**
- Backend: **Render** (with keep-alive ping to prevent cold starts)

## Project Structure

```
pickleball_settings/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── player.controller.js
│   │   ├── paddle.controller.js
│   │   ├── comment.controller.js
│   │   ├── setup.controller.js        # Community Setups
│   │   └── users_controller.mjs
│   ├── middleware/
│   │   ├── auth.js                    # JWT authMiddleware + adminMiddleware
│   │   ├── rateLimiter.js
│   │   ├── security.js
│   │   └── validation.js
│   ├── models/
│   │   ├── player.model.js
│   │   ├── paddle.model.js
│   │   ├── comment.model.js
│   │   ├── setup.model.js             # Community Setups
│   │   └── users_model.mjs
│   ├── routes/
│   │   ├── player.route.js
│   │   ├── paddle.route.js
│   │   ├── comment.route.js
│   │   └── setup.route.js             # Community Setups
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── PlayerCard.jsx
│       │   ├── CommentSection.jsx
│       │   ├── SetupCanvas.jsx        # Interactive SVG lead tape canvas
│       │   ├── SetupCard.jsx          # Setup preview card
│       │   ├── VoteButtons.jsx
│       │   └── ui/
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── Players.jsx
│       │   ├── PlayerDetailPage.jsx
│       │   ├── PaddleManagementPage.jsx
│       │   ├── PaddleDetailPage.jsx
│       │   ├── CommunityPage.jsx      # /community hub
│       │   ├── PaddleSetupsPage.jsx   # /community/paddle/:id
│       │   ├── SetupDetailPage.jsx    # /setup/:id
│       │   ├── NewSetupPage.jsx       # /community/new
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   └── AccountPage.jsx
│       ├── store/
│       │   ├── player.js
│       │   ├── paddle.js
│       │   └── setup.js               # Community Setups store
│       ├── hooks/
│       │   └── useAuth.js
│       └── utils/
│           └── api.js
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-04-17-community-setups-design.md
```

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install
```

### Environment Variables

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### Running Locally

```bash
# Terminal 1 — backend (from /backend)
npm run dev

# Terminal 2 — frontend (from /frontend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Players
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/players` | No | List all players |
| GET | `/api/players/:id` | No | Get player |
| POST | `/api/players` | Admin | Create player |
| PUT | `/api/players/:id` | Admin | Update player |
| DELETE | `/api/players/:id` | Admin | Delete player |

### Paddles
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/paddles` | No | List all paddles |
| GET | `/api/paddles/:id` | No | Get paddle |
| GET | `/api/paddles/search` | No | Search paddles |
| POST | `/api/paddles` | Admin | Create paddle |
| PUT | `/api/paddles/:id` | Admin | Update paddle |
| DELETE | `/api/paddles/:id` | Admin | Delete paddle |

### Community Setups
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/setups` | No | List setups (filter by `paddleId`, sort by `likes`/`newest`) |
| GET | `/api/setups/recent` | No | 5 most recent setups |
| GET | `/api/setups/paddles-with-setups` | No | Paddles that have setups + counts |
| GET | `/api/setups/:id` | No | Get setup |
| POST | `/api/setups` | Yes | Create setup |
| PUT | `/api/setups/:id` | Yes (author) | Update setup |
| DELETE | `/api/setups/:id` | Yes (author/admin) | Soft delete setup |
| POST | `/api/setups/:id/like` | Yes | Toggle like |

### Comments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/comments/:targetType/:targetId` | No | Get comments (targetType: player, paddle, setup) |
| POST | `/api/comments/:targetType/:targetId` | Yes | Post comment |
| PUT | `/api/comments/:id` | Yes (author) | Edit comment |
| DELETE | `/api/comments/:id` | Yes (author/admin) | Delete comment |
| POST | `/api/comments/:id/vote` | Yes | Vote on comment |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users/signup` | No | Register |
| POST | `/api/users/login` | No | Log in (returns JWT) |
| GET | `/api/users/me` | Yes | Get current user |

## Community Setups Feature

Users can share how they've set up their paddle — where they placed lead tape, what overgrip they use, edge guard, and total weight.

**Setup fields:**
- **Lead tape strips** — placed via interactive SVG canvas (positions stored as % of paddle bounding box so they scale to any screen size)
- **Overgrip** — brand + notes
- **Edge guard** — brand + notes
- **Total weight** — grams after all mods
- **Notes** — free text
- **Photo** — optional photo of the physical paddle

**Routes:**
- `/community` — hub page: newest setups strip + browse paddles that have setups
- `/community/paddle/:paddleId` — all setups for one paddle, sortable by likes or newest
- `/community/new` — 4-step submission form (login required)
- `/setup/:setupId` — detail page with full canvas, photo, like button, and comments

Setups must be linked to an existing paddle in the catalog. Users can submit multiple setups per paddle.
