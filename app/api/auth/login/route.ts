import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/features/auth/auth.schema'
import { login } from '@/features/auth/auth.service'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        const limit = await rateLimit(ip, 'login', 10, 60 * 15)

        if (!limit.success) {
            logger.warn({ event: 'auth.login.ratelimit', ip })
            return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, { status: 429 })
        }

        const body = await req.json()
        const parsed = loginSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { email, senha } = parsed.data
        const { user, accessToken, refreshToken } = await login(email, senha)

        logger.info({ event: 'auth.login.success', userId: user.id, ip, email: user.email })

        // Return the tokens
        return NextResponse.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                prestadorId: user.prestador?.id || null
            }
        }, { status: 200 })

    } catch (error: any) {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        if (error.message === 'Credenciais inválidas') {
            logger.warn({ event: 'auth.login.falhamento', ip })
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        logger.error({ event: 'auth.login.error', error: String(error) })
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
}
