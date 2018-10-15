importScripts('./appshell.js');

var AppShellCache = 'AppShellCache-v4';
var DynamicCache = 'DynamicCache-v4';

//var dontCacheRegExs = [/()/];

self.addEventListener('install', function (event) {
  console.log('[sw] install..');
  
  // event.waitUntil(
  //   caches.open(AppShellCache)
  //     .then(function (cache) {
  //       console.log('[sw] precache AppShell');
  //       cache.addAll(AppShellFiles);
  //     })
  // )
});

self.addEventListener('activate', function (event) {
  console.log('[sw] activate..', event);
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== AppShellCache && key !== DynamicCache) {
            console.log('[sw] remove old cache..', key);
            return caches.delete(key);
          }
        }));
    }));
  return self.clients.claim();
});


self.addEventListener('fetch', function (event) {

  event.respondWith(fetch(event.request));

  // event.respondWith(
  //   caches.match(event.request)
  //     .then(res => {
  //       if (res) {
  //         console.log('[sw] from cache: ' + event.request.url);
  //         return res;
  //       } else {
  //         return fetch(event.request)
  //           .then(function (res) {
  //             console.log('[sw] net: ' + event.request.url);
  //             return caches.open(DynamicCache)
  //               .then(function (cache) {
  //                 cache.put(event.request, res.clone());
  //                 return res;
  //               });
  //           });
  //       }
  //     })
  //   );
});


self.addEventListener('message', function(event){
    
    var actionObj =  JSON.parse(event.data);

    send_message_to_all_clients(
      self[actionObj.action].apply(self, actionObj.arguments)
    );


});


self.getSubordinates = function(id, arrUsers) {

  var allSubords = [];
  getExactSubords(id);

  function getExactSubords(emplId){
    for(var i = 0; i < arrUsers.length; i++){
      if(arrUsers[i].bossid === emplId) {
        allSubords.push(arrUsers[i]);

        getExactSubords(arrUsers[i].id);
      }
    }
  }

  return allSubords;
}


function send_message_to_all_clients(msg){
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            send_message_to_client(client, msg).then(m => console.log(JSON.stringify(m)));
        })
    })
}
function send_message_to_client(client, msg){
    return new Promise(function(resolve, reject){
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };

        client.postMessage(msg, [msg_chan.port2]);
    });
}