import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ motivo: z.string().min(3) })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { motivo } = schema.parse(await req.json())

        await prisma.$transaction([
            prisma.bloqueio.create({
                data: { tipo: 'FICHA', alvoId: params.id, motivo, adminId: admin.id }
            }),
            prisma.prestador.update({
                where: { id: params.id },
                data: { ativo: false }
            })
        ])

        await auditarAcao(admin.id, 'prestador.ficha_bloqueada', { prestadorId: params.id, motivo }, req)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erro ao bloquear prestador:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
