# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static, single-page promotional landing site (pt-BR) for a fictional "Super Mario Galaxy: O Filme" movie. Pure HTML/CSS/vanilla JS — no framework, no bundler, no package.json, no build step.

## Running the site

There is no build/dev/test tooling. Open [index.html](index.html) directly in a browser, or serve the directory with any static file server (needed if a feature requires `fetch`/CORS, but currently nothing does), e.g.:

```
python -m http.server 8000
```

There is no linter, formatter, or test suite configured — don't invent commands for these.

## Architecture

### Spec-driven section workflow

This repo is built section-by-section from written specs, not from ad-hoc design. For each section of the page there is a matching doc in [docs/](docs/) (e.g. `hero-section-spec.md`, `personagens-section-spec.md`, `trailers-section-spec.md`, `estreia-section-spec.md`, `marquee-section-spec.md`, `nav-section-spec.md`, `starfield-section-spec.md`, `contador-animacao-spec.md`). Each spec was derived from a reference screenshot in [prints/](prints/) (desktop/mobile prints, Figma frame exports) and is treated as the literal source of truth: specs explicitly forbid adding any element, text, or structure not present in the print/inventory list. When implementing or modifying a section, read its spec doc first and match it exactly rather than improvising layout/content — do not add extra elements "while you're in there."

**Current state:** [index.html](index.html) only has the `<nav>` and `<section class="hero">` built out. The floating nav already links to `#personagens`, `#trailers`, and `#estreia`, but those sections do not exist in the markup yet — they exist only as specs in `docs/` waiting to be implemented.

### Design tokens

[DESIGN.md](DESIGN.md) is the canonical design system reference (palette, type scale, spacing, motion easing, anti-patterns). Its "Canonical Token Snippet" is duplicated as CSS custom properties in the `:root` block of [css/style.css](css/style.css:1) — when a token value needs to change, update it in both places. Section specs reference tokens by CSS variable name (e.g. `--accent-star`, `--ease-out-expo`) rather than raw values, so cross-check `DESIGN.md`/`style.css` when a spec mentions a token.

Anti-pattern rules from `DESIGN.md` worth respecting when writing CSS: don't substitute the `Outfit` font, don't introduce colors/grays outside the documented palette, don't use raw `#FFFFFF` where `--text-primary` applies, no aggressive external glow on buttons/cards, animate only `transform`/`opacity` for performance.

[design-system.html](design-system.html) is a separate standalone style-guide/showcase page for the tokens (not linked from `index.html`). Note it currently references `css/design-system.css`, which does not exist in this repo — that page is not fully wired up.

### JavaScript

- [js/script.js](js/script.js) is the only script currently loaded by `index.html`. It has two independently-initialized pieces, both wired up on `DOMContentLoaded`:
  - `initFloatingNav()` — reveals the floating nav after 60% of hero height is scrolled past, and drives scrollspy (adds `floating-nav__link--active` based on section in view).
  - `initStarfield()` — a canvas (`#starfield`) starfield/nebula background. It reads colors live from the CSS custom properties on `:root` (via `getComputedStyle`), so canvas colors stay in sync with `style.css` tokens automatically. Respects `prefers-reduced-motion` (renders a single static frame instead of animating).
- [js/scroll-animations.js](js/scroll-animations.js) is a reusable scroll-parallax utility (exposes `window.ScrollParallax`). **It is not currently `<script>`-included in `index.html`** — it must be added there before its `data-scroll-parallax` attributes will do anything. Elements opt in declaratively via `data-scroll-parallax="<trigger-selector>"` plus `data-speed` / `data-rotate` / `data-scale` attributes; elements sharing the same trigger selector are grouped into one parallax instance. See the file's header comment for full usage. The `personagens` section spec calls this out as the parallax extension target from the hero (`extendedEndSelector`).

### Assets

[assets/videos/](assets/videos/) holds alpha-channel `.webm` + `.mp4` fallback pairs per character/element (e.g. `mario-clip-alpha.webm` / `mario-clip-min.mp4`) — always provide both `<source>`s in that order (webm first) when adding video, matching the existing hero markup pattern. [assets/images/](assets/images/) are `.webp`. [prints/](prints/) are reference-only screenshots/Figma exports used to write specs, not shipped assets.
