import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function superAdminOnly(req: NextRequest) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyAccessToken(token).catch(() => null)

    if (!payload || payload.role !== 'SUPER_ADMIN') {
        console.warn(`Acesso negado à rota Admin: ${req.nextUrl.pathname}`)
        return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
    }

    return payload
}

export async function auditarAcao(
    adminId: string,
    evento: string,
    payload: object,
    req: NextRequest
) {
    await prisma.auditLog.create({
        data: {
            evento,
            userId: adminId,
            payload: payload as any,
            ip: req.headers.get('x-forwarded-for') ?? 'unknown',
        }
    })
}
