import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly } from '@/middleware/super-admin'
import { listarPrestadoresAdmin } from '@/features/prestadores-admin/prestadores-admin.service'

export async function GET(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('pagina') || '1')
        const limit = parseInt(searchParams.get('porPagina') || '50')
        const status = searchParams.get('status') ?? undefined

        const result = await listarPrestadoresAdmin({ page, limit, status })
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
