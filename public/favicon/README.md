# YP favicon pack

Files (drop into Next.js `public/`):

- favicon.ico — 16 / 32 / 48 multi-size (16 = "Y" only)
- favicon-16x16.png — "Y" only
- favicon-32x32.png, favicon-48x48.png, favicon-96x96.png — "YP"
- apple-touch-icon.png (180)
- icon-192.png, icon-512.png (PWA)
- favicon.svg (YP), favicon-mono-Y.svg (Y only)
- site.webmanifest

## Next.js App Router head tags

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#0a0a0b" />
```

Background #0a0a0b, letters silver gradient #f2f5f7 → #c3cad1 → #8b9299, Helvetica Bold, tight negative tracking.
