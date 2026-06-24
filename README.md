# A Day In (CareerSim)

Career day simulator — experience a realistic workday in a chosen career as a branching, decision-based simulation.

## Structure

```
careersim/
├── frontend/          @careersim/frontend  — Next.js app + /api/dramatize
├── backend/
│   ├── engine/        @careersim/engine    — scenario engine, data, tests
│   └── api/           @careersim/api       — optional standalone API (local dev)
├── README.md
└── ARCHITECTURE.md
```

## Quick start

```bash
npm install
cp frontend/.env.example frontend/.env.local   # optional: ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000. The dramatize API runs as a Next.js route at `/api/dramatize` — no separate server needed.

## Scripts

| Command | What it does |
| -------- | ------------- |
| `npm run dev` | Start frontend (UI + API routes) |
| `npm run dev:split` | Frontend + separate API on :3001 (optional) |
| `npm run build` | Production build |
| `npm run test` | Engine test harness (34 tests) |
| `npm run lint` | ESLint on frontend |

## Environment

Set in `frontend/.env.local` locally, or in the Vercel dashboard for production:

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `ANTHROPIC_API_KEY` | No | Live scene dramatization; without it, authored text is used |
| `PEXELS_API_KEY` | No | Local only — `npm run fetch-photos -w @careersim/frontend` |

The app is fully playable without any API key.

## Deploy on Vercel

**Recommended:** import [github.com/shaileshdev4/careersim](https://github.com/shaileshdev4/careersim) and set:

| Setting | Value |
| -------- | ----- |
| **Root Directory** | `frontend` |
| **Framework Preset** | Next.js |
| **Build Command** | *(default — uses `next build`)* |
| **Install Command** | `cd .. && npm install` *(or use `frontend/vercel.json`)* |

**Environment variables** (Vercel → Settings → Environment Variables):

- `ANTHROPIC_API_KEY` — optional, for live dramatization

No `NEXT_PUBLIC_API_URL` needed — API is same-origin on Vercel.

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshaileshdev4%2Fcareersim&root-directory=frontend)

After deploy, toggle **live dramatization** in the sim to use the API route.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — engine design and grounding contract
