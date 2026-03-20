import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/config/env'

const secretKey = new TextEncoder().encode(env.JWT_SECRET)
const refreshSecretKey = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

export interface JWTPayload {
    id: string
    email: string
    role: string
    prestadorId?: string | null
}

export async function signAccessToken(payload: JWTPayload) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN)
        .sign(secretKey)
}

export async function signRefreshToken(payload: { userId: string, jti: string }) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
        .sign(refreshSecretKey)
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secretKey)
        return payload as unknown as JWTPayload
    } catch (err) {
        return null
    }
}

export async function verifyRefreshToken(token: string): Promise<any | null> {
    try {
        const { payload } = await jwtVerify(token, refreshSecretKey)
        return payload
    } catch (err) {
        return null
    }
}

export async function authenticate(req: Request) {
    const token = req.headers.get('authorization')?.split(' ')[1] || ''
    return await verifyAccessToken(token)
}
