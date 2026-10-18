# WoodLoop AI

WoodLoop AI is a mobile-first B2B marketplace prototype for clean, reusable solid-wood offcuts from furniture and woodworking production.

The current repository includes the project foundation, public landing/PWA foundation, and a browser-local demo authentication flow. Buyer/supplier marketplace pages remain milestone-scoped and are not represented as complete.

## Stack

- Next.js 16 App Router with React 19 and strict TypeScript
- Tailwind CSS 4 with the Forest & Timber design tokens
- Customized shadcn-compatible primitives backed by Radix UI
- Lucide icons
- React Hook Form and Zod foundations
- Dexie-backed local demo profiles and session persistence
- Vitest and Testing Library

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run format:check
```

The internal `/foundation` route is a no-index visual review surface for tokens, typography, components, and responsive behavior. It is not the public landing page.

## Current truth boundaries

- Authentication is a functional browser-local demo only; no production identity service, marketplace backend, payment, logistics, or AI endpoint is connected.
- Seed profiles and locally created demo profiles persist per browser/device. No password is stored for a local profile.
- Demo imagery is fictional and documented in [`docs/ASSET_LICENSES.md`](docs/ASSET_LICENSES.md).
- Future local demo data will be stored per browser/device and must not be represented as cross-device synchronization.
- AI suggestions must never be presented as verified species, strength, treatment, safety, or structural grading.
