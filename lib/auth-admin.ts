import { SignJWT } from 'jose'
import { env } from '@/config/env'

export async function signAdminToken(adminId: string) {
    const secret = new TextEncoder().encode(env.JWT_SECRET)

    return await new SignJWT({ id: adminId, role: 'SUPER_ADMIN' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(secret)
}
