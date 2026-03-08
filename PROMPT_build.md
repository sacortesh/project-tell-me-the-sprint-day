# Tell Me The Sprint Day — PRD & Build Plan

## Vision

A minimalistic website that tells you what sprint day it is today. An ambitious, curated (but unofficial) tool to organize and communicate the sprint cycle. The site serves as a quick-glance reference for anyone who works in sprints and wants to know "where am I in the cycle?"

### Core Concepts

- **Year structure**: 52 weeks, 4 quarters (Q1–Q4), each ~13 weeks.
- **Sprint cadence**: Configurable (default 2-week sprints).
- **Buffer weeks**: Support for planning/stretch weeks between quarters or at year boundaries.
- **Monetization**: Passive revenue via ads (e.g. Google AdSense) and usage analytics.
- **Tone**: Minimalistic, fast, single-purpose. The answer should be visible in under 1 second.

---

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (free tier to start)
- **Analytics**: Vercel Analytics + Google Analytics 4
- **Ads**: Google AdSense (single non-intrusive ad slot)
- **Package manager**: pnpm

---

## Phase 0 — Project Scaffolding

### Task 0.1 — Initialize Next.js project
Initialize a Git repository (`git init`) and create a new Next.js 14+ app with TypeScript, Tailwind CSS, ESLint, and App Router. Configure `pnpm` as the package manager. Add a basic `.gitignore`. Make an initial commit.

### Task 0.2 — Project structure & layout shell
Create the app layout (`app/layout.tsx`) with:
- HTML metadata (title, description, viewport, theme-color)
- A minimal global CSS reset via Tailwind
- A `<main>` wrapper

Create a placeholder `app/page.tsx` that renders "Sprint Day" as heading.

### Task 0.3 — Tailwind theme configuration
Configure `tailwind.config.ts` with:
- A minimal color palette (dark bg, accent color for sprint day number)
- Font stack (system fonts, monospace for the number)
- Extend spacing/sizes as needed for the hero display

---

## Phase 1 — Sprint Engine (Core Logic)

### Task 1.1 — Define sprint configuration types
Create `lib/sprint-config.ts` with TypeScript types:
- `SprintConfig`: `{ startDate: string; sprintLengthDays: number; bufferWeeks: { afterQ1: number; afterQ2: number; afterQ3: number; afterQ4: number } }`
- `SprintInfo`: `{ sprintNumber: number; dayInSprint: number; totalSprintDays: number; quarter: number; weekInQuarter: number; isBufferWeek: boolean; bufferLabel?: string }`
- Export a `DEFAULT_CONFIG` constant for 2-week sprints starting Jan 6, 2025 (first Monday).

### Task 1.2 — Implement sprint calculation engine
Create `lib/sprint-engine.ts` with a pure function:
- `getSprintInfo(date: Date, config: SprintConfig): SprintInfo`
- Walk from `startDate` through the year, inserting buffer weeks after each quarter boundary.
- Determine which sprint the given date falls in, what day of that sprint it is, and whether it's a buffer/planning week.
- Support multi-year operation: if the given date is in a different year than `startDate`, compute the correct year's schedule (roll forward year-by-year using consistent rules).
- All logic must be timezone-aware (use UTC or configurable timezone).

### Task 1.3 — Unit tests for sprint engine
Create `lib/__tests__/sprint-engine.test.ts`:
- Test: first day of year returns sprint 1, day 1.
- Test: last day of sprint 1 returns correct day count.
- Test: a date in a buffer week returns `isBufferWeek: true`.
- Test: quarter boundaries are correct.
- Test: edge case — Dec 31 returns valid info.
- Test: leap year handling.
- Use Vitest as the test runner (install + configure in this task).

### Task 1.4 — Multi-year rollover tests
Add tests to `lib/__tests__/sprint-engine.test.ts`:
- Test: a date in 2026 with a 2025 `startDate` correctly rolls into the 2026 schedule.
- Test: a date in 2027 works (two years forward).
- Test: Jan 1 of a new year (before the first Monday) returns a valid result.
- Test: the sprint numbering resets at the start of each new year.

---

## Phase 2 — Hero Display (UI)

### Task 2.1 — Sprint day hero component
Create `components/SprintDayHero.tsx`:
- Large, centered display showing the sprint day number (e.g. "Day 7").
- Subtitle line: "Sprint 3 · Q1 · Week 5".
- If buffer week: show "Planning Week" instead of day number.
- Use Tailwind for styling. Dark background, large bold number, subtle metadata.

### Task 2.2 — Wire hero to sprint engine on homepage
Update `app/page.tsx`:
- Call `getSprintInfo(new Date(), DEFAULT_CONFIG)` at render time (server component).
- Pass result to `<SprintDayHero />`.
- Page should be statically regenerated every hour (`revalidate: 3600`) or use dynamic rendering with date.

### Task 2.3 — Progress bar component
Create `components/SprintProgress.tsx`:
- A thin horizontal progress bar showing how far through the current sprint you are.
- `dayInSprint / totalSprintDays` as percentage.
- Tailwind-styled, subtle, placed below the hero.

---

## Phase 3 — Year & Quarter Overview

### Task 3.1 — Quarter timeline component
Create `components/QuarterTimeline.tsx`:
- A horizontal or vertical timeline showing all 4 quarters.
- Highlight the current quarter.
- Show buffer weeks as distinct segments.
- Minimal, uses Tailwind only (no charting library).

### Task 3.2 — Sprint calendar grid
Create `components/SprintCalendar.tsx`:
- A compact grid showing all sprints in the current quarter.
- Each sprint is a small block; the current sprint is highlighted.
- Show sprint numbers.
- Optional: on hover/tap, show sprint date range.

### Task 3.3 — Wire overview section into homepage
Add the quarter timeline and sprint calendar below the hero on `app/page.tsx`. Keep layout clean — use a collapsible or "show more" pattern to keep the initial view minimal.

---

## Phase 4 — Configuration & Customization

### Task 4.1 — Settings panel UI
Create `components/SettingsPanel.tsx`:
- A slide-out or modal panel with fields:
  - Sprint length (1-week, 2-week, 3-week, 4-week)
  - Year start date
  - Buffer weeks per quarter (0–2 each)
  - Timezone
- Use HTML form elements styled with Tailwind.

### Task 4.2 — Persist settings in localStorage
Create `lib/settings-store.ts`:
- Read/write `SprintConfig` to `localStorage`.
- Provide a React hook: `useSprintConfig()` that returns current config + setter.
- Fall back to `DEFAULT_CONFIG` when nothing is stored.

### Task 4.3 — Connect settings to sprint engine
Update the homepage to read config from `useSprintConfig()` and recalculate sprint info when settings change. This will require making the page (or the relevant section) a client component.

---

## Phase 5 — SEO, Metadata & Social Sharing

### Task 5.1 — OpenGraph and meta tags
Update `app/layout.tsx` and/or `app/page.tsx` with:
- Dynamic `<title>`: "Day 7 of Sprint 3 — Tell Me The Sprint Day"
- `og:title`, `og:description`, `og:image` (static or generated)
- `twitter:card` meta tags
- Canonical URL

### Task 5.2 — Favicon and PWA manifest
- Add a favicon (simple calendar/sprint icon, SVG preferred).
- Create `public/manifest.json` for PWA with name, theme color, icons.
- Link manifest in layout.

### Task 5.3 — Robots.txt and sitemap
- Create `public/robots.txt` allowing all crawlers.
- Create `app/sitemap.ts` generating a basic sitemap with the homepage URL.

### Task 5.4 — Share / copy sprint info
Create `components/ShareButton.tsx`:
- A small button below the hero that copies the current sprint info to clipboard (e.g. "Day 7 of Sprint 3 · Q1 — tellmethesprintday.com").
- Use the Clipboard API (`navigator.clipboard.writeText`).
- Show a brief "Copied!" confirmation.
- Optional: if Web Share API is available (`navigator.share`), offer native share on mobile.

---

## Phase 6 — Analytics & Monetization

### Task 6.1 — Add Vercel Analytics
Install `@vercel/analytics` and add the `<Analytics />` component to the root layout. No configuration needed beyond import.

### Task 6.2 — Add Google Analytics 4 scaffold
Create `components/GoogleAnalytics.tsx`:
- Render the GA4 `<Script>` tags.
- Use an environment variable `NEXT_PUBLIC_GA4_ID` for the measurement ID.
- Add to layout. Leave the env var empty by default (no tracking until configured).

### Task 6.3 — Add Google AdSense scaffold
Create `components/AdSlot.tsx`:
- Render a single AdSense ad unit `<ins>` tag.
- Use environment variable `NEXT_PUBLIC_ADSENSE_PUB_ID` and `NEXT_PUBLIC_ADSENSE_SLOT_ID`.
- Place one ad slot at the bottom of the page, below all content.
- Style it to be non-intrusive (max-width, centered, subtle border).

### Task 6.4 — Cookie consent banner
Create `components/CookieConsent.tsx`:
- A simple bottom banner: "This site uses cookies for analytics and ads."
- Accept / Decline buttons.
- Store preference in `localStorage`.
- Only load GA4 and AdSense scripts if consent is given.

### Task 6.5 — Privacy policy page scaffold
Create `app/privacy/page.tsx`:
- A simple, static page with placeholder sections: data collection, cookies, analytics, advertising, contact.
- Legal content must be human-reviewed (see `PENDING_USER_ACTIONS.md`).
- Link to the privacy page from the footer of the main layout.
- Required for AdSense approval.

---

## Phase 7 — Polish & Performance

### Task 7.1 — Loading states and error boundaries
- Add a `loading.tsx` for the main page (skeleton of the hero).
- Add an `error.tsx` boundary that shows a friendly message.

### Task 7.2 — Responsive design pass
- Ensure the hero, progress bar, timeline, calendar, and settings panel look good on mobile (320px), tablet (768px), and desktop (1280px+).
- Test with browser dev tools.

### Task 7.3 — Accessibility pass
- Add ARIA labels to the hero display, progress bar, timeline, and calendar components.
- Ensure all interactive elements (settings panel, share button, cookie consent) are keyboard-navigable.
- Verify color contrast ratios meet WCAG AA (especially the dark background theme).
- Test with a screen reader or browser accessibility inspector.

### Task 7.4 — Lighthouse audit and fixes
- Run Lighthouse in CI or manually.
- Target: Performance 95+, Accessibility 100, Best Practices 100, SEO 100.
- Fix any issues found.

### Task 7.5 — 404 page
Create `app/not-found.tsx` with a minimal "page not found" message and a link back to home.

---

## Phase 8 — Deployment & Go-Live

### Task 8.1 — Vercel project setup and first deploy
- Connect the repo to Vercel.
- Configure environment variables (GA4 ID, AdSense IDs — can be empty initially).
- Deploy and verify the production URL works.

### Task 8.2 — Custom domain setup
- Configure a custom domain in Vercel (domain TBD — see PENDING_USER_ACTIONS.md).
- Set up DNS records.

### Task 8.3 — Final smoke test
- Verify all pages load.
- Verify sprint calculation is correct for today's date.
- Verify settings persist across page reloads.
- Verify analytics and ad placeholders render when env vars are set.
- Verify cookie consent flow works end-to-end.
