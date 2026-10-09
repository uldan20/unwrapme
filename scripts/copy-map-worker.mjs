// MapLibre 6 loads its web worker from a URL at runtime, which no bundler can
// follow — so the worker is served as a plain file from public/vendor. This runs
// after every `npm install`, so an upgrade of maplibre-gl never leaves a stale
// worker behind.
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('public/vendor', { recursive: true });
copyFileSync(
  'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs',
  'public/vendor/maplibre-gl-worker.mjs'
);
