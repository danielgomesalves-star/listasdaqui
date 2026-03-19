import { NextRequest, NextResponse } from 'next/server'
import { superAdminOnly } from '@/middleware/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const admin = await superAdminOnly(req)
    if (admin instanceof NextResponse) return admin // Retorna erro de auth se falhou

    try {
        // 1. Prestadores
        const [totalPrestadores, pendentes, bloqueados] = await Promise.all([
            prisma.prestador.count(),
            prisma.prestador.count({ where: { aprovado: false } }),
            prisma.prestador.count({ where: { ativo: false } })
        ])

        // Grouping by plans naively for MVP
        const planos = await prisma.prestador.groupBy({
            by: ['plano'],
            _count: { id: true }
        })

        const porPlano = {
            GRATUITO: 0, VERIFICADO: 0, DESTAQUE: 0
        }
        planos.forEach(p => { porPlano[p.plano] = p._count.id })

        // 2. Receita (Mocked/Simplified for MVP based on VERIFICADO/DESTAQUE count)
        // 97/ano verificado = 8/mês MRR. 197/ano destaque
        const mrr = (porPlano.VERIFICADO * 8) + (porPlano.DESTAQUE * 16)

        // 3. Avaliações
        const [avPendentes, avAprovadas] = await Promise.all([
            prisma.avaliacao.count({ where: { aprovado: false } }),
            prisma.avaliacao.count({ where: { aprovado: true } })
        ])

        // 4. Conteúdo SEO
        const paginasGeradas = await prisma.conteudo.count()
        const totalServicos = await prisma.servico.count()
        const totalCidades = await prisma.cidade.count()
        const paginasFaltando = Math.max(0, (totalServicos * totalCidades) - paginasGeradas)

        // 5. Emails
        // Simplified since we might not run BullMQ
        const emailsEnviados = await prisma.emailLog.count({ where: { status: 'enviado' } })
        const emailsFalhas = await prisma.emailLog.count({ where: { status: 'erro' } })

        return NextResponse.json({
            prestadores: {
                total: totalPrestadores,
                ativos: totalPrestadores - bloqueados,
                pendentes,
                bloqueados,
                porPlano
            },
            receita: {
                mrr,
                arr: mrr * 12,
                novosEsteMes: 0,
                cancelamentosEsteMes: 0
            },
            avaliacoes: {
                pendentes: avPendentes,
                aprovadas: avAprovadas
            },
            conteudo: {
                paginasGeradas,
                paginasFaltando
            },
            emails: {
                enviadosHoje: emailsEnviados,
                falhasHoje: emailsFalhas
            }
        })

    } catch (error) {
        console.error('Erro no dashboard admin:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
