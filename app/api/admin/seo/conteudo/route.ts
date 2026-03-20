import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('pagina') || '1')
        const limit = parseInt(searchParams.get('porPagina') || '50')
        const skip = (page - 1) * limit
        const filter = searchParams.get('status') || 'todos'

        // We fetch all Cidades and Servicos (Cross Join in memory for MVP simulation)
        // Realistically, you would map generated Conteudos and left join, but since we are generating combos:
        const cidades = await prisma.cidade.findMany({ where: { ativo: true } })
        const servicos = await prisma.servico.findMany({ where: { ativo: true } })
        const conteudosGerados = await prisma.conteudo.findMany({
            select: { id: true, servicoId: true, cidadeId: true, titulo: true, geradoEm: true }
        })

        const geradosMap = new Map(conteudosGerados.map(c => [`${c.servicoId}:${c.cidadeId}`, c]))

        let allCombos = []

        for (const c of cidades) {
            for (const s of servicos) {
                const idCombo = `${s.id}:${c.id}`
                const conteudo = geradosMap.get(idCombo)

                let status = 'faltando'
                if (conteudo) status = 'gerado'

                if (filter === 'todos' || filter === status) {
                    allCombos.push({
                        servicoId: s.id,
                        cidadeId: c.id,
                        servicoNome: s.nome,
                        cidadeNome: c.nome,
                        uf: c.uf,
                        status,
                        ...conteudo
                    })
                }
            }
        }

        // Sort by status putting missing first
        allCombos.sort((a, b) => a.status === 'faltando' ? -1 : 1)

        const total = allCombos.length
        const paginated = allCombos.slice(skip, skip + limit)

        return NextResponse.json({
            itens: paginated,
            total,
            pagina: page,
            totalPaginas: Math.ceil(total / limit),
            stats: {
                totalGeradas: conteudosGerados.length,
                totalFaltando: (cidades.length * servicos.length) - conteudosGerados.length
            }
        })
    } catch (error) {
        console.error('Erro na SEO api:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
