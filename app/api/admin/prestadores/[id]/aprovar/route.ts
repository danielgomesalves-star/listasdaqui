import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const prestador = await prisma.prestador.update({
            where: { id: params.id },
            data: { aprovado: true }
        })

        await auditarAcao(admin.id, 'prestador.aprovado', { prestadorId: params.id }, req)

        return NextResponse.json({ success: true, prestador })
    } catch (error) {
        console.error('Erro ao aprovar prestador:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
