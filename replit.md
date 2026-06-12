# Sip of Sky

A full-stack rooftop restaurant web app — online menu, table booking, food ordering, customer reviews, and an admin panel — all backed by a real PostgreSQL database and Express API.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/sip-of-sky run dev` — run the frontend (served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Wouter (routing), TanStack Query, Framer Motion, next-themes
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/restaurant.ts` — all DB tables (menu_items, orders, bookings, reviews, restaurant_info)
- `artifacts/api-server/src/routes/` — API route handlers (menu, orders, bookings, reviews, restaurant)
- `artifacts/sip-of-sky/src/pages/` — all frontend pages (home, menu, order, book, reviews, admin)
- `artifacts/sip-of-sky/src/lib/cart-context.tsx` — cart state (React context)
- `artifacts/sip-of-sky/src/lib/theme-provider.tsx` — dark/light mode (next-themes)

## Architecture decisions

- OpenAPI-first: all API contracts defined in `openapi.yaml`, types/hooks generated from it via Orval
- Cart state is client-side only (React context) — only the submitted order hits the backend
- Restaurant open/closed status computed server-side from `openTime`/`closeTime` fields against current UTC time
- Reviews auto-approved on submission (no moderation queue for MVP)
- `orders.items` stored as JSONB to avoid a separate order_items join table

## Product

- **Home**: Hero with real-time open/closed badge, featured dishes, review summary, CTA buttons
- **Menu**: All dishes with category tabs, search, veg/spicy filters, add-to-cart, floating cart drawer
- **Order**: Cart review, customer info form, place order, confirmation screen
- **Book a Table**: Reservation form with date/time/party size, backend storage, confirmation
- **Reviews**: All approved reviews, rating breakdown, submit a new review
- **Admin**: Menu CRUD, order management with status updates + stats, booking management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always re-run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`
- The `menu/categories` and `menu/featured` routes must be registered BEFORE `menu/:id` in Express (more-specific paths first)
- `orders/stats` must be registered BEFORE `orders/:id` for the same reason
- `reviews/summary` must be registered BEFORE `reviews/:id`
- Google Fonts `@import url(...)` must be the FIRST line in `index.css` — before `@import "tailwindcss"`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
