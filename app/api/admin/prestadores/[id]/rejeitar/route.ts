import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-admin'
import { rejeitarSchema } from '@/features/prestadores-admin/prestadores-admin.schema'
import { rejeitarPrestador } from '@/features/prestadores-admin/prestadores-admin.service'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    // Padrão de auth original preservado exatamente (verifyAdminToken direto, não superAdminOnly)
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    const decoded = await verifyAdminToken(token)
    if (!decoded) return NextResponse.json({ error: 'Token invalido' }, { status: 401 })

    const { motivo, detalhes } = rejeitarSchema.parse(await req.json())
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

    try {
        await rejeitarPrestador({ prestadorId: params.id, adminId: decoded.id, motivo, detalhes, ip })
        return NextResponse.json({ ok: true })
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erro ao registrar rejeicao'
        const status = msg === 'Prestador nao encontrado' ? 404 : 500
        return NextResponse.json({ error: msg }, { status })
    }
}
