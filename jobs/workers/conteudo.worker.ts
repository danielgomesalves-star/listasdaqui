import { Worker } from 'bullmq'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { gerarConteudoIA } from '@/lib/ai/conteudo'

new Worker(
  'conteudo',
  async (job) => {
    try {
      await gerarConteudoIA(job.data)
    } catch (error) {
      logger.error({ event: 'worker.conteudo.error', jobId: job.id, error: String(error) })
      throw error // Re-throw to trigger BullMQ retry
    }
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
