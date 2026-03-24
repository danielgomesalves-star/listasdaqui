import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const [cidades, servicos] = await Promise.all([
            prisma.cidade.findMany({
                where: { ativo: true },
                select: { id: true, nome: true, uf: true },
                orderBy: { nome: 'asc' }
            }),
            prisma.servico.findMany({
                where: { ativo: true },
                select: { id: true, nome: true },
                orderBy: { nome: 'asc' }
            })
        ])

        return NextResponse.json({ cidades, servicos })
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
