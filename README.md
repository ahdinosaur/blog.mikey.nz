# blog.mikey.nz

My personal blog as raw files.

Built with [Next.js](https://nextjs.org) and [Chakra UI](https://chakra-ui.com).

## Development

```shell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```shell
npm run build
```

## Layout

- `src/posts/` — markdown posts and their per-post asset folders
- `src/app/` — Next.js App Router routes
- `src/components/` — reusable view components
- `src/lib/` — site config, theme, markdown pipeline, post loader
- `public/images/` — site-wide assets (avatar, banner, favicon)
- `archive/` — pre-migration Hexo source kept for reference

Per-post asset folders live alongside the markdown (e.g. `src/posts/being-charitable.md` and `src/posts/being-charitable/`). They are served by a Next.js route handler at `/<slug>/<asset>` so existing markdown links keep working.

## Notes

- [Encoding Video](https://gist.github.com/Vestride/278e13915894821e1d6f)
