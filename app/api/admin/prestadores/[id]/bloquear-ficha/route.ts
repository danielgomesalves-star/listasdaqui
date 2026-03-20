import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { bloquearFichaSchema } from '@/features/prestadores-admin/prestadores-admin.schema'
import { bloquearFichaPrestador } from '@/features/prestadores-admin/prestadores-admin.service'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { motivo } = bloquearFichaSchema.parse(await req.json())
        await bloquearFichaPrestador({ prestadorId: params.id, adminId: admin.id, motivo })
        await auditarAcao(admin.id, 'prestador.ficha_bloqueada', { prestadorId: params.id, motivo }, req)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
