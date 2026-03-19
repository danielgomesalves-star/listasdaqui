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

        // Simplistic Filtering
        const statusFiltro = searchParams.get('status')
        let whereClause: any = {}

        if (statusFiltro === 'pendentes') whereClause.aprovado = false
        else if (statusFiltro === 'bloqueados') whereClause.ativo = false
        else if (statusFiltro === 'ativos') whereClause = { ativo: true, aprovado: true }

        const [prestadores, total] = await Promise.all([
            prisma.prestador.findMany({
                where: whereClause,
                include: {
                    servico: { select: { nome: true } },
                    cidade: { select: { nome: true, uf: true } },
                    user: { select: { email: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.prestador.count({ where: whereClause })
        ])

        return NextResponse.json({
            prestadores,
            total,
            pagina: page,
            totalPaginas: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('Erro ao listar prestadores no admin:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
