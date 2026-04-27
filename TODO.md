# TODO

## Manual test plan (before merging)

- [ ] `next build` succeeds and all pages + asset variants are generated.
- [ ] Spot-check `/<slug>/`, `/archives/`, `/atom.xml`, and a fingerprinted asset URL in a real browser.
- [ ] Confirm `<picture>` srcsets render and the right format (avif/webp) is picked per browser.
- [ ] `/gifts-of-a-charitable-interpretation/` redirects to `/being-charitable/` (308).
- [ ] View-source a post and confirm `<img>` has `width`/`height` attrs (CLS) and `loading="lazy"` on non-LCP images.
- [ ] After bug #1 is fixed, walk `/holonic-systems/`, `/life-as-a-holon/`, `/workers-of-open-source-unite/`, `/a-burn-dance/` and confirm every image and inline link resolves.
- [ ] After bug #2 is fixed, confirm no stray empty `<p>` elements appear above wrapped images (inspect element).
