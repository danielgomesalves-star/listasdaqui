import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly, auditarAcao } from '@/middleware/super-admin'
import { z } from 'zod'
import { gerarImagemIA, gerarImagemOG } from '@/lib/ai/imagem'

const schema = z.object({
    servicoId: z.string().min(1),
    cidadeId: z.string().min(1),
    modo: z.enum(['dalle', 'og']).default('dalle'),
})

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const { servicoId, cidadeId, modo } = schema.parse(await req.json())

        const resultado = modo === 'og'
            ? await gerarImagemOG({ servicoId, cidadeId })
            : await gerarImagemIA({ servicoId, cidadeId })

        await auditarAcao(admin.id, 'seo.imagem_gerada', { servicoId, cidadeId, modo }, req)

        return NextResponse.json({
            success: true,
            imagemUrl: resultado.imagemUrl,
            fonte: resultado.fonte,
            aviso: 'aviso' in resultado ? resultado.aviso : undefined,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar imagem: ' + String(error) }, { status: 500 })
    }
}
