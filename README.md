# Tanstack Start base
Frontend web application base, built with **TanStack Start + React 19 + shadcn/ui + Tailwind CSS v4 + Supabase**.

## Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 22.x |
| pnpm | 9.x |

## Setup from Scratch

### 1. Install Node.js (if not already installed)

Check if Node.js is installed:

```bash
node --version
```

If not, install via one of the following:

**Windows (nvm-windows — recommended):**

```powershell
# Download and install nvm-windows from:
# https://github.com/coreybutler/nvm-windows/releases
nvm install 22
nvm use 22
```

**Windows (direct install):**

Download the LTS installer from https://nodejs.org.

**macOS / Linux (nvm):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# Close and reopen your terminal, then run:
nvm install 22
nvm use 22
```

### 2. Install pnpm

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm --version
```

### 3. Clone & Install Dependencies



### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in the values in `.env`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_KEY=sb_publishable_...
```

### 5. Start the Dev Server

```bash
pnpm dev
```

Open http://localhost:3000.

## Supabase

The app connects to Supabase through `@supabase/supabase-js`. The client is created once in `src/utils/supabase.ts` and reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` from the environment.

The home route (`src/routes/index.tsx`) demonstrates reading rows from the `todos` table. Create that table in the Supabase dashboard before relying on the demo.

## Common Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run tests (Vitest) |
| `pnpm format` | Format code (Prettier) |
| `pnpm check` | Check formatting (Prettier) |
| `pnpm lint` | Lint code (ESLint) |
| `pnpm exec biome check --write` | Lint + format (Biome, canonical) |

## Quality Gate

Run these after larger changes or before merging (see `docs/handbook/06_quality_rules.md`):

```bash
pnpm exec biome check --write
pnpm typecheck
pnpm build
```

## Tech Stack

| Layer | Technology |
|---|---|
| App framework | TanStack Start |
| Routing | TanStack Router |
| Server state | TanStack Query |
| Data platform | Supabase |
| Validation | Zod |
| UI | React 19, shadcn/ui, Base UI |
| Styling | Tailwind CSS v4 |
| Icons | @tabler/icons-react |
| Testing | Vitest |
| Format/Lint | Biome (+ ESLint / Prettier) |

## Documentation

All architecture docs, conventions, and checklists live in `docs/handbook/`.

| Document | Contents |
|---|---|
| [`docs/handbook/00_index.md`](docs/handbook/00_index.md) | Handbook index & overview |
| [`docs/handbook/01_project_overview.md`](docs/handbook/01_project_overview.md) | Project scope & tech stack |
| [`docs/handbook/02_architecture.md`](docs/handbook/02_architecture.md) | Feature-based architecture & route orchestration |
| [`docs/handbook/03_feature_development.md`](docs/handbook/03_feature_development.md) | Building & refactoring feature modules |
| [`docs/handbook/04_tanstack_start_query_router.md`](docs/handbook/04_tanstack_start_query_router.md) | TanStack Start, Router, Query, Supabase, SSR |
| [`docs/handbook/05_ui_state_patterns.md`](docs/handbook/05_ui_state_patterns.md) | Loading, error, empty, & form action states |
| [`docs/handbook/06_quality_rules.md`](docs/handbook/06_quality_rules.md) | Consistency rules & review expectations |
| [`docs/handbook/07_development_checklist.md`](docs/handbook/07_development_checklist.md) | Dev & review checklist |

Design tokens live in [`docs/design-system/`](docs/design-system/).

Agent and automation tools should read [`AGENTS.md`](AGENTS.md) first.

## External Docs

- [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Supabase JS](https://supabase.com/docs/reference/javascript/)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Base UI](https://base-ui.com/react/overview/quick-start)
- [Zod](https://zod.dev)
- [Tabler Icons](https://tabler.io/docs/quickstart/react)
