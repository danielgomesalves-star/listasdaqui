import { NextResponse } from 'next/server'

export async function GET() {
    const base = 'https://listasdaqui.com.br'
    const now = new Date().toISOString()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${base}/sitemap-categorias.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-prestadores.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-cidades.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        }
    })
}
