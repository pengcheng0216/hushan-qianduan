# Lite Website Project (React + lovable-tagger)

This is the Lite-mode scaffold: a minimal Vite + React project wired with
`lovable-tagger` so the visual editor can anchor edits to JSX elements via
`data-lov-*` attributes.

- Write the page as JSX in `src/App.tsx`; mount it from `src/main.tsx`.
- `index.html` is a thin shell that only loads `/src/main.tsx`; do not inline
  page markup there — `componentTagger` cannot tag raw HTML.
- Tailwind utility classes or inline styles are both acceptable. Keep the tree
  small (one or two components, no router, no global state libraries).
- The shared publisher runs `vite build --mode development` so lovable tags
  survive into the deployed dist; commits the project; uploads the full zip.
