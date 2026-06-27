# React Modernization — Design Spec

**Date:** 2026-06-27
**Project:** henrykim.ca personal portfolio
**Goal:** Migrate the existing vanilla static site to a modern React (Vite + TypeScript) app **without changing the visual design**. The look stays pixel-identical; only the code architecture and tooling modernize.

---

## 1. Background

### Current state
The live site is a **pure vanilla static single-page site** — no jQuery, no build tools.

| File | Role | Size |
|---|---|---|
| `index.html` | Sidebar + 4 sections + all logic in one inline `<script>` | 347 lines |
| `styles.css` | Full design: light/dark/mobile | 376 lines |
| `Images/` | H logos (light/dark/MONO) + favicon | — |
| External CDN | Google Fonts (Libre Baskerville), Font Awesome 6.7.2 | — |

### Legacy / dead code (unused by the live site)
- `steve-jobs/` — vendored turn.js "Steve Jobs book" demo (106 page HTMLs, IE6-9 conditional comments).
- `index_tbu.html` + `styles_tbu.css` — old flipbook version (jQuery 1.7 + turn.js).
- `extras/`, `lib/` — jQuery/turn.js engine for the flipbook version.
- `Notebook-covers.pptx` — unrelated asset.

Confirmed: live `index.html` references `turn|jquery|steve|flipbook` **zero times**.

### What makes the current code "old-fashioned" (the migration target)
- Inline event handlers: `onclick="navigate(event, 'home')"`.
- Global functions in `<script>` doing direct DOM manipulation (`showSection`, `navigate`, `toggleDetail`).
- Section switching via manual `display:none/block` toggle.
- All content hardcoded in HTML (activities, education, essays not separated as data).
- Non-standard `<p1>` tag.

### Hosting
GitHub Pages serving `main` branch root (classic), custom domain **henrykim.ca** via `CNAME`. Repo: `github.com/yxxjx-dsnv/Henry-Kim-s-personal-website`. No CI workflows, no `package.json` yet.

---

## 2. Decisions (locked)

| Topic | Decision |
|---|---|
| Stack | **Vite + React + TypeScript** |
| Navigation | **React Router** with real routes (`/`, `/essays`, `/extra-curricular`, `/education`); old `#hash` URLs redirect once |
| Content | **Hybrid** — repeated/structured items become typed data; long prose (Home intro, Essay) stays as JSX components to preserve inline links/formatting |
| Dark mode | **Improved** — keep logo-click toggle, but persist to `localStorage` and default to system theme (`prefers-color-scheme`) on first visit; prevent flash-of-wrong-theme |
| Legacy files | **Move to `_archive/`** (not deleted) via `git mv` |
| Deploy | **GitHub Actions → Pages** (Actions source); source stays clean on branch, build output deployed |

### Prime directive
**The visual design must stay identical** in light mode, dark mode, and mobile. Any change that alters rendered appearance is out of scope unless explicitly noted (only the `<p1>` → `.subtitle` swap, which preserves the look).

---

## 3. Architecture

### Project structure
```
henrykim.ca/
├─ .github/workflows/deploy.yml   # Vite build + deploy to GitHub Pages
├─ public/
│  ├─ CNAME                       # henrykim.ca (preserved verbatim)
│  └─ Images/                     # logos + favicon (moved from /Images)
├─ src/
│  ├─ main.tsx                    # React root + BrowserRouter
│  ├─ App.tsx                     # layout shell: Sidebar + <Outlet/> + hash redirect
│  ├─ components/
│  │  ├─ Sidebar.tsx              # nav links + logo dark-toggle + mobile side-tab/close
│  │  ├─ Hero.tsx                 # hero-section (title + "last updated" subtitle)
│  │  ├─ ActivityItem.tsx         # dot marker + detail-box hover expand
│  │  └─ KoreaEasterEgg.tsx       # 🇰🇷 250 falling flags on "South Korea" click
│  ├─ pages/
│  │  ├─ Home.tsx                 # hero + About + Interests (prose JSX)
│  │  ├─ Essays.tsx               # hero + essay prose (JSX)
│  │  ├─ ExtraCurricular.tsx      # hero + activities.map(ActivityItem)
│  │  └─ Education.tsx            # hero + education.map(...)
│  ├─ data/
│  │  ├─ activities.ts            # Activity[]
│  │  ├─ education.ts             # Education[]
│  │  └─ profile.ts               # name, social links, per-section "last updated" dates
│  ├─ hooks/
│  │  └─ useDarkMode.ts           # localStorage + prefers-color-scheme, body class toggle
│  ├─ types.ts                    # Activity, Education types
│  └─ styles/
│     └─ index.css                # styles.css migrated ~verbatim
├─ index.html                     # Vite entry shell + flash-prevention inline script
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
└─ _archive/                      # steve-jobs/, extras/, lib/, index_tbu.html, styles_tbu.css, *.pptx
```

### Component responsibilities (isolation)
- **App.tsx** — renders the persistent layout (`main` > `main-container` > Sidebar + `content-wrapper` with `<Outlet/>`). Owns dark-mode state via `useDarkMode` and the one-time legacy `#hash` → route redirect. Depends on: react-router, useDarkMode.
- **Sidebar.tsx** — nav links (`NavLink` for active styling), the clickable logo (toggles dark mode + swaps SVG), the "Find me on" social list, and mobile open/close behavior (side-tab + close button + click-outside). Props: `isDark`, `onToggleDark`. Depends on: profile data, react-router NavLink.
- **Hero.tsx** — `{ title, subtitle }` → the `hero-section` markup. Pure presentational.
- **ActivityItem.tsx** — one `Activity` → the `activity-item` markup with dot marker and `detail-box`. Hover-expand is pure CSS (unchanged); no JS needed. Pure presentational.
- **KoreaEasterEgg.tsx** — wraps the "South Korea" trigger; on click spawns 250 flags with the existing `fall` keyframe animation. Self-contained; cleans up its DOM nodes.
- **pages/** — compose Hero + content. Structured pages map over data; prose pages embed JSX.

### Data model (`types.ts`)
```ts
export type Activity = {
  role: string;                      // "Executive member at UTKESA in Event Dept."
  org?: { name: string; url?: string };
  date: string;                      // "Sep 2025 - present"
  detail?: string[];                 // detail-box paragraphs
};

export type Education = {
  program: string;                   // "TrackOne (Undeclared Engineering program) - BAsc"
  org: { name: string; url: string };
  date: string;                      // "Jan 2026 - 2029(Anticipated)"
  detail?: string[];                 // optional (most have none)
};
```
`profile.ts` holds: name, social links (Instagram/LinkedIn/GitHub/Email), and the per-section "last updated / written" dates currently hardcoded in each hero.

Home intro/Interests and the Essay body keep their inline `<a>`/`<b>`/`<u>` formatting, so they live as JSX inside `Home.tsx` / `Essays.tsx` rather than data.

---

## 4. Key implementation details

### Routing on GitHub Pages (the one gotcha)
`BrowserRouter` gives clean URLs (`/essays`) but GitHub Pages returns a 404 when such a path is requested directly or refreshed (no `essays.html` on disk). Fix with the **standard SPA fallback**: the deploy workflow copies `dist/index.html` → `dist/404.html`. GitHub Pages serves `404.html` for unknown paths, which boots the SPA, and React Router resolves the route client-side. Result: clean URLs that survive direct access and refresh, no HashRouter ugliness.

Legacy `#hash` URLs (`#home`, `#essays`, `#extra-curricular`, `#education`): on first load, `App` detects a matching hash and `navigate()`s to the corresponding route once.

### Dark mode (`useDarkMode`)
- **State source on first visit:** `localStorage.theme` if present, else `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Apply:** toggle the `dark-mode` class on `document.body` — this reuses every existing `body.dark-mode …` CSS selector unchanged, so **dark mode requires zero CSS changes**.
- **Persist:** write `localStorage.theme` on toggle.
- **Flash prevention:** a tiny inline script in `index.html <head>` sets the `dark-mode` body class before React mounts, so there's no flash of the wrong theme.
- **Logo:** click toggles theme and swaps the logo SVG (`H Logo.svg` ↔ `H Logo - White.svg`), as today.

### Styling migration
- Move `styles.css` → `src/styles/index.css` with class names intact → rendered output is 1:1 identical. Imported once in `main.tsx`.
- Replace the non-standard `<p1>` element with `<p className="subtitle">`; move the `.text p1` CSS rules to `.subtitle` (visual result unchanged). This is the only intentional markup change.
- Keep global CSS (no CSS Modules) — simplest path to guaranteed visual parity.
- Google Fonts + Font Awesome stay as `<link>` tags in `index.html`.

### Easter egg
Port the imperative flag-rain into `KoreaEasterEgg`: on trigger, append 250 flag nodes with randomized position/size and the `fall` animation, then remove them after the timeout — same numbers and timing as the original. The `@keyframes fall` moves into `index.css`.

### Legacy archive
`git mv steve-jobs extras lib index_tbu.html styles_tbu.css Notebook-covers.pptx _archive/` — preserves git history, declutters the working tree.

### Deploy workflow (`.github/workflows/deploy.yml`)
- Trigger: push to the default branch (after merge).
- Steps: checkout → setup Node → `npm ci` → `npm run build` → copy `index.html`→`404.html` → upload `dist/` artifact → deploy to Pages.
- `public/CNAME` ensures `henrykim.ca` is preserved in the build output.
- One-time manual step: set repo **Settings → Pages → Source = GitHub Actions** (documented for the user; cannot be done from code).

---

## 5. Testing & verification

- **Unit/component (Vitest + React Testing Library):** dark-mode toggle (class + localStorage), hash→route redirect, data-driven rendering (activities/education counts), sidebar active link.
- **Visual parity check (primary acceptance):** run the current `index.html` and the new `vite preview` build side by side; confirm each section matches in **light, dark, and mobile (<768px)**.
- **Build gate:** `npm run build && npm run preview` succeeds; no TS errors.
- **Routing gate:** direct-load `/essays` in `preview` (and on Pages after deploy) renders correctly via the 404 fallback.

---

## 6. Out of scope (YAGNI)

- No CMS, no blog engine, no analytics.
- No redesign, no new sections, no content rewrites (text copied verbatim).
- No deletion of legacy (archived only).
- No CSS framework (Tailwind etc.) — existing CSS is migrated as-is.

---

## 7. Acceptance criteria

1. `npm run dev` serves the site locally; all 4 routes work.
2. Visual output is identical to the current site in light/dark/mobile.
3. Dark mode persists across reload and defaults to system theme on first visit; no theme flash.
4. Korea easter egg behaves identically.
5. Legacy files live under `_archive/`; working tree is clean and modern.
6. Pushing to the default branch builds and deploys to henrykim.ca via Actions, with the custom domain intact and `/essays`-style URLs surviving refresh.
