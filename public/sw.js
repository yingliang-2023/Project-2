var cacheName = "blog";
var filesToCache = [
  "/",
  "/views/about.ejs",
  "/views/home.ejs",
  "/views/users.ejs",
  "/views/login.ejs",
  "/views/register.ejs",
  "/css/styles.css",
  "/js/main.js",
  "./app.js",
  "./server.js",
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});