import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/config/env'

export async function signAdminToken(adminId: string) {
    const secret = new TextEncoder().encode(env.JWT_SECRET)

    return await new SignJWT({ id: adminId, role: 'SUPER_ADMIN' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<{ id: string, role: string } | null> {
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload as any
    } catch {
        return null
    }
}
