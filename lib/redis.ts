import { Redis } from 'ioredis'
import { env } from '@/config/env'

const globalForRedis = global as unknown as { redis: Redis }

export const redis =
    globalForRedis.redis || new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis
