import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { z } from 'zod'
import { otimizarConteudoIA } from '@/lib/ai/conteudo'

const schema = z.object({
    servicoId: z.string().min(1),
    cidadeId: z.string().min(1),
    termos: z.string().min(3, 'Informe pelo menos um termo de pesquisa')
})

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { servicoId, cidadeId, termos } = schema.parse(await req.json())

        const conteudo = await otimizarConteudoIA({ servicoId, cidadeId, termos })

        await auditarAcao(admin.id, 'seo.otimizacao_ia', { servicoId, cidadeId, termos }, req)

        return NextResponse.json({ success: true, data: conteudo })
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao otimizar: ' + String(error) }, { status: 500 })
    }
}
