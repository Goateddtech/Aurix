# AURIX — Considered Indulgence

Single-page dark-luxury marketing site for AURIX, a matte-black canned botanical
apéritif (Elderflower · Jalapeño · Citrus, with Marine Collagen + Vitamin C).

## Stack

- **Vite + React 18**
- **three.js + @react-three/fiber + drei** — procedural 3D can, martini glass,
  pour stream, all built in code (no GLB assets; the can label is a canvas-drawn
  texture mirroring the product photography)
- **Hand-rolled scroll choreography** — the pinned hero maps scroll to a single
  0→1 progress value; every 3D transform is a pure function of that value
  (fully scrubbable both directions, resolution-independent). No GSAP needed.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## The 3D sequence

A sticky canvas spans the first 320vh of scroll:

- **Stage A (0–6%)** — idle hero: can auto-rotates (~20s/rev) on a marble
  pedestal under a warm spot, copper rim light, bokeh orbs.
- **Stage B (6–38%)** — first 360° Z-tumble toward the viewer; pedestal fades.
- **Stage C (38–60%)** — second, sharper 360° tumble; can drifts off-center.
- **Stage D (60–100%)** — can tilts to ~112°, the sugar-rimmed martini glass
  fades in, a golden stream + droplets fill the liquid cone (scaling a cone
  from its apex = physically correct conical fill), can fades off, camera
  settles on the finished drink.

Copy panels fade in/out at stage boundaries, driven by the same progress value.

## Debug / preview params

- `/?p=0.8` — pin the hero sequence at any progress value (0–1)
- `/?nohero` — skip the 3D hero (used for section screenshots)

## Accessibility / fallbacks

- `prefers-reduced-motion` → static photographic hero, no canvas, no marquee
- WebGL failure → error boundary swaps in the product photo
- 3D chunk is lazy-loaded behind a blurred still frame; first paint is DOM-only

## Placeholder data

All unconfirmed facts (doses, sugar, ABV, quotes, socials, origin) are marked
with `†` and a "provisional" footnote — swap in real values before launch.
