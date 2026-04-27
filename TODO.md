# TODO

Action items from the second `refresh-next` review.

## Bugs

- [x] Fix `./<slug>/asset` markdown paths that 404 with `trailingSlash: true`.

  `rewriteAssets` (`src/lib/posts.ts:251-275`) only appends `?v=<hash>` to matched URLs — it does not normalize `./<slug>/asset` to `/<slug>/asset`, and the picture builder copies the original `src` verbatim into the inner `<img>` (`src/lib/posts.ts:232-235`). With trailing slashes on, the browser at `/<slug>/` resolves `./<slug>/asset` to `/<slug>/<slug>/asset`. Confirmed live: `/holonic-systems/holonic-systems/super-sub-3.svg` 404s while `/holonic-systems/super-sub-3.svg` 200s.

  For PNG/JPG the absolute `<source srcset>` rescues display in modern browsers, but the inner `<img src>` fallback still 404s — that matters for RSS readers, social/OG scrapers, and any client that doesn't pick a `<source>`. For SVG (no `<picture>` wrap) the image is plainly broken.

  Affected files:
    - `src/posts/holonic-systems.md:8,14` — `[Holons](./life-as-a-holon)` is a broken text link (no extension, so `parseAssetUrl` returns null and the URL is left alone).
    - `src/posts/holonic-systems.md:18,39` — SVG + PNG with `./holonic-systems/...`.
    - `src/posts/life-as-a-holon.md:28,36,54,58` — `./life-as-a-holon/...png`.
    - `src/posts/workers-of-open-source-unite.md:29,63` — `./workers-of-open-source-unite/...png`.
    - `src/posts/a-burn-dance.md:54-59` — `./a-burn-dance/...jpg`.

  Action: Rewrite the legacy markdown to use absolute `/<slug>/<asset>` like the rest of the corpus (matches what frontmatter `image:` already does, keeps the codebase invariant clean, doesn't grow the regex pipeline).

  While here, make `rewriteAssets` throw when an inner-`<img>` src can't be normalised (currently silent), the same way it already throws when a fingerprint can't be found.

- [x] Stop emitting `<p><div class="image-wrapper">...</div></p>`.

  remark-rehype produces `<p><img></p>` for an image alone on a line; `postprocessHtml` (`src/lib/markdown.ts:91-105`) then wraps the `<img>` in a `<div>`, which is illegal inside `<p>`. Browsers auto-close the `<p>` on the `<div>`, leaving a stray empty `<p>` that picks up `& p { marginBottom: '1rem' }` from `PostContent`'s scoped css — visible extra whitespace before every wrapped image. Confirmed in `test/fixtures/sample-post.expected.html:2,4` and in the live build (`/being-charitable/` has 5 occurrences of `<p><a href=…><div class="image-wrapper">`).

  Right fix: do the wrapping in a rehype plugin that lifts `<img>` out of its `<p>` parent (or replaces the `<p>` with the wrapper), instead of regexing stringified HTML. See the architecture entry below — same plugin can do the picture build and URL rewrite.

- [x] Make bare `<iframe>` responsive in two posts.

  - `src/posts/life-as-a-holon.md:24` — `<iframe class="video" width="853" height="480" …>`
  - `src/posts/natures-best-practices-for-distributed-systems.md:18-26` — YouTube iframe at 560×315.

  Neither is wrapped in `.video-embed`/`.video-wrapper`. Chakra v3's reset (and the old SCSS reset) sets `max-width: 100%` only on `img`/`video`, not `iframe`, so these overflow on viewports narrower than their hardcoded width. Same in the old theme, so not strictly a regression, but easy to fix:
  - Convert to the `<div class="video-embed" data-type="youtube" data-src=…>` pattern used elsewhere (also picks up the lazy hydrator)

## Performance

- [x] Memoise `getAllPosts()` per build.

  No module-level cache (deliberately dropped to avoid stale data). Each of the ~28 page renders re-reads + re-renders all 25 posts → ~700 markdown renders per build. Not the current bottleneck (AVIF is), but cheap to fix and won't reintroduce the old hazard: wrap with `React.cache(getAllPosts)` so dedup is request-scoped.

## Cleanup

- [x] Drop the dead `.thumbnail` className from the home page.

  `src/app/page.tsx:37` sets `<Box className="thumbnail">`, but the matching `& .thumbnail img { maxHeight: '33.33vh' }` rule (`src/components/PostContent.tsx:126`) is scoped to descendants of `<PostContent>` — the home-page thumbnail is a sibling, not a descendant. The actual sizing comes from the inline `imgStyle`. No markdown asset uses `class="thumbnail"` either, so both the className and the css rule can go.

- [x] Silence (or fix) the Turbopack NFT warning from `src/app/[slug]/[asset]/route.ts`.

  Build logs `Encountered unexpected file in NFT list … the whole project was traced unintentionally` because of the `path.join(process.cwd(), 'src', 'posts', …)` / `fs.readFile` calls. With `dynamicParams = false` these never run on a deployed host, so it's cosmetic, but it does mean any deploy that uses NFT tracing would bundle more than necessary. Either:
  - Add `/*turbopackIgnore: true*/` next to the `process.cwd()` calls, or
  - Pin `POSTS_DIR` and `ASSETS_DIR` once at module top so the trace sees a single static path.

- [x] Fold `isLocalAssetCandidate` (`src/lib/posts.ts:304-312`) into `parseAssetUrl`.

  They duplicate the protocol/`//`/`#`/`?` and extension checks. One function returning `{ kind: 'asset', slug, asset } | { kind: 'local-candidate' } | { kind: 'external' }` covers both call sites without the duplication.

## Architecture

- [x] Replace `postprocessHtml` + the regex parts of `rewriteAssets` with a rehype plugin chain.

  This is no longer just a "if it grows" cleanup — bug #2 above is *caused* by wrapping on stringified HTML, and bug #1's silent broken inner-`<img>` fallback exists because the regex pass can't see structural context. A single rehype visitor over `<img>` nodes can:
  - Lift the `<img>` out of any wrapping `<p>` (fixes invalid HTML).
  - Wrap in `<div class="image-wrapper">` and build `<picture>` with absolute `<source srcset>`s.
  - Set `width`/`height` from sharp metadata (CLS).
  - Rewrite both `<img src>` and any peer `<a href>` to absolute fingerprinted URLs.

  After this, `rewriteAssets` either disappears or shrinks to a small `<a href>` fingerprinter (and `postprocessHtml` shrinks to just the video-wrapper rule, or moves into the same plugin).

- [x] Unify `<picture>` construction between `ResponsivePicture` and the rehype plugin.

  Both compute hash + dims + variants and emit the same `<picture>` shape. Once the plugin exists, both should call a single `buildPicture(sourcePath, src)` helper returning `{ sources, dims, hash, fingerprintedSrc }`. Without this, every change to the srcset format has to be made in two places.

## Manual test plan (before merging)

- [ ] `next build` succeeds and all pages + asset variants are generated.
- [ ] Spot-check `/<slug>/`, `/archives/`, `/atom.xml`, and a fingerprinted asset URL in a real browser.
- [ ] Confirm `<picture>` srcsets render and the right format (avif/webp) is picked per browser.
- [ ] `/gifts-of-a-charitable-interpretation/` redirects to `/being-charitable/` (308).
- [ ] View-source a post and confirm `<img>` has `width`/`height` attrs (CLS) and `loading="lazy"` on non-LCP images.
- [ ] After bug #1 is fixed, walk `/holonic-systems/`, `/life-as-a-holon/`, `/workers-of-open-source-unite/`, `/a-burn-dance/` and confirm every image and inline link resolves.
- [ ] After bug #2 is fixed, confirm no stray empty `<p>` elements appear above wrapped images (inspect element).

---

# Future

## Architecture (longer-term)

- [ ] Replace the `URL_ATTR` lookbehind regex (`src/lib/posts.ts:163`) with a plain match-and-skip for broader runtime portability. (Moot if the rehype-plugin migration above lands, since the regex goes away entirely.)

## Product / future

- [ ] Decide whether to paginate the homepage. 25 posts is fine today, but the page renders every excerpt with a `<picture>` tree.
- [ ] Decide whether to set `output: 'export'` in `next.config.mjs`. The route handlers already use `dynamic = 'force-static'` + `generateStaticParams`, so a pure static export would mostly just work — only matters if you want to drop the Node host.
