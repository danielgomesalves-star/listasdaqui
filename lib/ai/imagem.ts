import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { getConfiguracao } from '@/features/configuracoes/configuracoes.service'
import path from 'path'
import fs from 'fs/promises'

async function getOpenAIClient() {
    const dbKey = await getConfiguracao('OPENAI_API_KEY')
    return new OpenAI({ apiKey: dbKey || process.env.OPENAI_API_KEY })
}

import { buildOgUrl } from '@/lib/og-url'

/** Geração via /api/og — gratuita, sem banco, URL determinística */
export async function gerarImagemOG(params: { servicoId: string; cidadeId: string }) {
    const { servicoId, cidadeId } = params

    const [servico, cidade] = await Promise.all([
        prisma.servico.findUnique({ where: { id: servicoId }, select: { nome: true, slug: true } }),
        prisma.cidade.findUnique({ where: { id: cidadeId }, select: { nome: true, uf: true, slug: true } }),
    ])

    if (!servico || !cidade) throw new Error('Serviço ou cidade não encontrado')

    return {
        imagemUrl: buildOgUrl(servico.nome, servico.slug, cidade.nome, cidade.uf),
        fonte: 'og' as const,
    }
}

/** Geração via DALL-E 3 — requer crédito OpenAI, salva arquivo no servidor */
export async function gerarImagemIA(params: { servicoId: string; cidadeId: string }) {
    const { servicoId, cidadeId } = params

    const [servico, cidade] = await Promise.all([
        prisma.servico.findUnique({ where: { id: servicoId }, select: { nome: true, slug: true } }),
        prisma.cidade.findUnique({ where: { id: cidadeId }, select: { nome: true, uf: true, slug: true } }),
    ])

    if (!servico || !cidade) throw new Error('Serviço ou cidade não encontrado')

    try {
        const client = await getOpenAIClient()

        const prompt = [
            `Professional ${servico.nome} service worker in ${cidade.nome}, ${cidade.uf}, Brazil.`,
            'Clean, modern, realistic photo style.',
            'Bright natural lighting, urban Brazilian setting.',
            'No text overlays, no watermarks, no logos.',
        ].join(' ')

        const response = await client.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1792x1024',
            quality: 'standard',
            response_format: 'url',
        })

        const tempUrl = response.data?.[0]?.url
        if (!tempUrl) throw new Error('DALL-E não retornou URL')

        const imagemRes = await fetch(tempUrl)
        if (!imagemRes.ok) throw new Error('Falha ao baixar imagem do DALL-E')
        const buffer = Buffer.from(await imagemRes.arrayBuffer())

        const pasta = path.join(process.cwd(), 'public', 'imagens')
        await fs.mkdir(pasta, { recursive: true })
        const nomeArquivo = `${servico.slug}-${cidade.slug}.png`
        await fs.writeFile(path.join(pasta, nomeArquivo), buffer)

        const imagemUrl = `/imagens/${nomeArquivo}`
        return { imagemUrl, fonte: 'dalle' as const }

    } catch (err: any) {
        const isBilling = err?.status === 400 || String(err?.message).includes('Billing') || String(err?.message).includes('billing')
        if (isBilling) {
            return {
                imagemUrl: buildOgUrl(servico.nome, servico.slug, cidade.nome, cidade.uf),
                fonte: 'og' as const,
                aviso: 'Limite de cobrança OpenAI atingido. Usando capa local (gratuita).',
            }
        }
        throw err
    }
}
