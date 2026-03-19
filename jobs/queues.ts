import { Queue } from 'bullmq'
import { redis } from '@/lib/redis'

const connection = redis as any

export const emailQueue = new Queue('email', { connection })
export const conteudoQueue = new Queue('conteudo', { connection })
export const planoQueue = new Queue('plano', { connection })
