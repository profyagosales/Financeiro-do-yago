self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  if (self.clients && self.clients.claim) self.clients.claim();
});
self.addEventListener('fetch', () => {
  // no-op
});
