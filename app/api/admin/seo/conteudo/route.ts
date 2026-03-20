import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly } from '@/middleware/super-admin'
import { listarConteudos } from '@/features/seo/seo.service'

export async function GET(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('pagina') || '1')
        const limit = parseInt(searchParams.get('porPagina') || '50')
        const filter = searchParams.get('status') || 'todos'

        const result = await listarConteudos({ page, limit, filter })
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
