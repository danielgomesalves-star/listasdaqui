import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getConfiguracao } from '@/features/configuracoes/configuracoes.service'

const PROMPT_BASE = (servico: string, cidade: string, uf: string) => `
Você é um Especialista em SEO Local e Copywriter de Conversão. Sua tarefa é criar um conteúdo editorial de altíssima qualidade para uma página de diretório de serviços.

Serviço: ${servico}
Cidade: ${cidade}, ${uf}

### DIRETRIZES DE CONTEÚDO:
1. **Tom de Voz**: Profissional, autoritativo e prestativo. Evite adjetivos genéricos como "incrível" ou "o melhor". Seja específico.
2. **AI SEO (AEO/GEO)**: Escreva para ser citado por IAs. Use blocos de informação auto-contidos.
3. **Clareza > Criatividade**: Use linguagem direta. Benefícios reais sobre promessas vagas.

### REQUISITOS DO JSON:
- **introducao**: Um parágrafo de 40 a 60 palavras que define claramente o serviço na cidade. Ideal para ser extraído como snippet (Featured Snippet).
- **corpoTexto**: Texto editorial longo (400-700 chars) com informações úteis sobre o mercado de ${servico} em ${cidade}. Mencione fatores locais se possível. Divida em blocos lógicos.
- **beneficios**: Uma lista de 3 a 5 benefícios concretos de contratar profissionais locais desta categoria.
- **dicas**: Uma lista de 3 a 4 dicas de especialista para o cliente escolher o melhor prestador ou economizar no serviço. Cada dica deve ter um "titulo" curto e uma "descricao" explicativa.
- **faq**: 4 a 5 perguntas frequentes com respostas diretas e precisas.

Retorne APENAS JSON válido no formato abaixo:
{
  "titulo": "string (SEO Title otimizado)",
  "introducao": "string",
  "corpoTexto": "string",
  "precoMin": number,
  "precoMax": number,
  "beneficios": ["string", "string"],
  "dicas": [ { "titulo": "string", "descricao": "string" } ],
  "faq": [ { "pergunta": "string", "resposta": "string" } ]
}`;

async function getProvider() {
    const provider = await getConfiguracao('AI_PROVIDER')
    return provider || 'anthropic'
}

async function chamarAnthropic(prompt: string) {
    const dbKey = await getConfiguracao('ANTHROPIC_API_KEY')
    const client = new Anthropic({ apiKey: dbKey || env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    // Extrai o bloco JSON mesmo que venha com markdown
    const match = text.match(/\{[\s\S]*\}/)
    return match ? match[0] : text.replace(/```json|```/g, '').trim()
}

async function chamarOpenAI(prompt: string) {
    const dbKey = await getConfiguracao('OPENAI_API_KEY')
    const client = new OpenAI({ apiKey: dbKey || process.env.OPENAI_API_KEY })

    const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
    })

    return response.choices[0].message.content || ''
}

const PROMPT_OTIMIZAR = (conteudoAtual: object, termos: string) => `
Você é um Especialista em SEO Local. Receberá um conteúdo existente e novos termos de pesquisa.
Sua tarefa é otimizar o conteúdo incorporando os novos termos de forma natural, sem alterar o tom ou estrutura.

### TERMOS DE PESQUISA A INCORPORAR:
${termos}

### CONTEÚDO ATUAL (JSON):
${JSON.stringify(conteudoAtual, null, 2)}

### INSTRUÇÕES:
- Mantenha todos os campos existentes
- Incorpore os termos de pesquisa naturalmente no titulo, introducao, corpoTexto e faq
- Não force os termos — integre-os onde fizerem sentido semântico
- Não reduza o tamanho do texto
- Adicione 1-2 perguntas no FAQ que cubram os novos termos, se relevante
- precoMin e precoMax devem permanecer iguais

Retorne APENAS JSON válido no mesmo formato do conteúdo atual.`;

export async function otimizarConteudoIA(params: {
    servicoId: string;
    cidadeId: string;
    termos: string;
}) {
    const { servicoId, cidadeId, termos } = params;

    const conteudo = await prisma.conteudo.findUnique({
        where: { servicoId_cidadeId: { servicoId, cidadeId } }
    });

    if (!conteudo) throw new Error('Conteúdo não encontrado. Gere o conteúdo base primeiro.');

    const conteudoAtual = {
        titulo: conteudo.titulo,
        introducao: conteudo.introducao,
        corpoTexto: conteudo.corpoTexto,
        precoMin: conteudo.precoMin,
        precoMax: conteudo.precoMax,
        beneficios: conteudo.beneficiosJson,
        dicas: conteudo.dicasJson,
        faq: conteudo.faqJson
    };

    const provider = await getProvider();
    const prompt = PROMPT_OTIMIZAR(conteudoAtual, termos);

    let cleanText = '';
    if (provider === 'openai') {
        cleanText = await chamarOpenAI(prompt);
    } else {
        cleanText = await chamarAnthropic(prompt);
    }

    if (!cleanText) throw new Error('Resposta da IA veio vazia');

    const data = JSON.parse(cleanText);

    return prisma.conteudo.update({
        where: { servicoId_cidadeId: { servicoId, cidadeId } },
        data: {
            titulo: data.titulo,
            introducao: data.introducao,
            corpoTexto: data.corpoTexto,
            beneficiosJson: data.beneficios,
            dicasJson: data.dicas,
            faqJson: data.faq,
            atualizadoEm: new Date()
        }
    });
}

export async function gerarConteudoIA(params: {
    servicoId: string;
    cidadeId: string;
    servicoNome: string;
    cidadeNome: string;
    cidadeUF: string;
}) {
    const { servicoId, cidadeId, servicoNome, cidadeNome, cidadeUF } = params;

    const provider = await getProvider();
    logger.info({ event: 'ai.conteudo.gerar.start', provider, servicoNome, cidadeNome });

    const prompt = PROMPT_BASE(servicoNome, cidadeNome, cidadeUF);

    let cleanText = '';
    try {
        if (provider === 'openai') {
            logger.info({ event: 'ai.conteudo.call_openai.init' });
            cleanText = await chamarOpenAI(prompt);
            logger.info({ event: 'ai.conteudo.call_openai.success' });
        } else {
            logger.info({ event: 'ai.conteudo.call_anthropic.init' });
            cleanText = await chamarAnthropic(prompt);
            logger.info({ event: 'ai.conteudo.call_anthropic.success' });
        }

        if (!cleanText) {
            throw new Error('Resposta da IA veio vazia');
        }

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

        logger.info({ event: 'ai.conteudo.gerar.db_saved', servicoNome, cidadeNome });
        return { success: true, data: conteudo };
    } catch (error) {
        logger.error({
            event: 'ai.conteudo.gerar.failed',
            provider,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
}
