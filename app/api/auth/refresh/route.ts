import { NextRequest, NextResponse } from 'next/server'
import { refreshSchema } from '@/features/auth/auth.schema'
import { refresh } from '@/features/auth/auth.service'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const parsed = refreshSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { refreshToken } = parsed.data
        const { accessToken, refreshToken: newRefreshToken } = await refresh(refreshToken)

        return NextResponse.json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken
        }, { status: 200 })

    } catch (error: any) {
        if (error.message === 'Token expirado' || error.message === 'Refresh token inválido') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        console.error('Erro no refresh:', error)
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
}
