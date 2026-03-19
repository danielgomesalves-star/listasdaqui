"use strict";(()=>{var e={};e.id=3703,e.ids=[3703],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5626:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>m,patchFetch:()=>x,requestAsyncStorage:()=>u,routeModule:()=>p,serverHooks:()=>c,staticGenerationAsyncStorage:()=>d});var a={};o.r(a),o.d(a,{GET:()=>l});var s=o(49303),r=o(88716),i=o(60670),n=o(87070);async function l(){let e=`User-agent: *
Allow: /

# Bloquear rotas antigas do WordPress para ajudar na transi\xe7\xe3o limpar indexacao antiga
Disallow: /negocios/
Disallow: /segmentos/
Disallow: /wp-admin/
Disallow: /wp-login.php
Disallow: /wp-content/plugins/
Disallow: /wp-content/themes/

# Bloquear painel logado e APIs REST do novo sistema
Disallow: /painel/
Disallow: /admin/
Disallow: /api/
Disallow: /conta/

Sitemap: https://listasdaqui.com.br/sitemap.xml`;return new n.NextResponse(e,{headers:{"Content-Type":"text/plain"}})}let p=new s.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/robots.txt/route",pathname:"/robots.txt",filename:"route",bundlePath:"app/robots.txt/route"},resolvedPagePath:"C:\\Users\\Dell\\Desktop\\Lista Daqui\\listasdaqui\\app\\robots.txt\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:u,staticGenerationAsyncStorage:d,serverHooks:c}=p,m="/robots.txt/route";function x(){return(0,i.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:d})}}};var t=require("../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),a=t.X(0,[8948,5972],()=>o(5626));module.exports=a})();