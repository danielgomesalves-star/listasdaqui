import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { signAdminToken } from '@/lib/auth-admin'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    senha: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        const limit = await rateLimit(ip, 'admin_login', 5, 15 * 60)

        if (!limit.success) {
            logger.warn({ event: 'admin.auth.ratelimit', ip })
            return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, { status: 429 })
        }

        const { email, senha } = loginSchema.parse(await req.json())

        const admin = await prisma.adminUser.findUnique({ where: { email } })
        if (!admin || !admin.ativo) {
            return NextResponse.json({ error: 'Credenciais inválidas ou inativado' }, { status: 401 })
        }

        const isValid = await compare(senha, admin.passwordHash)
        if (!isValid) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
        }

        const token = await signAdminToken(admin.id)

        await prisma.adminUser.update({
            where: { id: admin.id },
            data: { ultimoAcesso: new Date() }
        })

        // Log the successful login silently
        await prisma.auditLog.create({
            data: {
                evento: 'admin.login',
                userId: admin.id,
                ip
            }
        })

        logger.info({ event: 'admin.auth.success', adminId: admin.id, ip, email: admin.email })

        return NextResponse.json({ success: true, token, admin: { nome: admin.nome, email: admin.email } })
    } catch (error) {
        logger.error({ event: 'admin.auth.error', error: String(error) })
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
}
