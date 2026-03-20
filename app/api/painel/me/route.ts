import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/middleware/authenticate'
import { buscarFichaPrestador } from '@/features/painel/painel.service'

export async function GET(req: NextRequest) {
    try {
        const user = await authenticate(req)
        if (user instanceof NextResponse) return user

        if (!user.prestadorId) {
            return NextResponse.json({ error: 'Nenhuma ficha de prestador atrelada' }, { status: 404 })
        }

        const ficha = await buscarFichaPrestador(user.prestadorId)

        if (!ficha) {
            return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
        }

        return NextResponse.json({ ficha }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
}
