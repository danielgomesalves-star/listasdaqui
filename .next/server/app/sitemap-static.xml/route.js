"use strict";(()=>{var e={};e.id=4450,e.ids=[4450],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},10625:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>d,patchFetch:()=>x,requestAsyncStorage:()=>u,routeModule:()=>l,serverHooks:()=>m,staticGenerationAsyncStorage:()=>c});var i={};r.r(i),r.d(i,{GET:()=>p});var a=r(49303),o=r(88716),s=r(60670),n=r(87070);async function p(){let e=new Date().toISOString(),t=[{loc:"/",priority:"1.0"},{loc:"/cadastro/",priority:"0.9"},{loc:"/login/",priority:"0.8"}].map(t=>`
  <url>
    <loc>https://listasdaqui.com.br${t.loc}</loc>
    <lastmod>${e}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${t.priority}</priority>
  </url>`).join(""),r=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${t}
</urlset>`;return new n.NextResponse(r,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=86400"}})}let l=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/sitemap-static.xml/route",pathname:"/sitemap-static.xml",filename:"route",bundlePath:"app/sitemap-static.xml/route"},resolvedPagePath:"C:\\Users\\Dell\\Desktop\\Lista Daqui\\listasdaqui\\app\\sitemap-static.xml\\route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:u,staticGenerationAsyncStorage:c,serverHooks:m}=l,d="/sitemap-static.xml/route";function x(){return(0,s.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:c})}}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[8948,5972],()=>r(10625));module.exports=i})();