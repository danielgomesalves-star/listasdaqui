import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { servicoId, cidadeId, titulo, descricao, precoMin, precoMax, faq } = await req.json()

        if (!servicoId || !cidadeId) {
            return NextResponse.json({ error: 'IDs de serviço e cidade são obrigatórios' }, { status: 400 })
        }

        const conteudo = await prisma.conteudo.upsert({
            where: { servicoId_cidadeId: { servicoId, cidadeId } },
            create: {
                servicoId,
                cidadeId,
                titulo,
                descricao,
                precoMin,
                precoMax,
                faqJson: faq
            },
            update: {
                titulo,
                descricao,
                precoMin,
                precoMax,
                faqJson: faq,
                atualizadoEm: new Date()
            }
        })

        await auditarAcao(admin.id, 'seo.edicao_manual', { servicoId, cidadeId }, req)

        return NextResponse.json({ success: true, data: conteudo })
    } catch (error) {
        console.error('Erro na edição manual SEO:', error)
        return NextResponse.json({ error: 'Erro ao salvar conteúdo: ' + String(error) }, { status: 500 })
    }
}
