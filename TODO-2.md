# Review TODO

Findings from reviewing the `refresh-next` branch. Each task includes reasoning so you can decide whether the change is worth making.

## Real issues

### 1. Fix or remove the broken `lint` script
- **Where:** `package.json:9`
- **What:** `npm run lint` calls `next lint`, which Next.js 15+ removed. It currently errors with `Invalid project directory provided, no such directory: …/lint`. There is also no eslint config in the repo.
- **Options:**
  - Remove the script entirely if you don't want lint.
  - Add `eslint` + `eslint-config-next` (or biome) as dev deps and a config file, and update the script.
- **Decide based on:** whether you want lint at all on a personal blog. If it's never going to be wired into CI, removing the dead script is the honest move.
- **Decision**: Yes remove

### 2. Drop the dead `siteConfig.matomo` conditional
- **Where:** `src/app/layout.tsx:38`, `src/lib/config.ts:19-22`
- **What:** `matomo` is declared `as const`, so it's always truthy. The `siteConfig.matomo && …` guard never short-circuits.
- **Options:**
  - Remove the `&&` guard.
  - Make `matomo` truly optional (`matomo?: { … }`) so the guard has meaning and you can disable analytics by deleting the field.
- **Decide based on:** whether you might ever want to disable analytics without removing the `<Script>` block. If yes, make it optional. If no, drop the guard.
- **Decision**: Drop the guard

### 3. Remove the dead `resize` listener in `VideoEmbedHydrator`
- **Where:** `src/components/VideoEmbedHydrator.tsx:26-30`
- **What:** Each element is guarded by `if (v.dataset.loaded) return`, so the `resize` callback does nothing after the first call. Either the guard is wrong or the listener is.
- **Options:**
  - Drop the `resize` listener (simplest).
  - Re-derive iframe size on resize, if the original intent was responsive sizing — but the CSS already handles ratios, so this is probably not needed.
- **Decide based on:** there's no behavior change either way; it's purely tidy-up. Low priority.
- **Decision*: Yes remove

### 4. Stop string-templating user data into `innerHTML`
- **Where:** `src/components/VideoEmbedHydrator.tsx:17-19`
- **What:** `data-src` and `data-title` are interpolated into an HTML string. Not exploitable today (you author the markdown), but a future title containing `"` will silently break the iframe.
- **Options:**
  - Build the iframe with `document.createElement('iframe')` and set attributes individually.
  - Move the iframe markup into the markdown source and delete the hydrator entirely.
- **Decide based on:** how much you trust your future self with quote characters in video titles. The DOM-API version is ~5 lines longer; the no-hydrator version is shorter overall but ties posts to specific embed URLs.
- **Decision**: Re-write to use DOM-API

### 5. Demote post-list titles from `<h1>`
- **Where:** `src/app/page.tsx:19-26`, `src/app/archives/page.tsx:26-34`, also see `src/components/AppHeader.tsx:30`
- **What:** Home and archive pages emit one `<h1>` per post (30+). Post pages have a content `<h1>` *and* the site-title `<h1>` from `AppHeader` (though `AppHeader` only renders on home, so post pages are fine).
- **Options:**
  - Lists: change `as="h1"` → `as="h2"` (or `h3` for the archive's smaller font).
  - Site title in `AppHeader`: change to `h1` only on home, or render as a plain styled element.
- **Decide based on:** whether you care about SEO/a11y heading structure. Search engines no longer treat multiple h1s as a strong negative, but screen reader users still rely on heading order. Cheap fix; recommended.
- **Decision**: Fix to be correct with a11y heading structure, change h1's to h2's, or whatever is most semantically correct.

### 6. Disable prefetch on post-list links
- **Where:** `src/app/page.tsx:25`, `src/app/archives/page.tsx:33`
- **What:** `RouteLink` (a `chakra(NextLink)`) inherits Next.js's default prefetch-on-viewport. With ~30 visible posts, the browser eagerly prefetches each `[slug]` route's RSC chunk on first paint of the home/archive page.
- **Options:**
  - Add `prefetch={false}` on the post-list `RouteLink`s.
  - Leave as-is; Next.js dedupes and the chunks are small.
- **Decide based on:** you're hosting on Vercel (free egress) so the cost is mostly user bandwidth. On mobile/poor connections this is wasteful. On desktop it makes navigation feel instant. Personal taste.
- **Decision**: Keep. Worst-case prefetch (all 26 posts) is ~173 KB gzipped on the wire (~6.7 KB avg/post; largest single post 13.9 KB). Under the 250 KB threshold. Realistically only viewport-visible links prefetch initially, so a top-of-page reader pays ~30 KB.

### 7. Use brand tokens for table styles
- **Where:** `src/components/PostContent.tsx:83-89`
- **What:** Hard-coded `#ccc`, `#fff`, `#ddd` for table borders/bg, while the rest of the file uses `brand.*` semantic tokens.
- **Options:**
  - Add `tableBorder`, `tableRowBg` (or reuse existing `brand.sharingBorder`) tokens in `src/lib/theme.ts` and reference them.
  - Leave hard-coded if you don't intend to ever change palette / add dark mode.
- **Decide based on:** dark mode plans. If never, ignore. If maybe, fix now while it's small.
- **Decision**: Fix now.

### 8. Use `RouteLink` in the `Sharing` component
- **Where:** `src/components/Sharing.tsx:18,29`
- **What:** Two `<Link href="/">` calls render plain `<a>` tags (Chakra Link), causing full page navigation back to home.
- **Options:**
  - Replace with `RouteLink` for client-side nav, matching the rest of the internal links.
  - Keep as-is if you prefer a hard navigation from the bottom of a post.
- **Decide based on:** consistency. The home button (`BackToHome`) at the top of the same page already uses `RouteLink`; the bottom should match.
- **Decision**: Yes consistency.

## Smaller observations

### 9. Markdown HTML post-processing is regex-based
- **Where:** `src/lib/markdown.ts:62-77`
- **What:** `<img>`/`<video>` wrapping via regex on the rendered HTML string. Works for the current corpus but is fragile — anything that looks like `<img …>` (e.g. inside a code block with `html: true`) gets wrapped.
- **Decide based on:** how often you'll add unusual markdown. If never, leave it. If you find yourself fighting the wrapper, port to a markdown-it `core` rule that walks tokens.
- **Decision**: Keep as is for now.

### 10. Module-scope post cache persists across HMR
- **Where:** `src/lib/posts.ts:42-51`
- **What:** The `cache: Promise<Post[]> | null` survives `next dev` hot-reloads, so editing a post's markdown won't show up until you restart the dev server.
- **Decide based on:** how you author. If you mostly preview from `next dev`, drop the cache (loading 30 small files is cheap). If you only run `next build` and visual-check the output, keep it.
- **Decision**: Drop the cache

### 11. Invalid dates silently fall back to epoch
- **Where:** `src/lib/posts.ts:140-147`
- **What:** A typo in a `date:` field becomes `1970-01-01`, sorting that post to the bottom of the list with no warning.
- **Options:**
  - Throw on invalid date in `loadPost`.
  - `console.warn` and continue.
  - Leave as-is.
- **Decide based on:** how much you trust your YAML frontmatter. Throwing makes builds fail fast on typos; warning is friendlier; silent fallback is what you have.
- **Decision**: Throw on invalid date

### 12. Asset cache header is `immutable` for 1 year
- **Where:** `src/app/[slug]/[asset]/route.ts:39`
- **What:** `Cache-Control: public, max-age=31536000, immutable` on every per-post asset. Filenames are not content-addressed, so replacing an image with the same name leaves stale copies in caches/CDNs for up to a year.
- **Options:**
  - Drop `immutable` (still 1y max-age).
  - Reduce `max-age` to something like `86400` (1 day).
  - Leave as-is — assets really are stable.
- **Decide based on:** whether you ever overwrite an asset filename. If you always rename when you change content, current setting is correct.
- **Decision**: Add content-addressed filenames in a simple not over-engineered way: append a content hash to URLs in the rendered HTML.
  - Approach: in `src/lib/posts.ts`, after `postprocessHtml`, run a fingerprint pass that finds relative `src=`/`href=` references to local assets, reads the file from `postsDir()/<slug>/<asset>`, computes an 8-char SHA-256, and rewrites the URL to `<asset>?v=<hash>`. Cache the hash per (slug, asset) inside the pass so each file is hashed once per build.
  - The route handler at `src/app/[slug]/[asset]/route.ts` doesn't change — it ignores `?v=…`. Browsers/CDNs treat distinct query strings as distinct cache keys, so `immutable` becomes correct: same content → same URL → cache hit; edited content → new hash → new URL → cache miss.
  - Only fingerprint refs that match a single segment with a known asset extension (no `/`, no `..`), to match what the route already accepts.

### 13. `cache.compat = true` flag in emotion registry
- **Where:** `src/app/emotion-registry.tsx:11`
- **What:** The compat flag is from older Chakra/emotion integrations. The build works, so it's not broken, but worth verifying when you upgrade Chakra UI.
- **Decide based on:** nothing to do now. Note for the next Chakra major.
- **Decision**: Keep, but make a "Note(cc): ..." comment about it in the code.

### 14. External links missing `rel="noopener noreferrer"` / `target="_blank"`
- **Where:** `src/components/AppHeader.tsx:16,63,69`
- **What:** Social/homepage links open in the same tab and have no `rel`. Modern browsers default to `noopener` for `target=_blank` so the security risk is minimal, but losing the user's place by replacing the page is worse UX.
- **Decide based on:** preference. Adding `target="_blank" rel="noopener noreferrer"` keeps blog readers on the blog when they pop out to your socials.
- **Decision**: Use modern approach.

### 15. `hexoSlugify` strips non-ASCII characters from anchors
- **Where:** `src/lib/markdown.ts:35-40`
- **What:** Headings containing em-dashes, accented characters, or non-Latin scripts produce anchors with those characters dropped. Matches Hexo's behavior, so existing post anchor URLs still work.
- **Decide based on:** keep as-is unless you want anchor IDs to support more scripts. Changing it would break any external links to existing anchors.
- **Decision**: Switch to a modern slugify (lowercase, Unicode letters/numbers via `\p{L}`/`\p{N}`, strip remaining punctuation). Post URLs (`/a-burn-dance/` etc.) are NOT affected — those come from filenames, not from `hexoSlugify`. Only heading anchor URLs change.
  - Internal anchor refs in the repo: only `src/posts/first-look-at-blinksy.md:21-43` has a TOC (43 entries, all using current title-case slugs like `#Backstory`, `#Announcing-Blinksy`). Update that TOC in the same commit.
  - Heading anchors that would change: ~30 emoji headings in `the-made-up-game.md` and `how-to-dance-with-embedded-rust-generics.md`; headings with `#`/`?`/`(`/`)`/`:`/`'`/`"` in `how-to-dance-with-embedded-rust-generics.md` (`Problem #1`, `Solution #1`, etc.), `empathetic-vs-skeptical-moderates.md` (`What is a moderate?`), `first-look-at-blinksy.md` (e.g. `Clocked LEDs ([SPI][spi])`), `the-lost-cause-blue-helmet-modular-systems.md` (`"The Lost Cause"`), `polyledra-v1-led-tetrahedron.md` (`"I-Can't-Believe-It's-Not-Kiwiburn"`); and any heading with mixed case (lowercasing changes them all).
  - External deep-links to specific sections may rot, but for a personal blog the volume is small and the bulk of inbound links target post URLs (which stay identical).

### 16. `markdown-it-attrs` accepts arbitrary attributes
- **Where:** `src/lib/markdown.ts:17`
- **What:** No `allowedAttributes` whitelist passed, so a heading like `## Hello {onclick="…"}` would emit an inline event handler. Safe today (you author all markdown), but defense-in-depth would pin a whitelist (`['class', 'id', 'data-*']`).
- **Decide based on:** whether you'd ever accept post submissions / PRs from others. For a solo blog, the risk is theoretical.
- **Decision**: Whitelist.

### 17. Atom feed includes full post HTML
- **Where:** `src/app/atom.xml/route.ts:35`
- **What:** Each item's `content` is the full post body. Feed will be large (likely several hundred KB).
- **Decide based on:** RSS readers prefer full content. Bandwidth is cheap on Vercel. Probably leave alone unless the feed grows huge.
- **Decision**: Keep

### 18. `archive/` directory is checked in (~788KB)
- **Where:** `archive/`
- **What:** Pre-migration Hexo source preserved in the repo per the `TODO.md` plan. Not deployed (outside `src/`), but adds to clone size.
- **Decide based on:** keep it for a while in case you need to compare rendered output, then delete in a follow-up commit once you're confident the migration is good.
- **Decison**: Yes will do as suggested, delete later once this migration is complete.
