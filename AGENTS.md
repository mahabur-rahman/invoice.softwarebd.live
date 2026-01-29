# AGENTS.md

Project: sellyx-web (Next.js 16 App Router frontend)

## Quick commands
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint
- `npm run codegen` - GraphQL types/codegen (uses remote schema)

## Environment
- Copy `.env.example` to `.env` and fill required keys.
- Uses `NEXT_PUBLIC_*` for client-side envs.

## Repo layout
- `app/` - App Router pages/routes (route groups like `(auth)` and `(dashboard)`).
- `components/` - shared UI components.
- `lib/graphql/` - GraphQL queries/mutations and generated types.
- `utils/`, `assets/`, `public/` - supporting code and assets.

## GraphQL and codegen
- Queries/mutations live in `lib/graphql/**`.
- Generated types live in `lib/graphql/generated-types.ts` (do not hand-edit).
- `npm run codegen` uses the schema URL in `codegen.ts`.

## Conventions and gotchas
- TypeScript throughout; keep types in sync with GraphQL selections.
- Prefer Apollo `useQuery`/`useMutation` with generated types where possible.
- For image URLs, Next.js remote patterns are configured in `next.config.ts`.

## Git workflow (required)
Before starting work on `RK`:
- `git checkout dev`
- `git pull`
- `git checkout RK`
- `git merge dev`

Before pushing `RK`:
- Ensure `RK` contains latest `origin/dev`.
- Optional: set up a local pre-push hook to block pushes when `origin/dev` is not merged.

