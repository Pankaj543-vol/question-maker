// Pankaj Question Maker: keeps the app working without internet
const CACHE="pqm-v2";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url); if(u.origin!==location.origin) return; // Google fonts / Gemini go straight to the internet
  e.respondWith(fetch(r,{cache:"no-cache"}).then(res=>{ if(res&&res.ok){const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp));} return res; })
    .catch(()=>caches.match(r).then(m=>m||caches.match("./index.html"))));  // newest when online, saved copy when offline
});
