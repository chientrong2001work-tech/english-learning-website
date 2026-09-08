import { registerSW } from "virtual:pwa-register";

// Without this, a new deploy sits cached in the service worker until the
// user manually hard-refreshes (or unregisters it in DevTools) — confusing,
// since the page looks like it loaded fine, just with stale content. This
// applies a waiting update immediately (which reloads the page once) and
// re-checks periodically so an already-open tab picks up new deploys on its
// own.
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true);
  },
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const CHECK_INTERVAL_MS = 60 * 60 * 1000;
    setInterval(() => registration.update(), CHECK_INTERVAL_MS);
  },
});
