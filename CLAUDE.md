# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint with Next.js rules
npm start        # Run production server
```

## Architecture

**To The Pub** is a nightlife discovery platform connecting users with bars/venues and their events. It is a Next.js 15 (App Router) + React 19 + TypeScript frontend that proxies to a separate backend API.

### Backend connection

The backend runs at `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:5000`). All API calls go through `src/lib/api.ts`, which wraps `fetch` with JWT auth headers. The Next.js API routes under `src/app/api/` are thin proxies that forward requests to this backend.

### Authentication flow

JWT tokens are stored in `localStorage` via `src/lib/auth.ts`. `AuthContext` (`src/contexts/AuthContext.tsx`) provides global auth state. Protected pages use `usePrivateRoute` (`src/hooks/usePrivateRoute.ts`) which redirects unauthenticated users to `/login`.

### Key areas

- `src/app/dashboard/` — Business management portal (venues, hours, tags, events, users)
- `src/app/api/` — Proxy routes to backend (`/bars/*`, `/events/*`, `/tags/*`, `/event-tags/*`, `/users/*`)
- `src/components/cards/` — Reusable dashboard cards (BusinessInfoCard, BarHoursCard, TagsCard)
- `src/components/auth/` — ProtectedRoute wrapper and UserProfile
- `src/lib/api.ts` — Auth-aware fetch client (use this for all backend calls)

### Styling

Tailwind CSS v4. Design tokens are CSS variables in `src/app/globals.css`: primary dark sapphire (`#1A2B3C`), teal accent (`#00B8D4`), goldenrod secondary (`#FFC107`). Use these variables rather than hardcoded colours. Toast notifications use Sonner.

### Path aliases

`@/*` maps to `./src/*` — use this for all imports.
