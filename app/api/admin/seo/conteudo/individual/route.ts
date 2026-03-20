import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'
import { gerarConteudoIA } from '@/lib/ai/conteudo'

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { servicoId, cidadeId } = await req.json()

        if (!servicoId || !cidadeId) {
            return NextResponse.json({ error: 'IDs de serviço e cidade são obrigatórios' }, { status: 400 })
        }

        const servico = await prisma.servico.findUnique({ where: { id: servicoId } })
        const cidade = await prisma.cidade.findUnique({ where: { id: cidadeId } })

        if (!servico || !cidade) {
            return NextResponse.json({ error: 'Serviço ou Cidade não encontrado' }, { status: 404 })
        }

        const result = await gerarConteudoIA({
            servicoId,
            cidadeId,
            servicoNome: servico.nome,
            cidadeNome: cidade.nome,
            cidadeUF: cidade.uf
        })

        await auditarAcao(admin.id, 'seo.geracao_individual', { servico: servico.nome, cidade: cidade.nome }, req)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Erro na geração individual SEO:', error)
        return NextResponse.json({ error: 'Erro ao gerar conteúdo: ' + String(error) }, { status: 500 })
    }
}
