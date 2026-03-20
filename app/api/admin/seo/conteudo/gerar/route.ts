import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { gerarConteudosSimulado } from '@/features/seo/seo.service'

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { modo } = await req.json()
        const result = await gerarConteudosSimulado()

        if (modo === 'simular' && result.message.startsWith('Simulada')) {
            await auditarAcao(admin.id, 'seo.geracao_simulada', {}, req)
        }

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
