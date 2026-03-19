import { NextRequest, NextResponse } from 'next/server'
import { logout } from '@/features/auth/auth.service'
import { authenticate } from '@/middleware/authenticate'

export async function POST(req: NextRequest) {
    try {
        const user = await authenticate(req)
        if (user instanceof NextResponse) {
            // If it's a response, it means authentication failed, but for logout we might not care strictly
            // However, we still need the tokens. It's safer to just let them pass if they send the refresh token in body
        }

        const body = await req.json().catch(() => ({}))
        const refreshToken = body.refreshToken

        if (refreshToken) {
            await logout(refreshToken)
        }

        return NextResponse.json({ success: true }, { status: 200 })

    } catch (error) {
        console.error('Erro no logout:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
