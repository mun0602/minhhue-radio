const CACHE_NAME = "minhhue-radio-v1";
const ASSETS = [
  "/",
  "/manifest.json",
  "/radio.css",
  "/globals.css",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", (e) => {
  // Bỏ qua audio proxy request để tránh lỗi cache media stream lớn
  if (e.request.url.includes("/api/audio-proxy")) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
