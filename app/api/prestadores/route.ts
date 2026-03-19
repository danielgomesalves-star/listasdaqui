import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const pagina = Number(searchParams.get('pagina') ?? 1)
    const porPagina = 20

    const servicoSlug = searchParams.get('servico')
    const cidadeSlugRaw = searchParams.get('cidade')

    if (!servicoSlug || !cidadeSlugRaw) {
        return NextResponse.json({ error: 'Parâmetros cidade e servico são obrigatórios' }, { status: 400 })
    }

    // cidadeSlugRaw from frontend comes as "brasilia-df"
    // Needs to fetch matching cidade by slug
    const fragments = cidadeSlugRaw.split('-')
    const ufRaw = fragments.pop()
    const slug = fragments.join('-')

    const where = {
        servico: { slug: servicoSlug },
        cidade: { slug: slug },
        ativo: true,
        aprovado: true,
    }

    try {
        const [prestadores, total] = await Promise.all([
            prisma.prestador.findMany({
                where,
                orderBy: [{ plano: 'desc' }, { createdAt: 'asc' }],
                skip: (pagina - 1) * porPagina,
                take: porPagina,
                include: { servico: true, cidade: true, avaliacoes: { select: { nota: true } } }
            }),
            prisma.prestador.count({ where })
        ])

        return NextResponse.json({ prestadores, total, pagina })
    } catch (err) {
        return NextResponse.json({ error: 'Erro ao listar prestadores' }, { status: 500 })
    }
}
