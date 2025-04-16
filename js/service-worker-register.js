/*!
 * Generic Service Worker for Thorium projects
 * Thorium version 3.x 2021-2022
 * Version 1.2.1 january 2022
 * Copyright 2018-2022 Thorium builder.
*/

if (('serviceWorker' in navigator) && (window.location.protocol != "file:")) {
  if (navigator.serviceWorker.controller) {
    console.log('Thorium Service worker found');
  } else {
    navigator.serviceWorker.register('service-worker.js', {
      scope: './'
    }).then(function (reg) {
      console.log('Thorium Service worker registered for scope:' + reg.scope);
    });
  }
}
