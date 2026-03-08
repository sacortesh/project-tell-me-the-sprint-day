# Pending User Actions

These items require human action — they cannot be completed by the build agent.

---

## 1. Google Analytics 4 — Create Property & Get Measurement ID
- **When**: Before Phase 6, Task 6.2
- **What**: Go to [analytics.google.com](https://analytics.google.com), create a GA4 property for the site, and copy the Measurement ID (format: `G-XXXXXXXXXX`).
- **Then**: Set the `NEXT_PUBLIC_GA4_ID` environment variable in Vercel (and `.env.local` for dev).

## 2. Google AdSense — Create Account & Get Publisher/Slot IDs
- **When**: Before Phase 6, Task 6.3
- **What**: Sign up at [adsense.google.com](https://adsense.google.com). Create an ad unit and copy the Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`) and Slot ID.
- **Then**: Set `NEXT_PUBLIC_ADSENSE_PUB_ID` and `NEXT_PUBLIC_ADSENSE_SLOT_ID` environment variables in Vercel (and `.env.local` for dev).
- **Note**: AdSense approval requires the site to be live with real content first. Deploy without ads, apply, then enable once approved.

## 3. Custom Domain — Purchase & Configure DNS
- **When**: Before Phase 8, Task 8.2
- **What**: Purchase a domain name (suggested: `tellmethesprintday.com`, `sprintday.dev`, `sprintday.today`, or similar).
- **Where**: Any registrar (Namecheap, Cloudflare, Google Domains successor, etc.).
- **Then**: Add the domain in Vercel project settings and configure DNS records as instructed by Vercel.

## 4. Vercel Project — Create & Link Repository
- **When**: Before Phase 8, Task 8.1
- **What**: Create a Vercel account (if not already), import this Git repository, and link it.
- **Then**: The build agent can handle deployment config, but the initial project creation and repo linking must be done in the Vercel dashboard.

## 5. Favicon / Logo Asset
- **When**: Before Phase 5, Task 5.2
- **What**: Provide or approve a favicon/logo for the site. The build agent can generate a simple SVG placeholder, but a final branded asset should be human-approved.
- **Suggestion**: A minimal calendar icon with a sprint number, or a simple typographic mark.

## 6. Privacy Policy & Terms (for AdSense compliance)
- **When**: Before enabling AdSense in production
- **What**: AdSense requires a privacy policy page. Draft or provide a privacy policy that covers:
  - Use of cookies
  - Google Analytics data collection
  - Google AdSense ad personalization
- **Then**: The build agent can create the page, but the legal content must be human-reviewed.

## 7. Sprint Year Configuration for 2025/2026
- **When**: After Phase 1 is built (sprint engine works)
- **What**: Review and confirm the default sprint configuration:
  - Start date: January 6, 2025 (first Monday of the year)
  - Sprint length: 2 weeks (10 business days)
  - Buffer weeks: 1 week after each quarter
- **Then**: Adjust `DEFAULT_CONFIG` in `lib/sprint-config.ts` if your org uses different cadences.

## 8. Review Privacy Policy Content
- **When**: Before enabling AdSense in production (after Task 6.5 scaffold is built)
- **What**: The build agent will create a privacy policy page with placeholder sections. Review and finalize the legal language covering cookies, analytics, and ad personalization.
- **Note**: AdSense requires a published privacy policy before approval.
