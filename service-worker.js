/*!
 * Generic Service Worker for Thorium projects
 * Version 3.4 january, 2022
 * Copyright 2018-2022 Nymphide Lab.
*/

const origin=self.location.origin;
const skipAllExternalUrl=true;
const blacklist=["https://firestore.googleapis.com","version.json",".php","%7B%7Binstimage%7D%7D"];
const preloadList=['./','./offline.html', './index.html', './manifest.webmanifest']

function isRejectable(url) {
  if ((skipAllExternalUrl == true) && (url.indexOf(origin) == -1)) {
    return true;
  } else {
    if (blacklist.some(v => url.includes(v))) {
      return true;
    } else {
      return false;
    }
  }
}

self.addEventListener('install', function(event) {
  event.waitUntil(preLoad());
  console.log('[com.thorium.serviceworker] Service Worker Initialized');
});

/* -- SW Initialization --*/
var preLoad = function(){
  console.log('[com.thorium.serviceworker] Service Worker Installation');
  return caches.open('thorium-cache')
  .then(function(cache) {
    return cache.addAll(preloadList);
  });
}

self.addEventListener('activate', function(event) {
  console.log('[com.thorium.serviceworker] service worker activated');
});

/* -- SW Fetch during use --*/
self.addEventListener('fetch', function(event) {
  if ( isRejectable(event.request.url)==true) {
    console.log('[com.thorium.serviceworker] request rejected '+event.request.url);
    return;
  }
  event.respondWith(
    checkResponse(event.request)
    .catch(function() {
      console.log('[com.thorium.serviceworker] file returned from cache: '+event.request.url);
      return returnFromCache(event.request);
    }
  ));
  event.waitUntil(
    addToCache(event.request)
  );
});

var checkResponse = function(request){
  return new Promise(function(fulfill, reject) {
    fetch(request)
    .then(function(response){
      if(response.status !== 404) {
        console.log('[com.thorium.serviceworker] Response Status '+response.status+": "+request.url);
        fulfill(response)
      } else {
        console.log("[com.thorium.serviceworker] reject response for url "+request.url);
        reject();
      }
    }, reject)
  });
};

var addToCache = function (request) {
  try {
    return caches.open('thorium-cache').then(function (cache) {
      return fetch(request)
        .then(function (response) {
          console.log('com.thorium.serviceworker] file added to cache ' + request.url);
          return cache.put(request, response);
        });
    });
  }
  catch(err) {
    console.log('com.thorium.serviceworker] error ' + err.message);
  }  
};

var returnFromCache = function (request) {
  return caches.open('thorium-cache')
    .then(function (cache) {
      return cache.match(request)
        .then(function (matching) {
          if (!matching || matching.status == 404) {
            console.log("[com.thorium.serviceworker] offline page");
            return cache.match('offline.html');
          } else {
            console.log("[com.thorium.serviceworker] cache returned " + request.url);
            return matching
          }
        });
    });
};