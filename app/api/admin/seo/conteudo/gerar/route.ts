import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { modo } = await req.json()

        // Simplificando o "enfileiramento" para criação estática local imediata
        let missingCombos: any[] = []

        const cidades = await prisma.cidade.findMany({ where: { ativo: true } })
        const servicos = await prisma.servico.findMany({ where: { ativo: true } })
        const conteudosGerados = await prisma.conteudo.findMany({
            select: { servicoId: true, cidadeId: true }
        })

        const geradosSet = new Set(conteudosGerados.map(c => `${c.servicoId}:${c.cidadeId}`))

        for (const c of cidades) {
            for (const s of servicos) {
                if (!geradosSet.has(`${s.id}:${c.id}`)) {
                    missingCombos.push({
                        servicoId: s.id,
                        cidadeId: c.id,
                        titulo: `${s.nome} em ${c.nome} — Qualidade Garantida`,
                        descricao: `Encontre os melhores serviços de ${s.nome} em ${c.nome}, ${c.uf}. Profissionais avaliados e com garantia de qualidade na sua região. Peça orçamentos pelo WhatsApp.`,
                        precoMin: 50,
                        precoMax: 300,
                        faqJson: JSON.stringify([
                            {
                                pergunta: `Como escolher um bom ${s.nome} em ${c.nome}?`,
                                resposta: `Verifique sempre as avaliações no ListasDaqui, a experiência e certifique-se de perguntar o orçamento antecipadamente com fotos ou vídeos.`
                            }
                        ])
                    })
                }
            }
        }

        if (modo === 'simular' && missingCombos.length > 0) {
            // Criar no máximo 50 de cada vez pro teste de UX não travar
            const lote = missingCombos.slice(0, 50)

            await prisma.conteudo.createMany({
                data: lote
            })

            await auditarAcao(admin.id, 'seo.geracao_simulada', { qtde: lote.length }, req)
            return NextResponse.json({ message: `Simulada criação de ${lote.length} páginas de SEO.` })
        }

        return NextResponse.json({ message: 'Nenhuma página faltando ou modo inválido.' })
    } catch (error) {
        console.error('Erro na SEO geracao api:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
