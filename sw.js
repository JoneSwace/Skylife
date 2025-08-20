// sw.js - Service Worker a Skylife játékhoz

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('skylife-cache').then((cache) => {
      return cache.addAll([
        '/index.html',
        '/manifest.json',
        '/skylife1.png',
        '/skylife2.png',
        // Itt adj hozzá minden más fájlt, amit a játék használ:
        // Pl. JS, CSS, képek, hangok stb.
        // Példák:
        // '/main.js',
        // '/style.css',
        // '/sounds/jump.mp3'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
