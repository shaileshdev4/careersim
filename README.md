# A Day In (CareerSim)

Career day simulator — experience a realistic workday in a chosen career as a branching, decision-based simulation.

## Structure

```
careersim/
├── frontend/          @careersim/frontend  — Next.js UI
├── backend/
│   ├── engine/        @careersim/engine    — scenario engine, data, tests
│   └── api/           @careersim/api       — dramatization API (Anthropic)
├── README.md
└── ARCHITECTURE.md
```

## Quick start

```bash
npm install
cp frontend/.env.example frontend/.env.local    # optional keys
cp backend/api/.env.example backend/api/.env.local
npm run dev
```

- **Frontend:** http://localhost:3000  
- **API:** http://localhost:3001  

The frontend proxies `/api/dramatize` to the backend in dev.

## Scripts

| Command | What it does |
| -------- | ------------- |
| `npm run dev` | Start API + frontend together |
| `npm run dev:web` | Frontend only |
| `npm run dev:api` | API only |
| `npm run build` | Production build (engine → api → frontend) |
| `npm run test` | Engine test harness (30 tests) |
| `npm run lint` | ESLint on frontend |

## Environment

**Frontend** (`frontend/.env.local`):

- `NEXT_PUBLIC_API_URL` — API base URL (default `http://localhost:3001`)
- `PEXELS_API_KEY` — optional, for `npm run fetch-photos -w @careersim/frontend`

**API** (`backend/api/.env.local`):

- `ANTHROPIC_API_KEY` — optional; without it the API returns authored fallback text

The app is fully playable without any API key.

## Deployment

Deploy as two services (recommended):

1. **API** — `backend/api` on any Node host (Vercel, Railway, etc.)
2. **Frontend** — `frontend` with `NEXT_PUBLIC_API_URL` pointing at the API

Or run `npm run build` and host both from your platform of choice.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — engine design and grounding contract
