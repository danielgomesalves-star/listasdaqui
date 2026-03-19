import { redis } from './redis'

/**
 * Super lightweight Rate Limiter using Redis INCR and EXPIRE.
 * Useful for Next.js App Router API Routes.
 */
export async function rateLimit(
    ip: string,
    action: string,
    limit: number = 10,
    windowSecs: number = 60
): Promise<{ success: boolean; remaining: number }> {

    if (!ip) ip = 'unknown'
    const key = `ratelimit:${action}:${ip}`

    // Fail open if Redis is not connected to prevent hanging the request
    if (redis.status !== 'ready') {
        return { success: true, remaining: 1 }
    }

    try {
        const current = await redis.incr(key)
        if (current === 1) {
            await redis.expire(key, windowSecs)
        }

        const success = current <= limit

        return {
            success,
            remaining: Math.max(0, limit - current)
        }
    } catch (error) {
        // Se o Redis falhar por algum motivo, falhamos aberto para não quebrar a auth
        return { success: true, remaining: 1 }
    }
}
