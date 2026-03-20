import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { adminLoginSchema } from '@/features/admin-auth/admin-auth.schema'
import { loginAdmin } from '@/features/admin-auth/admin-auth.service'

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        const limit = await rateLimit(ip, 'admin_login', 5, 15 * 60)

        if (!limit.success) {
            logger.warn({ event: 'admin.auth.ratelimit', ip })
            return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, { status: 429 })
        }

        const { email, senha } = adminLoginSchema.parse(await req.json())
        const result = await loginAdmin(email, senha, ip)

        return NextResponse.json({ success: true, ...result })
    } catch (error) {
        logger.error({ event: 'admin.auth.error', error: String(error) })
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
}
