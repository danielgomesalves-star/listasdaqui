import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { manualSchema } from '@/features/seo/seo.schema'
import { salvarConteudoManual } from '@/features/seo/seo.service'

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const body = manualSchema.parse(await req.json())
        const conteudo = await salvarConteudoManual(body)

        await auditarAcao(admin.id, 'seo.edicao_manual', { servicoId: body.servicoId, cidadeId: body.cidadeId }, req)

        return NextResponse.json({ success: true, data: conteudo })
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao salvar conteúdo: ' + String(error) }, { status: 500 })
    }
}
