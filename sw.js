const CACHE_NAME = 'beachpro-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './icon_180.png',
  './icon_192.png',
  './icon_512.png'
];

// Instala o Service Worker e guarda os arquivos no cachê
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa e limpa cachês antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Serve os arquivos do cachê quando estiver offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});