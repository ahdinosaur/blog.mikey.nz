# Migration TODO: Hexo → Next.js + Chakra UI

All phases complete.

## Phase 1: scaffolding
- [x] Explore current Hexo blog (theme, posts, scripts)
- [x] Move all old files into `./archive/` (keep what gets migrated)
- [x] Write `package.json` (Next.js, Chakra UI, deps)
- [x] Write `tsconfig.json`, `next.config.mjs`, `.gitignore`
- [x] Set up Chakra UI provider and theme matching existing colors

## Phase 2: content
- [x] Move post markdown + asset folders to `./src/posts/`
- [x] Move site assets (avatar, banner, favicon) to `./public/images/`
- [x] Verify `.gitattributes` LFS rules cover the new locations

## Phase 3: rendering
- [x] Markdown pipeline: gray-matter + markdown-it with Hexo-equivalent options
  - [x] anchors with `§` permalink, casing preserved (so `#Backstory` works)
  - [x] emoji + attrs plugins
  - [x] `<!-- more -->` excerpt split
  - [x] wrap `<img>` in `.image-wrapper` with lazy loading
  - [x] wrap `<video>` in `.video-wrapper`
  - [x] convert `{% twitter <url> %}` to a static blockquote link
  - [x] tolerate Hexo "no leading `---`" frontmatter and leading whitespace
- [x] Asset route handler: serve files from `src/posts/<slug>/<asset>` at `/<slug>/<asset>`

## Phase 4: pages & layouts
- [x] Root layout with metadata + global styles
- [x] Header (banner + avatar + title + subtitle + social list)
- [x] Top-right nav (home / archive / rss)
- [x] Footer
- [x] Home page (post list with excerpts, thumbnails, dates)
- [x] Post page (`/[slug]`) with article + sharing widget + back-to-home
- [x] Archive page (`/archives`) with list of titles + dates

## Phase 5: feeds & redirects
- [x] Atom feed at `/atom.xml`
- [x] Vercel redirect for `/gifts-of-a-charitable-interpretation/` → `/being-charitable/`
- [x] Carry over Matomo analytics script
- [x] `trailingSlash: true` to keep Hexo permalink shape (`/post-slug/`)

## Phase 6: verification
- [x] `npm install` and resolve dependencies
- [x] `npm run dev` starts cleanly
- [x] `npm run build` succeeds (177 routes generated)
- [x] Visual spot-check posts of various shapes

## Phase 7: review
- [x] Sub-agent review of styling fidelity → 3 small fixes applied
- [x] Sub-agent review of markdown rendering correctness → no defects
- [x] Sub-agent review of build and metadata → 1 critical (trailing slash) + 1 moderate fix applied
- [x] Follow-up review confirmed all fixes; no further suggestions
