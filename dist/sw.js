// Service Worker for Korean Learning App PWA
const CACHE_NAME = 'kla-v5-nolikorea-6';
const AUDIO_CACHE_NAME = 'kla-v3-audio-cache-v1';

const ASSETS = [
    './',
    './index.html',
    './styles.css', './theme.js', './icons.js', './seoul.js',
    './voice.js',
    './keyboard.js',
    './recall.js',
    './production.js',
    './anatomy.js',
    './ai.js',
    './audio-map.js',
    './curriculum-data.js',
    './app.js',
    './modules/actions.js',
    './modules/ai-request.js',
    './modules/audio.js',
    './modules/catalog.js',
    './modules/data-store.js',
    './modules/item-review.js',
    './modules/mistakes.js',
    './modules/navigation.js',
    './modules/progress.js',
    './modules/reviews.js',
    './modules/roleplay.js',
    './modules/scheduler.js',
    './modules/search.js',
    './modules/settings.js',
    './modules/study-session.js',
    './modules/study.js',
    './modules/update.js',
    './modules/noli-ui.js',
    './modules/learning-content.js',
    './modules/daily-session.js',
    './modules/content-feedback.js',
    './modules/tab-sync.js',

    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );

});

self.addEventListener('message', event => { if(event.data?.type==='ACTIVATE_UPDATE') self.skipWaiting(); });

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(k => {
                    if (k.startsWith('kla-') && k !== CACHE_NAME && k !== AUDIO_CACHE_NAME) return caches.delete(k);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Only cache GET requests that are not Gemini API calls
    if (event.request.method !== 'GET' || event.request.url.includes('googleapis.com')) {
        return;
    }

    // Dynamic on-demand cache-first strategy for audio tracks
    if (event.request.url.includes('/audio/snu1a/')) {
        event.respondWith(
            caches.open(AUDIO_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;
                    return fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // Static assets cache
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
