import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { atualizarFotoPrestador } from '@/features/painel/painel.service'

export async function POST(req: NextRequest) {
    const userResp = await authenticate(req)
    if (userResp instanceof NextResponse) return userResp

    // Padrão de auth dupla preservado exatamente como estava
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    try {
        const formData = await req.formData()
        const file = formData.get('foto') as File

        if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

        const result = await atualizarFotoPrestador(token, file)
        return NextResponse.json(result)
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Falha no processamento da imagem'
        const status = msg === 'Conta de prestador não encontrada' ? 403 : 400
        return NextResponse.json({ error: msg }, { status })
    }
}
