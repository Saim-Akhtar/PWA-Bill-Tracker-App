const staticCacheName = 'static-cache-v3'
const dynamicCacheName = 'dynamic-cache-v3'
const assets = [
    '/',
    '/index.html',
    '/registrationPage.html',
    '/scripts/ui-design.js',
    '/scripts/sw-navigator.js',
    '/styles/main.css',
    '/styles/form.css',
    'https://use.fontawesome.com/releases/v5.7.2/css/all.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/styles/materialize.min.css',
    '/scripts/materialize.min.js',
    '/scripts/Chart.min.js',
    '/scripts/xlsx.full.min.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.js',
    'https://unpkg.com/aos@next/dist/aos.js',
    'https://unpkg.com/aos@next/dist/aos.css',
    'https://fonts.googleapis.com/css?family=Arvo|Josefin+Sans|Kurale|Roboto&display=swap'
]



// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
}


// installing service workers
self.addEventListener('install', (evt) => {
    // console.log("Service worker installed")
    // self.skipWaiting()
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('caching shell assets')
            cache.addAll(assets)
        })
    )
})




// activating the service worker
self.addEventListener('activate', (evt) => {
    // console.log("Service Worker activated")
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
})

// fetching the requests from service worker
self.addEventListener('fetch', (evt) => {
    // console.log('fetch data', evt.request)
    if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
        evt.respondWith(

            caches.match(evt.request).then((cacheRes) => {
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone())
                        limitCacheSize(dynamicCacheName, 20)
                        return fetchRes
                    })
                })
            })
        )
    }

})