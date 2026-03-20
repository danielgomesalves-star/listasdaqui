import { prisma } from '@/lib/prisma'
import { gerarConteudoIA } from '@/lib/ai/conteudo'
import { z } from 'zod'
import { manualSchema } from './seo.schema'

export async function listarConteudos(params: {
    page: number
    limit: number
    filter: string
}) {
    const { page, limit, filter } = params
    const skip = (page - 1) * limit

    const cidades = await prisma.cidade.findMany({ where: { ativo: true } })
    const servicos = await prisma.servico.findMany({ where: { ativo: true } })
    const conteudosGerados = await prisma.conteudo.findMany({
        select: { id: true, servicoId: true, cidadeId: true, titulo: true, geradoEm: true }
    })

    const geradosMap = new Map(conteudosGerados.map(c => [`${c.servicoId}:${c.cidadeId}`, c]))

    const allCombos: any[] = []

    for (const c of cidades) {
        for (const s of servicos) {
            const idCombo = `${s.id}:${c.id}`
            const conteudo = geradosMap.get(idCombo)
            const status = conteudo ? 'gerado' : 'faltando'

            if (filter === 'todos' || filter === status) {
                allCombos.push({
                    servicoId: s.id,
                    cidadeId: c.id,
                    servicoNome: s.nome,
                    cidadeNome: c.nome,
                    uf: c.uf,
                    status,
                    ...conteudo
                })
            }
        }
    }

    allCombos.sort((a, b) => a.status === 'faltando' ? -1 : 1)

    const total = allCombos.length
    const paginated = allCombos.slice(skip, skip + limit)

    return {
        itens: paginated,
        total,
        pagina: page,
        totalPaginas: Math.ceil(total / limit),
        stats: {
            totalGeradas: conteudosGerados.length,
            totalFaltando: (cidades.length * servicos.length) - conteudosGerados.length
        }
    }
}

export async function gerarConteudosSimulado() {
    const cidades = await prisma.cidade.findMany({ where: { ativo: true } })
    const servicos = await prisma.servico.findMany({ where: { ativo: true } })
    const conteudosGerados = await prisma.conteudo.findMany({
        select: { servicoId: true, cidadeId: true }
    })

    const geradosSet = new Set(conteudosGerados.map(c => `${c.servicoId}:${c.cidadeId}`))
    const missingCombos: any[] = []

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

    if (missingCombos.length === 0) {
        return { message: 'Nenhuma página faltando ou modo inválido.' }
    }

    const lote = missingCombos.slice(0, 50)
    await prisma.conteudo.createMany({ data: lote })

    return { message: `Simulada criação de ${lote.length} páginas de SEO.` }
}

export async function salvarConteudoManual(data: z.infer<typeof manualSchema>) {
    const { servicoId, cidadeId, titulo, descricao, precoMin, precoMax, faq } = data

    return prisma.conteudo.upsert({
        where: { servicoId_cidadeId: { servicoId, cidadeId } },
        create: { servicoId, cidadeId, titulo, descricao, precoMin, precoMax, faqJson: faq },
        update: { titulo, descricao, precoMin, precoMax, faqJson: faq, atualizadoEm: new Date() }
    })
}

export async function gerarConteudoIndividual(servicoId: string, cidadeId: string) {
    const servico = await prisma.servico.findUnique({ where: { id: servicoId } })
    const cidade = await prisma.cidade.findUnique({ where: { id: cidadeId } })

    if (!servico || !cidade) {
        throw new Error('Serviço ou Cidade não encontrado')
    }

    return gerarConteudoIA({
        servicoId,
        cidadeId,
        servicoNome: servico.nome,
        cidadeNome: cidade.nome,
        cidadeUF: cidade.uf
    })
}
