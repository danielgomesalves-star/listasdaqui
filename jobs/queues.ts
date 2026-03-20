import { Queue } from 'bullmq'
import { redis } from '@/lib/redis'

const connection = redis as any
const isBuild = process.env.NEXT_ROOT_BUILD === '1'

export const emailQueue = isBuild ? ({} as any) : new Queue('email', { connection })
export const conteudoQueue = isBuild ? ({} as any) : new Queue('conteudo', { connection })
export const planoQueue = isBuild ? ({} as any) : new Queue('plano', { connection })
