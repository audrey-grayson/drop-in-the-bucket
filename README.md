# Drop in the Bucket

A personal goal tracker built around a simple metaphor: every time you do a
little of something you care about, you add a **drop** to that goal's **bucket**.
Small actions add up.

- **Drops page** — one bucket per goal. Tap a bucket and a water droplet falls
  from the top of the screen into it. Each bucket shows this week's drops as
  tally marks.
- **Goals page** — full control over your list of goals. Each goal is a short
  text label plus an emoji.
- **Stats page** — graphs of your drops over time and a scrolling per-week
  summary.

No backend, no account, no database. All data lives in the browser's
`localStorage`, so it is **per-device** and never leaves your phone.

## 📱 Mobile-first — read before editing

**This app is designed phone-first and every change must keep the mobile
experience as the priority.** Concretely:

- Layout is a single centred column (max-width 540px) with a fixed bottom tab
  bar placed within thumb reach.
- Tap targets are large; the bucket and droplet interactions are tuned for touch.
- Test changes at a phone viewport (~390px wide) first, then check that wider
  screens still look fine. Never optimise for desktop at the expense of mobile.
- Respect `env(safe-area-inset-*)` and the `viewport-fit=cover` meta so the UI
  works on notched devices.

When in doubt, make it work great on a phone and acceptable on a desktop — not
the other way around.

## Architecture

```
src/
  types.ts            Data model: Goal, Drop, PersistedState (schema-versioned)
  store.tsx           localStorage-backed React context + hooks (the only state)
  lib/week.ts         ISO-week helpers shared by tally + stats
  components/
    Bucket.tsx        SVG bucket with water-fill level
    Droplet.tsx       A single falling-drop animation
    TallyMarks.tsx    5-bar gate tally rendering
    BarChart.tsx      Generic dependency-free bar chart (extensible)
    Nav.tsx           Bottom tab bar
  pages/
    Home.tsx          Buckets + drop animation + weekly tally
    Goals.tsx         Goal CRUD (cards only, no buckets)
    Stats.tsx         Charts + scrolling weekly history
```

### Data model

Drops are stored as a **flat, append-only list** of `{ id, goalId, ts }`. Every
drop keeps its own timestamp, so the stats layer can compute any breakdown
(per day, per week, per goal, streaks, …) without changing how data is recorded.
This is deliberate so stats can grow without migrations. Schema changes bump
`SCHEMA_VERSION` in `types.ts` and branch in `store.tsx`'s `load()`.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Deploy to GitHub Pages

Routing uses `HashRouter` and Vite's `base` is set to `/drop-in-the-bucket/`, so
the app works under the project sub-path on Pages.

Two options:

1. **Automatic (recommended).** Push to `main`. The workflow in
   `.github/workflows/deploy.yml` builds and publishes. Enable it once under
   *Settings → Pages → Build and deployment → Source: GitHub Actions*.
2. **Manual.** `npm run deploy` (publishes `dist/` to the `gh-pages` branch).

If you fork/rename the repo, update `base` in `vite.config.ts` to match the new
repository name.
