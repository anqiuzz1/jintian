/* 今天 App Service Worker - 离线缓存 + Web Push */
const CACHE_NAME='jintian-v20260909-3';
const ASSETS=['./','./index.html'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(ASSETS)})),self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE_NAME}).map(function(k){return caches.delete(k)}))})),self.clients.claim()});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(function(cached){if(cached)return cached;return fetch(e.request).then(function(res){if(res&&res.status===200){var clone=res.clone();caches.open(CACHE_NAME).then(function(c){c.put(e.request,clone)})}return res}).catch(function(){return cached})})})});

/* Web Push 接收 */
self.addEventListener('push',function(e){
  try{
    var data=e.data?e.data.json():{};
    if(data.type==='photo_request'){
      e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(clients){
        clients.forEach(function(client){
          client.postMessage({type:'photo_request',from:data.from,camera:data.camera,requestId:data.requestId});
        });
        if(clients.length===0){
          return self.registration.showNotification('我也在想你哦',{
            body:'点击查看',
            icon:'./icon.png',
            badge:'./icon.png',
            data:{url:'./'}
          });
        }
      }));
    }
  }catch(err){
    console.log('Push error:',err);
  }
});

/* 点击通知打开APP */
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(clients){
    if(clients.length>0){
      clients[0].focus();
    }else{
      return self.clients.openWindow('./');
    }
  }));
});
