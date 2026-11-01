const CACHE_NAME = "home-paraiso-pwa-v2";
const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ignora requisições não-GET, extensões do navegador ou esquemas não-http
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) return;

  // Nunca intercepta requisições para Cloudinary ou Firebase
  if (
    event.request.url.includes("cloudinary.com") ||
    event.request.url.includes("firebase") ||
    event.request.url.includes("googleapis.com")
  ) {
    return;
  }

  // Para navegações (páginas HTML), sempre busca na rede primeiro para garantir código atualizado
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request) || caches.match("/"))
    );
    return;
  }

  // Para outros recursos, rede primeiro com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
