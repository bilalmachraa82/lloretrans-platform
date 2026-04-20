const CACHE = "lloretrans-oficina-v1";
const SHELL = [
  "/oficina",
  "/oficina/new",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {
      // Silent — shell caching is best-effort
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/oficina") && request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return r;
        })
        .catch(() => caches.match(request).then((r) => r ?? caches.match("/oficina"))),
    );
    return;
  }

  if (SHELL.some((p) => url.pathname === p)) {
    event.respondWith(caches.match(request).then((r) => r ?? fetch(request)));
  }
});
