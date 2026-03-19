import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth'

export async function login(email: string, senha: string) {
    // 1. Find User
    const user = await prisma.user.findUnique({
        where: { email },
        include: { prestador: true }
    })

    if (!user) {
        throw new Error('Credenciais inválidas')
    }

    // 2. Verify Password
    const isValid = await compare(senha, user.passwordHash)
    if (!isValid) {
        throw new Error('Credenciais inválidas')
    }

    // 3. Generate Tokens
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        prestadorId: user.prestador?.id || null,
    }

    const accessToken = await signAccessToken(payload)

    // 4. Save Refresh Token
    const jti = crypto.randomUUID()
    const refreshToken = await signRefreshToken({ userId: user.id, jti })

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7) // expires in 7 days

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: expirationDate
        }
    })

    return { user, accessToken, refreshToken }
}

export async function refresh(token: string) {
    const valid = await verifyRefreshToken(token)
    if (!valid) throw new Error('Token expirado')

    const record = await prisma.refreshToken.findUnique({
        where: { token }
    })

    if (!record || record.expiresAt < new Date()) {
        throw new Error('Refresh token inválido')
    }

    const user = await prisma.user.findUnique({
        where: { id: record.userId },
        include: { prestador: true }
    })

    if (!user) throw new Error('Usuário não encontrado')

    // Rotate token
    await prisma.refreshToken.delete({ where: { token } })

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        prestadorId: user.prestador?.id || null,
    }

    const accessToken = await signAccessToken(payload)

    const jti = crypto.randomUUID()
    const newRefreshToken = await signRefreshToken({ userId: user.id, jti })

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)

    await prisma.refreshToken.create({
        data: {
            token: newRefreshToken,
            userId: user.id,
            expiresAt: expirationDate
        }
    })

    return { accessToken, refreshToken: newRefreshToken }
}

export async function logout(token: string) {
    if (!token) return
    await prisma.refreshToken.deleteMany({
        where: { token }
    })
}
