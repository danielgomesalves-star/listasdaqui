import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getConfiguracao } from '@/features/configuracoes/configuracoes.service'

async function getAnthropicClient() {
    const dbKey = await getConfiguracao('ANTHROPIC_API_KEY')
    const apiKey = dbKey || env.ANTHROPIC_API_KEY
    return new Anthropic({ apiKey })
}

export async function gerarConteudoIA(params: {
    servicoId: string;
    cidadeId: string;
    servicoNome: string;
    cidadeNome: string;
    cidadeUF: string;
}) {
    const { servicoId, cidadeId, servicoNome, cidadeNome, cidadeUF } = params;

    logger.info({ event: 'ai.conteudo.gerar.init', servicoNome, cidadeNome });

    const response = await (await getAnthropicClient()).messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2048,
        messages: [
            {
                role: 'user',
                content: `Você é um Especialista em SEO Local e Copywriter de Conversão. Sua tarefa é criar um conteúdo editorial de altíssima qualidade para uma página de diretório de serviços.

Serviço: ${servicoNome}
Cidade: ${cidadeNome}, ${cidadeUF}

### DIRETRIZES DE CONTEÚDO:
1. **Tom de Voz**: Profissional, autoritativo e prestativo. Evite adjetivos genéricos como "incrível" ou "o melhor". Seja específico.
2. **AI SEO (AEO/GEO)**: Escreva para ser citado por IAs. Use blocos de informação auto-contidos.
3. **Clareza > Criatividade**: Use linguagem direta. Benefícios reais sobre promessas vagas.

### REQUISITOS DO JSON:
- **introducao**: Um parágrafo de 40 a 60 palavras que define claramente o serviço na cidade. Ideal para ser extraído como snippet (Featured Snippet).
- **corpoTexto**: Texto editorial longo (400-700 chars) com informações úteis sobre o mercado de ${servicoNome} em ${cidadeNome}. Mencione fatores locais se possível. Divida em blocos lógicos.
- **beneficios**: Uma lista de 3 a 5 benefícios concretos de contratar profissionais locais desta categoria.
- **dicas**: Uma lista de 3 a 4 dicas de especialista para o cliente escolher o melhor prestador ou economizar no serviço. Cada dica deve ter um "titulo" curto e uma "descricao" explicativa.
- **faq**: 4 a 5 perguntas frequentes com respostas diretas e precisas.

Retorne APENAS JSON válido:
{
  "titulo": "string (SEO Title otimizado)",
  "introducao": "string",
  "corpoTexto": "string",
  "precoMin": number,
  "precoMax": number,
  "beneficios": ["string", "string"],
  "dicas": [ { "titulo": "string", "descricao": "string" } ],
  "faq": [ { "pergunta": "string", "resposta": "string" } ]
}`,
            },
        ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleanText = text.replace(/```json|```/g, '').trim();

    try {
        const data = JSON.parse(cleanText);

        const conteudo = await prisma.conteudo.upsert({
            where: { servicoId_cidadeId: { servicoId, cidadeId } },
            create: {
                servicoId,
                cidadeId,
                titulo: data.titulo,
                introducao: data.introducao,
                corpoTexto: data.corpoTexto,
                precoMin: data.precoMin,
                precoMax: data.precoMax,
                beneficiosJson: data.beneficios,
                dicasJson: data.dicas,
                faqJson: data.faq
            },
            update: {
                titulo: data.titulo,
                introducao: data.introducao,
                corpoTexto: data.corpoTexto,
                precoMin: data.precoMin,
                precoMax: data.precoMax,
                beneficiosJson: data.beneficios,
                dicasJson: data.dicas,
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
