# henrykim.ca

Personal portfolio. Vite + React + TypeScript, deployed to GitHub Pages at https://henrykim.ca.

## Develop

```bash
npm install
npm run dev      # local dev server
npm test         # run unit tests
npm run build    # type-check + production build into dist/ (+ 404.html SPA fallback)
npm run preview  # preview the production build
```

## Deploy

Push to `main`. The **Deploy to GitHub Pages** workflow builds and publishes `dist/`.

**One-time setup (GitHub UI):** Settings → Pages → Build and deployment → **Source: GitHub Actions**.
The custom domain `henrykim.ca` is preserved via `public/CNAME`.

## Structure

- `src/pages` — route pages (`/`, `/essays`, `/extra-curricular`, `/education`)
- `src/components` — Sidebar, Hero, ActivityItem, KoreaEasterEgg
- `src/data` — typed content (profile, activities, education)
- `src/hooks/useDarkMode.ts` — persisted theme + system default
- `_archive/` — previous vanilla/flipbook site, kept for reference
