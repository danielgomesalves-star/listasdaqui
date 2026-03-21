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
        select: {
            id: true,
            servicoId: true,
            cidadeId: true,
            titulo: true,
            introducao: true,
            corpoTexto: true,
            precoMin: true,
            precoMax: true,
            beneficiosJson: true,
            dicasJson: true,
            faqJson: true,
            geradoEm: true
        }
    })

    const geradosMap = new Map(conteudosGerados.map((c: any) => [`${c.servicoId}:${c.cidadeId}`, c]))

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
                    servicoSlug: s.slug,
                    cidadeNome: c.nome,
                    cidadeSlug: c.slug,
                    uf: c.uf,
                    status,
                    ...conteudo as any
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

export async function gerarConteudosLoteIA() {
    const cidades = await prisma.cidade.findMany({ where: { ativo: true } })
    const servicos = await prisma.servico.findMany({ where: { ativo: true } })
    const conteudosGerados = await prisma.conteudo.findMany({
        select: { servicoId: true, cidadeId: true }
    })

    const geradosSet = new Set(conteudosGerados.map(c => `${c.servicoId}:${c.cidadeId}`))
    const missing: { servicoId: string; cidadeId: string; servicoNome: string; cidadeNome: string; uf: string }[] = []

    for (const c of cidades) {
        for (const s of servicos) {
            if (!geradosSet.has(`${s.id}:${c.id}`)) {
                missing.push({
                    servicoId: s.id,
                    cidadeId: c.id,
                    servicoNome: s.nome,
                    cidadeNome: c.nome,
                    uf: c.uf
                })
            }
        }
    }

    if (missing.length === 0) {
        return { message: 'Todas as páginas já possuem conteúdo!' }
    }

    // Processa um pequeno lote (ex: 5 por vez para não estourar rate-limits ou timeout)
    const lote = missing.slice(0, 5)

    const promessas = lote.map(item =>
        gerarConteudoIA({
            servicoId: item.servicoId,
            cidadeId: item.cidadeId,
            servicoNome: item.servicoNome,
            cidadeNome: item.cidadeNome,
            cidadeUF: item.uf
        }).catch(err => {
            console.error(`Erro no lote para ${item.servicoNome}/${item.cidadeNome}:`, err)
            return null
        })
    )

    await Promise.all(promessas)

    return {
        message: `Geração em lote finalizada. ${lote.length} páginas processadas via IA.`,
        success: true
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
                    introducao: `Buscando por ${s.nome} em ${c.nome}? Nossa lista reúne os prestadores mais bem avaliados para garantir agilidade e confiança no seu atendimento.`,
                    corpoTexto: `Se você está em ${c.nome} e precisa de ${s.nome}, chegou ao lugar certo. O ListasDaqui seleciona profissionais locais comprometidos com prazos e qualidade, facilitando sua busca e garantindo o melhor custo-benefício.`,
                    precoMin: 50,
                    precoMax: 300,
                    faqJson: [
                        {
                            pergunta: `Como escolher um bom ${s.nome} em ${c.nome}?`,
                            resposta: `Verifique sempre as avaliações no ListasDaqui, a experiência e certifique-se de perguntar o orçamento antecipadamente com fotos ou vídeos.`
                        }
                    ]
                })
            }
        }
    }

    if (missingCombos.length === 0) {
        return { message: 'Nenhuma página faltando ou modo inválido.' }
    }

    const lote = missingCombos.slice(0, 50)
    await prisma.conteudo.createMany({ data: lote })

    return { message: `Simulada criação de ${lote.length} páginas de SEO rápidas (sem IA).` }
}

export async function salvarConteudoManual(data: z.infer<typeof manualSchema>) {
    const { servicoId, cidadeId, titulo, introducao, corpoTexto, precoMin, precoMax, faq, beneficios, dicas } = data

    return prisma.conteudo.upsert({
        where: { servicoId_cidadeId: { servicoId, cidadeId } },
        create: {
            servicoId,
            cidadeId,
            titulo: titulo || '',
            introducao,
            corpoTexto,
            precoMin,
            precoMax,
            faqJson: faq,
            beneficiosJson: beneficios,
            dicasJson: dicas
        },
        update: {
            titulo,
            introducao,
            corpoTexto,
            precoMin,
            precoMax,
            faqJson: faq,
            beneficiosJson: beneficios,
            dicasJson: dicas,
            atualizadoEm: new Date()
        }
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
