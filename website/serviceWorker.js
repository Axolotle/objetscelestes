self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('objcel').then(function(cache) {
            return cache.addAll([
                './',
                './index.html',
                './stylesheet.css',
                './js/script.js',
                './js/libs/three.module.js',
                './js/observatoire/Asterism.js',
                './js/observatoire/CelestialControls.js',
                './js/observatoire/Constellation.js',
                './js/observatoire/Grid.js',
                './js/observatoire/Observatoire.js',
                './js/observatoire/Options.js',
                './data/UMa.json'
            ]);
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});
