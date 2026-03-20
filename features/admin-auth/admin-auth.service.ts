import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAdminToken } from '@/lib/auth-admin'
import { logger } from '@/lib/logger'

export async function loginAdmin(email: string, senha: string, ip: string) {
    const admin = await prisma.adminUser.findUnique({ where: { email } })

    if (!admin || !admin.ativo) {
        throw new Error('Credenciais inválidas ou inativado')
    }

    const isValid = await compare(senha, admin.passwordHash)
    if (!isValid) {
        throw new Error('Credenciais inválidas')
    }

    const token = await signAdminToken(admin.id)

    await prisma.adminUser.update({
        where: { id: admin.id },
        data: { ultimoAcesso: new Date() }
    })

    await prisma.auditLog.create({
        data: {
            evento: 'admin.login',
            userId: admin.id,
            ip
        }
    })

    logger.info({ event: 'admin.auth.success', adminId: admin.id, ip, email: admin.email })

    return { token, admin: { nome: admin.nome, email: admin.email } }
}
