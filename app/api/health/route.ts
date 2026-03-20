import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET() {
    const inicio = Date.now()
    const checks: Record<string, string> = {}

    try {
        // Check banco de dados relacional
        await prisma.$queryRaw`SELECT 1`
        checks.db = 'ok'
    } catch {
        checks.db = 'erro'
    }

    try {
        // Check in-memory store (Redis)
        await redis.ping()
        checks.redis = 'ok'
    } catch {
        checks.redis = 'erro'
    }

    try {
        // Check disco se estiver rodando em Linux/Mac (ignora sutilmente no Windows)
        if (process.platform === 'linux') {
            const { stdout } = await execAsync("df / -h | tail -1 | awk '{print $5}'")
            const uso = stdout.trim().replace('%', '')
            checks.disco = Number(uso) > 90 ? 'critico' : 'ok'
            checks.discoUso = `${uso}%`
        } else {
            checks.disco = 'ignorado_non_linux'
        }
    } catch {
        checks.disco = 'desconhecido'
    }

    const status = Object.values(checks).includes('erro') ? 500 : 200

    return NextResponse.json(
        { status: status === 200 ? 'ok' : 'degradado', latencia: `${Date.now() - inicio}ms`, checks },
        { status, headers: { 'Cache-Control': 'no-store' } }
    )
}
