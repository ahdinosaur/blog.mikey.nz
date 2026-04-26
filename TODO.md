# TODO

Action items from the `refresh-next` review.

## Bugs

- [x] Fix `<img/>` regex in `src/lib/markdown.ts:89`. `/<img([^>]*)\/?>/gi` is greedy and on input `<img src="x"/>` produces the malformed `<img src="x"/ loading="lazy" />`. Use the same conservative form as `src/lib/posts.ts:156` — `/<img\b([^>]*?)\s*\/?>/gi`.
- [x] Add `"sharp": "^0.34.5"` to `dependencies` in `package.json`. `src/lib/images.ts:4` imports it directly but it currently only resolves as a transitive dep of `next`.

## Correctness / hardening

- [x] HTML-escape attribute values in `attrsToString` (`src/lib/posts.ts:245-249`) — at minimum replace `"` with `&quot;` to make the round-trip safe if a value ever contains a literal quote.
- [ ] Handle the `/[slug]/[asset]` vs `/assets/[asset]` slug collision. Reject reserved slugs (`assets`, `archives`, `atom.xml`) in `loadPost`.
- [ ] `parseAssetUrl` (`src/lib/posts.ts:269-270`) silently ignores URLs with more than 2 path segments. Assert in `loadPost` when an in-post asset link doesn't fingerprint
- [ ] Delete `normalizeFrontmatter` (`src/lib/posts.ts:303-309`) and fix the legacy posts that need it

## Cleanup

- [ ] Update `README.md:28` — it claims `public/images/` for site-wide assets, but they live at `src/assets/` and are served via `src/app/assets/[asset]/route.ts`.
- [ ] Drop the redundant traversal checks `slug.includes('/')` / `asset.includes('/')` in `src/app/[slug]/[asset]/route.ts:22` (Next dynamic params can't contain `/`). Keep the `..` check.
- [ ] Simplify `appleIcons` in `src/app/layout.tsx:23-29` — `faviconSizes.includes(180) ? [{ ...180... }] : []` instead of filter+map.
- [ ] Consider extracting the inline Matomo loader from `src/app/layout.tsx:64-66` into a small file or `<script src=...>`.
- [ ] Add a comment at `src/components/PostContent.tsx:155` noting the trust boundary for `dangerouslySetInnerHTML` (HTML is produced by our own remark/rehype pipeline).

## Performance

- [ ] Parallelise the per-image work in `rewriteAssets` (`src/lib/posts.ts:165-213`). Today each `<img>` awaits hash + dims + variants sequentially; collect into an array and `Promise.all`. Only matters for `next build`.

## Testing

- [ ] Add a small snapshot test for the markdown pipeline: one representative post in, expected HTML out (covers `<picture>` wrapping, fingerprinting, image attrs, video embeds).


## Manual test plan (before merging)

- [ ] `next build` succeeds and all pages + asset variants are generated.
- [ ] Spot-check `/<slug>/`, `/archives/`, `/atom.xml`, and a fingerprinted asset URL in a real browser.
- [ ] Confirm `<picture>` srcsets render and the right format (avif/webp) is picked per browser.
- [ ] `/gifts-of-a-charitable-interpretation/` redirects to `/being-charitable/` (308).
- [ ] View-source a post and confirm `<img>` has `width`/`height` attrs (CLS) and `loading="lazy"` on non-LCP images.

---

# Future

## Architecture (longer-term)

- [ ] If the regex-based HTML rewriting in `postprocessHtml` (`src/lib/markdown.ts:91-105`) and `rewriteAssets` (`src/lib/posts.ts:159-235`) grows, fold it into a rehype plugin chain instead of doing two regex passes over the rendered HTML.
- [ ] Replace the `URL_ATTR` lookbehind regex (`src/lib/posts.ts:155`) with a plain match-and-skip for broader runtime portability.

## Product / future

- [ ] Decide whether to paginate the homepage. 25 posts is fine today, but the page renders every excerpt with a `<picture>` tree.
- [ ] Decide whether to set `output: 'export'` in `next.config.mjs`. The route handlers already use `dynamic = 'force-static'` + `generateStaticParams`, so a pure static export would mostly just work — only matters if you want to drop the Node host.
