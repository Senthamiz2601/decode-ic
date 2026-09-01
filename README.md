# Decode.ic — Frontend

> Understand your code before you change it.

AI-powered codebase impact & architecture intelligence platform. This is the
React + TypeScript frontend, built against the visual system pulled from the
connected Figma landing page and extended consistently across the rest of
the product.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

```bash
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## What's implemented

- **Landing page** — pixel-matched to the connected Figma file (hero, nav,
  final CTA, footer). This was the only screen actually designed in Figma;
  everything below extends its token system (colors, type, spacing, radii).
- **Auth** — Login / Register (mocked, no real backend yet).
- **App shell** — collapsible sidebar, topbar, ⌘K command palette, notifications panel.
- **Dashboard** — portfolio metrics, health trend, risk distribution, repository grid.
- **Repositories** — list with open / re-analyze / settings / remove actions.
- **Connect GitHub flow** — connect → choose repo → configure → simulated analysis progress.
- **Repository Overview** — health, language mix, debt summary, top risks, quick links.
- **Architecture Explorer** — interactive React Flow graph (zoom/pan/select), layer filter, search, node inspector panel.
- **Dependency Explorer** — filterable table (direct/indirect/circular/unused) + relationship graph.
- **Code Explorer** — file tree, code viewer, AI intelligence panel.
- **AI Assistant** — repository-aware chat with suggested questions and related-file citations.
- **Risk Center** — filterable risk list with reasons, affected files, recommendations.
- **Technical Debt** — category breakdown chart + issue list.
- **Code Health** — overall score, radar of subscores, trend, breakdown bars.
- **Impact Analysis** — target selector, impact score, full dependency/API/test breakdown.
- **Change Simulation** — free-text change description → affected list + migration plan.
- **AI Refactoring** — recommendation cards (problem / explanation / recommendation / files / tests).
- **Reports** — preview/generate/download cards for all report types.
- **Settings** — account, GitHub, analysis, AI, notifications, security tabs.
- **Empty / loading / error states** — reusable components used throughout.

## Architecture notes

- `src/services/*` are the integration seam for the future FastAPI backend —
  every function's contract (method + path) is documented in a comment above
  it. Swap the implementation; callers don't change.
- `src/data/mockData.ts` is the single source of realistic demo data — no
  repeated magic numbers across components.
- `src/types/index.ts` defines the full domain model.
- Design tokens (colors, radii, shadows, fonts) live in `tailwind.config.ts`,
  extracted directly from the Figma file's landing page.

## Known gaps / next phase

- Only the landing page had a Figma source; every screen after it is a
  consistent extension of that system rather than a 1:1 Figma conversion —
  there was no Figma design for the app screens to match against.
- Monaco Editor was intentionally left out of Code Explorer in favor of a
  lightweight custom viewer, to avoid a heavy dependency the mock data
  doesn't yet need; swap in `@monaco-editor/react` when real file contents
  are wired up.
- No test suite yet.
- This environment could not run `npm install` (no network access), so the
  build has not been verified end-to-end — please run `npm run build`
  locally and report any type errors.
