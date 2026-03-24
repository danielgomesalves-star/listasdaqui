import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export async function GET() {
    const cidades = await prisma.cidade.findMany({
        where: { ativo: true },
        select: { uf: true, nome: true, slug: true },
        orderBy: [{ uf: 'asc' }, { nome: 'asc' }]
    })

    return NextResponse.json({ cidades }, {
        headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }
    })
}
