import { NextResponse } from 'next/server'

export async function GET() {
    const base = 'https://listasdaqui.com.br'
    const now = new Date().toISOString()

    // Lista de páginas estáticas e fundamentais
    const paginas = [
        { loc: '/', priority: '1.0' },
        { loc: '/cadastro/', priority: '0.9' },
        { loc: '/login/', priority: '0.8' },
    ]

    const urls = paginas.map(p => `
  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400'
        }
    })
}
