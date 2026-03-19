import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, JWTPayload } from '@/lib/auth'

export async function authenticate(req: NextRequest): Promise<JWTPayload | NextResponse> {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyAccessToken(token)

    if (!payload) {
        return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
    }

    return payload
}
