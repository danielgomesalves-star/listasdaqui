import { NextRequest, NextResponse } from 'next/server'
import { cadastroSchema } from '@/features/prestadores/prestadores.schema'
import { criarPrestador } from '@/features/prestadores/prestadores.service'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        const limit = await rateLimit(ip, 'cadastro', 3, 60 * 60)

        if (!limit.success) {
            logger.warn({ event: 'cadastro.ratelimit', ip })
            return NextResponse.json({ error: 'Muitos cadastros. Tente novamente em 1 hora.' }, { status: 429 })
        }

        const body = await req.json()
        const parsed = cadastroSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { user, prestador } = await criarPrestador(parsed.data)

        logger.info({ event: 'cadastro.success', userId: user.id, ip, email: user.email })

        // Return safely without exposing password hash
        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email },
            prestador: { id: prestador.id, slug: prestador.slug, nome: prestador.nome }
        }, { status: 201 })

    } catch (error: any) {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        if (error.message === 'E-mail já está em uso') {
            logger.warn({ event: 'cadastro.email_in_use', ip })
            return NextResponse.json({ error: error.message }, { status: 409 })
        }
        logger.error({ event: 'cadastro.error', error: String(error) })
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
}
