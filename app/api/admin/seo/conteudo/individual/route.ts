import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { individualSchema } from '@/features/seo/seo.schema'
import { gerarConteudoIndividual } from '@/features/seo/seo.service'

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { servicoId, cidadeId } = individualSchema.parse(await req.json())
        const result = await gerarConteudoIndividual(servicoId, cidadeId)

        await auditarAcao(admin.id, 'seo.geracao_individual', { servicoId, cidadeId }, req)

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar conteúdo: ' + String(error) }, { status: 500 })
    }
}
