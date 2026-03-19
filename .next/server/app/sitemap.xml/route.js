"use strict";(()=>{var e={};e.id=6717,e.ids=[6717],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},10402:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>c,patchFetch:()=>x,requestAsyncStorage:()=>n,routeModule:()=>l,serverHooks:()=>u,staticGenerationAsyncStorage:()=>d});var s={};a.r(s),a.d(s,{GET:()=>p});var i=a(49303),o=a(88716),r=a(60670),m=a(87070);async function p(){let e="https://listasdaqui.com.br",t=new Date().toISOString(),a=`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${e}/sitemap-categorias.xml</loc>
    <lastmod>${t}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${e}/sitemap-prestadores.xml</loc>
    <lastmod>${t}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${e}/sitemap-cidades.xml</loc>
    <lastmod>${t}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${e}/sitemap-static.xml</loc>
    <lastmod>${t}</lastmod>
  </sitemap>
</sitemapindex>`;return new m.NextResponse(a,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"}})}let l=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"route",bundlePath:"app/sitemap.xml/route"},resolvedPagePath:"C:\\Users\\Dell\\Desktop\\Lista Daqui\\listasdaqui\\app\\sitemap.xml\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:n,staticGenerationAsyncStorage:d,serverHooks:u}=l,c="/sitemap.xml/route";function x(){return(0,r.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:d})}}};var t=require("../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),s=t.X(0,[8948,5972],()=>a(10402));module.exports=s})();