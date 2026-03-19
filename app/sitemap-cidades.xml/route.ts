import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const cidades = await prisma.cidade.findMany({
        select: { slug: true, uf: true }
    })

    const urls = cidades.map(c => {
        const path = `/${c.slug}-${c.uf.toLowerCase()}/`
        return `
  <url>
    <loc>https://listasdaqui.com.br${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    }).join('')

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
