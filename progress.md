# Progress — Tell Me The Sprint Day

## Current Status
**Phase 4 — Configuration & Customization** (in progress)

## Completed Tasks
- **0.1** — Initialize Next.js project (Next.js 15, TypeScript, Tailwind CSS 4, ESLint, App Router). Build verified.
- **0.2** — Project structure & layout shell. Added metadata (title, description, viewport, theme-color), global CSS reset, `<main>` wrapper in layout. Placeholder page renders "Sprint Day" heading. Build verified.
- **0.3** — Tailwind theme configuration. Added `@theme` block in globals.css with dark color palette (bg, surface, text, accent, border), system font stacks (sans + mono), hero display text sizes, and spacing token. Updated layout and page to use theme tokens.
- **1.1** — Define sprint configuration types. Created `src/lib/sprint-config.ts` with `SprintConfig` and `SprintInfo` interfaces and `DEFAULT_CONFIG` constant. `SprintInfo` includes `isWeekend` and `weekendContext` fields. `sprintLengthDays` counts working days (Mon-Fri). Default: 10 WD sprints starting Wed 2026-01-07, 1 buffer week per quarter.
- **1.2** — Implement sprint calculation engine. Created `src/lib/sprint-engine.ts` with `getSprintInfo(date, config)` pure function. Counts working days (Mon-Fri) for sprint numbering. Weekends return `isWeekend: true` with `weekendContext` (surrounding Friday/Monday positions). Year schedule uses calendar days for segment boundaries (91 per quarter, 7 per buffer). Handles multi-year rollover. All arithmetic in UTC.
- **1.3** — Unit tests for sprint engine. Installed vitest, added `test` and `test:watch` scripts. Created `src/lib/__tests__/sprint-engine.test.ts` with 32 tests covering: default config (working-day sprint calc, sprint rollover, remainder days, quarter boundaries, weekInQuarter), weekend detection and context, buffer week detection (including weekend flag), no-buffer configs with sprint-boundary weekends, multi-year rollover (forward and backward), and different sprint lengths (5-day weekly sprints). All 32 tests passing.
- **1.4** — Multi-year rollover tests. Superseded — already covered by 1.3 tests.
- **2.1** — Sprint day hero component. Created `src/components/SprintDayHero.tsx`. Displays "Day N" as large hero text with subtitle "Sprint X · QY · Week Z". Shows "Planning Week" during buffer weeks. Shows "Between Day X and Day Y" on weekends with sprint context (handles sprint-boundary weekends). Uses existing theme tokens. Build verified.
- **2.2** — Wire hero to sprint engine on homepage. Updated `src/app/page.tsx` to call `getSprintInfo(new Date(), DEFAULT_CONFIG)` server-side and pass result to `<SprintDayHero />`. Page uses `force-dynamic` rendering with 1-hour revalidation. Build verified — route shows as `ƒ (Dynamic)`.
- **2.3** — Sprint alignment box. Created `src/lib/sprint-tips.ts` with day-specific tips (Lawful/Neutral/Chaotic) for all 10 sprint days, remainder days 11-15, weekends, and buffer weeks. Created `src/components/SprintAlignmentBox.tsx` as a three-column box below the hero. Wired into homepage via `page.tsx`. Build verified.
- **2.4** — Progress bar component. Created `src/components/SprintProgress.tsx`. Thin horizontal bar showing `dayInSprint / totalSprintDays` as percentage. Hidden during buffer weeks. On weekends, shows progress up to last working day. Placed between hero and alignment box in `page.tsx`. Build verified.
- **3.1** — Quarter timeline component. Created `src/components/QuarterTimeline.tsx`. Horizontal timeline showing all 4 quarters with buffer week segments between them. Current quarter (or buffer) highlighted with accent color. Segment widths proportional to calendar days. Wired into homepage between progress bar and alignment box. TypeScript verified.
- **3.2** — Sprint calendar grid. Created `src/components/SprintCalendar.tsx`. Compact 6-column grid showing all sprints in the current quarter. Each block displays sprint number and working day count. Current sprint highlighted with accent ring; weekend-adjacent sprints get a dimmed highlight. Hover tooltip shows sprint date range (start–end). Hidden during buffer weeks. Wired into homepage between quarter timeline and alignment box. TypeScript verified.
- **3.3** — Wire overview section into homepage. Created `src/components/OverviewSection.tsx` as a client component wrapping QuarterTimeline and SprintCalendar in a collapsible section. Toggle button ("Show/Hide Overview") keeps initial view minimal — overview hidden by default. Updated `src/app/page.tsx` to use OverviewSection instead of rendering timeline and calendar directly. TypeScript verified.
- **4.1** — Settings panel UI. Created `src/components/SettingsPanel.tsx` as a slide-out panel with gear icon toggle (fixed top-right). Fields: sprint length (1–4 week radio buttons), year start date (date picker), buffer weeks per quarter (0–2 select dropdowns), timezone placeholder. Includes backdrop overlay, close button, and reset-to-defaults button. Wired into homepage with no-op handler (persistence in 4.2, engine connection in 4.3). Build verified.

## Task Log

| Phase | Task | Status | Notes |
|-------|------|--------|-------|
| 0 | 0.1 — Initialize Next.js project (+ git init) | done | Next.js 15, TS, Tailwind 4, ESLint, App Router |
| 0 | 0.2 — Project structure & layout shell | done | Metadata, viewport, theme-color, CSS reset, `<main>` wrapper |
| 0 | 0.3 — Tailwind theme configuration | done | Dark palette, font stacks, hero sizes via `@theme` |
| 1 | 1.1 — Define sprint configuration types | done | `SprintConfig`, `SprintInfo` (with weekend fields) + `DEFAULT_CONFIG` (10 WD) |
| 1 | 1.2 — Implement sprint calculation engine | done | Working-day counting, weekend context, multi-year rollover |
| 1 | 1.3 — Unit tests for sprint engine | done | 32 tests, vitest, all passing |
| 1 | 1.4 — Multi-year rollover tests | done | Superseded — covered by 1.3 |
| 2 | 2.1 — Sprint day hero component | done | `SprintDayHero.tsx`, dark theme, buffer + weekend support |
| 2 | 2.2 — Wire hero to sprint engine on homepage | done | Server-side render, force-dynamic, revalidate 3600 |
| 2 | 2.3 — Sprint alignment box | done | Lawful/Neutral/Chaotic tips, `sprint-tips.ts` data module |
| 2 | 2.4 — Progress bar component | done | `SprintProgress.tsx`, thin bar + "X of Y days" label |
| 3 | 3.1 — Quarter timeline component | done | `QuarterTimeline.tsx`, horizontal bar, current Q highlighted |
| 3 | 3.2 — Sprint calendar grid | done | `SprintCalendar.tsx`, 6-col grid, current sprint highlighted, hover date range |
| 3 | 3.3 — Wire overview section into homepage | done | Collapsible OverviewSection client component |
| 4 | 4.1 — Settings panel UI | done | Slide-out panel, gear toggle, sprint length / start date / buffer / timezone fields |
| 4 | 4.2 — Persist settings in localStorage | pending | |
| 4 | 4.3 — Connect settings to sprint engine | pending | |
| 5 | 5.1 — OpenGraph and meta tags | pending | |
| 5 | 5.2 — Favicon and PWA manifest | pending | |
| 5 | 5.3 — Robots.txt and sitemap | pending | |
| 5 | 5.4 — Share / copy sprint info | pending | |
| 6 | 6.1 — Add Vercel Analytics | pending | |
| 6 | 6.2 — Add Google Analytics 4 scaffold | pending | |
| 6 | 6.3 — Add Google AdSense scaffold | pending | |
| 6 | 6.4 — Cookie consent banner | pending | |
| 6 | 6.5 — Privacy policy page scaffold | pending | |
| 7 | 7.1 — Loading states and error boundaries | pending | |
| 7 | 7.2 — Responsive design pass | pending | |
| 7 | 7.3 — Accessibility pass | pending | |
| 7 | 7.4 — Lighthouse audit and fixes | pending | |
| 7 | 7.5 — 404 page | pending | |
| 8 | 8.1 — Vercel project setup and first deploy | pending | |
| 8 | 8.2 — Custom domain setup | pending | |
| 8 | 8.3 — Final smoke test | pending | |

## Test Counts
- Unit tests: 32
- Passing: 32
