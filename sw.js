/* 今天 App Service Worker - 离线缓存 + Web Push */
const CACHE_NAME='jintian-v20260923-4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(ASSETS)})),self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE_NAME}).map(function(k){return caches.delete(k)}))})),self.clients.claim()});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(function(cached){if(cached)return cached;return fetch(e.request).then(function(res){if(res&&res.status===200){var clone=res.clone();caches.open(CACHE_NAME).then(function(c){c.put(e.request,clone)})}return res}).catch(function(){return cached})}))});

/* Web Push 接收：远程拍照保持原逻辑；天气/喝水/待办/经期等通用通知直接弹出 */
self.addEventListener('push',function(e){
  var data={};
  try{data=e.data?e.data.json():{};}catch(err){data={title:'今天',body:e.data?e.data.text():''};}
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
    return;
  }
  var title=data.title||'今天';
  var body=data.body||data.message||'';
  var action=data.action||data.type||'';
  // 同一提醒带相同 tag，系统只保留/更新一条，避免本地与云端、多次轮询造成重复通知
  var tag=data.tag||('jintian_'+(data.type||'notice'));
  e.waitUntil(self.registration.showNotification(title,{
    body:body,
    tag:tag,
    renotify:false,
    icon:'./icon.png',
    badge:'./icon.png',
    data:{url:'./',action:action}
  }));
});

/* 点击通知：已打开则聚焦并跳转到对应页，未打开则启动 APP */
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var action=(e.notification.data&&e.notification.data.action)||'';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(clients){
    if(clients.length>0){
      var client=clients[0];
      if(action){try{client.postMessage({type:'navigate',action:action});}catch(err){}}
      if('focus'in client)return client.focus();
      return;
    }
    return self.clients.openWindow('./');
  }));
});
