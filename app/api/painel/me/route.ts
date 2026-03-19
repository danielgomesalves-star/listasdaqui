import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/middleware/authenticate'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const user = await authenticate(req)
        if (user instanceof NextResponse) return user // Token inválido

        if (!user.prestadorId) {
            return NextResponse.json({ error: 'Nenhuma ficha de prestador atrelada' }, { status: 404 })
        }

        const ficha = await prisma.prestador.findUnique({
            where: { id: user.prestadorId },
            include: {
                servico: true,
                cidade: true,
                _count: {
                    select: { avaliacoes: true }
                }
            }
        })

        if (!ficha) {
            return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
        }

        return NextResponse.json({ ficha }, { status: 200 })

    } catch (error) {
        console.error('Erro ao buscar o perfil:', error)
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
}
