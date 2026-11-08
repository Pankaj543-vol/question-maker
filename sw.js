// Pankaj Question Maker: keeps the app working without internet
const CACHE="pqm-v12", SHARE="pqm-share";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==SHARE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;
  // pictures or PDFs shared to the app from the phone's Share menu: keep them, then open the app
  if(r.method==="POST"&&new URL(r.url).pathname.endsWith("/share-target")){
    e.respondWith((async()=>{
      try{
        const fd=await r.formData(), files=fd.getAll("files").filter(f=>f&&f.size), c=await caches.open(SHARE);
        let i=0; for(const f of files){ await c.put("./shared/"+Date.now()+"-"+(i++),new Response(f,{headers:{"content-type":f.type||"application/octet-stream","x-name":encodeURIComponent(f.name||"file")}})); }
        return Response.redirect("./?shared="+i,303);
      }catch(err){ return Response.redirect("./?shared=0",303); }
    })());
    return;
  }
  if(r.method!=="GET") return;
  const u=new URL(r.url); if(u.origin!==location.origin) return; // Google fonts / Gemini go straight to the internet
  e.respondWith(fetch(r,{cache:"no-cache"}).then(res=>{ if(res&&res.ok){const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp));} return res; })
    .catch(()=>caches.match(r).then(m=>m||caches.match("./index.html"))));  // newest when online, saved copy when offline
});
