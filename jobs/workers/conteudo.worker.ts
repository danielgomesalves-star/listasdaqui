import { Worker } from 'bullmq'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { env } from '@/config/env'

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

new Worker(
  'conteudo',
  async (job) => {
    const { servicoId, cidadeId, servicoNome, cidadeNome, cidadeUF } = job.data
    logger.info({ event: 'conteudo.start', jobId: job.id, servicoNome, cidadeNome })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
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
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const data = JSON.parse(text.replace(/```json|```/g, '').trim())

    await prisma.conteudo.upsert({
      where: { servicoId_cidadeId: { servicoId, cidadeId } },
      create: { servicoId, cidadeId, ...data, faqJson: data.faq },
      update: { ...data, faqJson: data.faq, atualizadoEm: new Date() },
    })

    logger.info({ event: 'conteudo.done', jobId: job.id })
  },
  {
    connection: redis,
    concurrency: 3,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  }
)
