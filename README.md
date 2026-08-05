# palisoft.ru

Personal portfolio of **Yuri Palienko** — full-stack developer. The site itself is part of the portfolio: the code is intentionally small, dependency-light, and readable.

**Live:** [palisoft.ru](https://palisoft.ru)

## Stack

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [three.js](https://threejs.org) via `@react-three/fiber` + `@react-three/drei`

That's the whole dependency list — no CMS, no i18n library, no UI kit.

## Highlights

**3D hero.** Screenshots of real projects orbit on a cylinder around a glass **YP** monogram lit by an HDRI environment. Scene fog dissolves the far half of the ring into the page background, so depth comes for free and fifteen cards never compete with the logo at once. Cards are clickable and open a lightbox. See [components/hero](components/hero/).

**i18n without a library.** Two locales (`ru` default, `en`). A tiny [proxy](proxy.ts) parses `Accept-Language` by hand (~20 lines, q-values included) and redirects `/` to `/ru` or `/en`; everything under [app/[lang]](app/%5Blang%5D/) is statically typed against the `Locale` union. Asset routes are carefully excluded from the redirect so three.js can `fetch` HDRIs and textures without hitting a 307.

**Content as data.** All copy lives in per-locale JSON under [content/](content/), validated by TypeScript types in [types/](types/) and loaded through a single typed accessor in [lib/content.ts](lib/content.ts). Adding a language = adding a folder.

**SEO.** Per-locale [sitemap](app/sitemap.ts) and [robots](app/robots.ts) generated from one route list.

## Structure

```
app/[lang]/       pages: works, about, articles, pricing, cv, contacts
components/
  hero/           three.js scene, lightbox, YP logo
  layout/         header, footer, nav, locale switcher
  ui/             small primitives (Card, Tag, ExternalLink, …)
content/{ru,en}/  all site copy as typed JSON
lib/              i18n + content accessors
proxy.ts          locale detection & redirect
public/           work screenshots, HDRI, CV
```

## Development

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
pnpm lint
```

---

© 2026 Yuri Palienko
