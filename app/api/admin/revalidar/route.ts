import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { signAdminToken } from '@/lib/auth-admin'

export async function POST(req: NextRequest) {
    // Simples auth para ISR
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    try {
        const { tipo, id } = await req.json()

        switch (tipo) {
            case 'prestador':
                revalidateTag(`prestador-${id}`)   // só a ficha específica
                break
            case 'categoria':
                revalidateTag(`categoria-${id}`)   // todas as fichas da categoria
                break
            case 'todos':
                revalidateTag('prestadores-todos') // site inteiro
                break
        }

        return NextResponse.json({ ok: true, revalidated: true, tag: `${tipo}-${id}` })
    } catch (err) {
        return NextResponse.json({ error: 'Erro ao revalidar paginas' }, { status: 500 })
    }
}
