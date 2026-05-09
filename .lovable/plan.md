## Goal

Make the dashboard feel calmer and easier to scan, hide the noisier secondary surfaces behind a toggle, and add a one-click dark/light mode switch in the top bar. No features get deleted — just reorganized so the first screen is "what matters now."

## 1. Dashboard declutter (`src/routes/dashboard.tsx`)

Today the dashboard stacks 6 KPI cards + onboarding + warmup banner + a big chart + recent activity + mailbox health + campaigns list — 7 sections on one page. We'll trim the default view to 4 sections and tuck the rest behind a "Show more" expand.

**Stays visible (above the fold):**
- Page header (keep)
- Onboarding panel — but **only when setup is incomplete**. Once all 3 steps are done it disappears entirely (today it still shows logic-wise, this just enforces it).
- Warmup warning banner (keep — it's conditional already)
- KPI strip — **trim from 6 → 4 cards**: Mailboxes, Leads, Replies, Reply rate. Drop Campaigns count, Sent (all-time), Opens — those live on /analytics.
- Send-volume chart (keep — it's the single most useful at-a-glance signal)

**Moved into a collapsible "More details" section (collapsed by default):**
- Recent activity feed → it duplicates Inbox
- Mailbox health list → lives on /mailboxes
- Campaigns list → lives on /campaigns

Single `<button>` row "Show more details ▾" that expands the three panels in a grid. State is local `useState`, persisted to `localStorage` so power users keep it open.

**Why this works:** First paint goes from ~7 dense blocks to 4 calm ones. Nothing is removed — every panel is one click away, and each item already has a dedicated route in the sidebar.

## 2. Dark / Light mode toggle

**New file:** `src/hooks/use-theme.ts` — tiny hook that reads/writes `localStorage("theme")`, toggles the `dark` class on `<html>`, and defaults to dark (current behavior).

**Edit:** `src/styles.css` — the file already declares `@custom-variant dark` and a dark-first `:root` palette. Add a `.light { … }` block with light-mode token values for `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--sidebar`, `--sidebar-foreground`, `--sidebar-border`, `--sidebar-accent`. Primary stays Signal Blue #2563EB (per brand memory). Status colors (mint/ember/alert) unchanged.

**Edit:** `src/components/AppShell.tsx` — add a `Sun`/`Moon` icon button in the top bar next to the "Live" / "New campaign" buttons. Clicking flips the theme. Icon swaps based on current mode.

**Edit:** `src/routes/__root.tsx` — on initial mount, read `localStorage("theme")` and apply the class before first paint to avoid flash.

## 3. Out of scope

- No sidebar nav changes (every "moved" panel is already in the sidebar).
- No new routes.
- No data-fetching changes — same `useQuery`, just fewer rendered sections by default.

## Files touched

- `src/routes/dashboard.tsx` — trim KPIs, wrap 3 panels in collapsible
- `src/components/AppShell.tsx` — add theme toggle button
- `src/hooks/use-theme.ts` — new hook
- `src/styles.css` — add `.light` token block
- `src/routes/__root.tsx` — apply persisted theme on boot
