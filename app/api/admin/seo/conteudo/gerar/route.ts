import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { gerarConteudosSimulado, gerarConteudosLoteIA } from '@/features/seo/seo.service'

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { modo } = await req.json()
        let result;

        if (modo === 'ia') {
            result = await gerarConteudosLoteIA()
            await auditarAcao(admin.id, 'seo.geracao_ia_lote', {}, req)
        } else {
            result = await gerarConteudosSimulado()
            await auditarAcao(admin.id, 'seo.geracao_simulada', {}, req)
        }

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
