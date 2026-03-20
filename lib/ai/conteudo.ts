import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export async function gerarConteudoIA(params: {
    servicoId: string;
    cidadeId: string;
    servicoNome: string;
    cidadeNome: string;
    cidadeUF: string;
}) {
    const { servicoId, cidadeId, servicoNome, cidadeNome, cidadeUF } = params;

    logger.info({ event: 'ai.conteudo.gerar.init', servicoNome, cidadeNome });

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620', // Versão atualizada do modelo
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: `Crie conteúdo editorial para página de diretório de prestadores de serviço.
Serviço: ${servicoNome}
Cidade: ${cidadeNome}, ${cidadeUF}

Retorne APENAS JSON válido sem markdown:
{
  "titulo": "string (máx 160 chars)",
  "descricao": "string (200-400 chars, único, menciona a cidade)",
  "precoMin": number,
  "precoMax": number,
  "faq": [
    { "pergunta": "string", "resposta": "string (máx 200 chars)" },
    { "pergunta": "string", "resposta": "string (máx 200 chars)" },
    { "pergunta": "string", "resposta": "string (máx 200 chars)" }
  ]
}`,
            },
        ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleanText = text.replace(/```json|```/g, '').trim();

    try {
        const data = JSON.parse(cleanText);

        // Persiste no banco de dados automaticamente
        const conteudo = await prisma.conteudo.upsert({
            where: { servicoId_cidadeId: { servicoId, cidadeId } },
            create: {
                servicoId,
                cidadeId,
                titulo: data.titulo,
                descricao: data.descricao,
                precoMin: data.precoMin,
                precoMax: data.precoMax,
                faqJson: data.faq
            },
            update: {
                titulo: data.titulo,
                descricao: data.descricao,
                precoMin: data.precoMin,
                precoMax: data.precoMax,
                faqJson: data.faq,
                atualizadoEm: new Date()
            },
        });

        logger.info({ event: 'ai.conteudo.gerar.success', servicoNome, cidadeNome });
        return { success: true, data: conteudo };
    } catch (error) {
        logger.error({ event: 'ai.conteudo.gerar.error', error: String(error), raw: cleanText });
        throw new Error('Falha ao processar resposta da IA: ' + String(error));
    }
}
