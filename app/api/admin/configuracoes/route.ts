import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly } from '@/middleware/super-admin'
import {
    listarConfiguracoes,
    salvarConfiguracoes,
    mascaraApiKey,
} from '@/features/configuracoes/configuracoes.service'
import { salvarConfigSchema } from '@/features/configuracoes/configuracoes.schema'

export async function GET(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const configs = await listarConfiguracoes()

        // Retorna versão mascarada para exibição segura
        const masked: Record<string, string> = {}
        for (const [k, v] of Object.entries(configs)) {
            if (k === 'AI_PROVIDER') {
                masked[k] = v
            } else {
                masked[k] = mascaraApiKey(v)
            }
        }

        // Inclui provedor ativo (com fallback para 'anthropic')
        const provedor = configs['AI_PROVIDER'] || 'anthropic'
        masked['AI_PROVIDER'] = provedor

        return NextResponse.json({ configuracoes: masked })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin

    try {
        const body = await req.json()
        const data = salvarConfigSchema.parse(body)
        await salvarConfiguracoes(data)
        return NextResponse.json({ ok: true })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 400 })
    }
}
