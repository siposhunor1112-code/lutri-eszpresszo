/* Lutri Eszpresszó – offline működés.
   Az oldal mindig a netről töltődik, ha van kapcsolat; ha nincs, az utolsó mentett változat jelenik meg.
   Nagyobb változtatás után érdemes a VERSION értékét eggyel növelni. */
const VERSION = "lutri-v1";
const CORE = [
  "./", "index.html", "styles.css", "script.js", "manifest.webmanifest", "404.html",
  "assets/icon-192.png",
  "assets/fonts/yellowtail-latin-400-normal.woff2",
  "assets/fonts/fraunces-latin-400-normal.woff2", "assets/fonts/fraunces-latin-400-italic.woff2",
  "assets/fonts/fraunces-latin-500-normal.woff2", "assets/fonts/manrope-latin-400-normal.woff2",
  "assets/fonts/manrope-latin-500-normal.woff2", "assets/fonts/manrope-latin-600-normal.woff2",
  "assets/fonts/manrope-latin-700-normal.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // időjárás, térkép: mindig élőben

  // Oldal, stílus, kód: előbb a net, utána a mentett változat
  if (req.mode === "navigate" || /\.(html|css|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/")) {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }
  // Betűk, képek: a mentett változat, ha van
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
