import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    // Para as categorias, precisamos listar todas as combinações de Cidade x Servico que tem conteudo ou que existem
    const [cidades, servicos] = await Promise.all([
        prisma.cidade.findMany({ select: { slug: true, uf: true } }),
        prisma.servico.findMany({ select: { slug: true } })
    ])

    // Simulando a indexação massiva (SSG) de Cidade x Servico
    const urls = []

    for (const c of cidades) {
        for (const s of servicos) {
            const path = `/${c.slug}-${c.uf.toLowerCase()}/${s.slug}/`
            urls.push(`
  <url>
    <loc>https://listasdaqui.com.br${path}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`)
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400'
        }
    })
}
