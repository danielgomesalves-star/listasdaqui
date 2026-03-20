import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { aprovarPrestador } from '@/features/prestadores-admin/prestadores-admin.service'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const prestador = await aprovarPrestador(params.id)
        await auditarAcao(admin.id, 'prestador.aprovado', { prestadorId: params.id }, req)
        return NextResponse.json({ success: true, prestador })
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
