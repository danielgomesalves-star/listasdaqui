import { prisma } from '@/lib/prisma'
import type { SalvarConfigInput } from './configuracoes.schema'

/**
 * Busca uma configuração pelo nome da chave.
 * Prioridade: banco de dados → process.env → undefined
 */
export async function getConfiguracao(chave: string): Promise<string | undefined> {
    try {
        const config = await prisma.configuracao.findUnique({ where: { chave } })
        if (config?.valor) return config.valor
    } catch {
        // fallback se tabela ainda não existe
    }
    return process.env[chave] ?? undefined
}

/**
 * Retorna todas as configs salvas no banco (valores mascarados para exibição na UI)
 */
export async function listarConfiguracoes(): Promise<Record<string, string>> {
    try {
        const configs = await prisma.configuracao.findMany()
        const result: Record<string, string> = {}
        for (const c of configs) {
            result[c.chave] = c.valor
        }
        return result
    } catch {
        return {}
    }
}

/**
 * Salva ou atualiza as configurações no banco.
 * Campos vazios ou undefined são ignorados.
 */
export async function salvarConfiguracoes(data: SalvarConfigInput) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== '')

    await Promise.all(
        entries.map(([chave, valor]) =>
            prisma.configuracao.upsert({
                where: { chave },
                update: { valor: valor as string },
                create: { chave, valor: valor as string },
            })
        )
    )
}

/**
 * Mascara uma API key para exibição segura: "sk-ant-***...XXXX"
 */
export function mascaraApiKey(key: string): string {
    if (!key || key.length < 8) return '***'
    const prefix = key.substring(0, 7)
    const suffix = key.substring(key.length - 4)
    return `${prefix}***...${suffix}`
}
