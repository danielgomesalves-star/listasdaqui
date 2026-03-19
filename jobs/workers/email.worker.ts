import { Worker } from 'bullmq'
import { redis } from '@/lib/redis'
import { sendEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

new Worker(
  'email',
  async (job) => {
    logger.info({ event: 'email.worker.start', jobId: job.id, name: job.name })
    const { to, subject, html } = job.data
    await sendEmail({ to, subject, html })
    logger.info({ event: 'email.worker.done', jobId: job.id })
  },
  {
    connection: redis,
    concurrency: 5,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    },
  }
)
