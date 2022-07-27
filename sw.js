const cacheName = 'mmcalc-v1';
const staticAssets = [
    './',
    './index.html',
    './index.js',
    './manifest.webmanifest'
];

self.addEventListener("install", (event) => {
    console.log("Service Worker : Installed!");
    event.waitUntil(
        (async() => {
            try {
                cache_obj = await caches.open(cacheName)
                cache_obj.addAll(staticAssets)
                return self.skipWaiting();
            }
            catch{
                console.log("error occured while caching...")
            }
        })()
    )
});

self.addEventListener('activate', e=>{
    self.clients.claim();
});

self.addEventListener('fetch', async e=>{
    const req = e.request;
    const url = new URL(req.url);
    
    if(url.origin == location.origin) {
        e.respondWith(cacheFirst(req));
    }else {
        e.respondWith(networkAndCache(req));
    }
});

async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    return cached || fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheName);
    try {
        const fresh = await fetch(req);
        await cache.put(req, fresh.clone());
        return fresh;
    } catch(e) {
        const cached = await cache.match(req);
        return cached;
    }
}