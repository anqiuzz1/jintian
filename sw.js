/* 今天 App Service Worker - 离线缓存 */
const CACHE_NAME='jintian-v20260907';
const ASSETS=['./','./index.html'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(ASSETS)})),self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE_NAME}).map(function(k){return caches.delete(k)}))})),self.clients.claim()});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(function(cached){if(cached)return cached;return fetch(e.request).then(function(res){if(res&&res.status===200){var clone=res.clone();caches.open(CACHE_NAME).then(function(c){c.put(e.request,clone)})}return res}).catch(function(){return cached})})})});
