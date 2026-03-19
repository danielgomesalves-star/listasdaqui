import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const prestadores = await prisma.prestador.findMany({
        where: { ativo: true, aprovado: true },
        select: {
            slug: true,
            updatedAt: true,
            servico: { select: { slug: true } },
            cidade: { select: { slug: true, uf: true } },
        }
    })

    // Format the XML URLs 
    const urls = prestadores.map(p => {
        // Escape ampersands and other invalid XML characters just in case
        const path = `/${p.cidade.slug}-${p.cidade.uf.toLowerCase()}/${p.servico.slug}/${p.slug}/`
        return `
  <url>
    <loc>https://listasdaqui.com.br${path}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    }).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400'
        }
    })
}
