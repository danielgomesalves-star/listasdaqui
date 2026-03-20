import { prisma } from '@/lib/prisma'
import { emailQueue } from '@/jobs/queues'
import { MOTIVOS_REJEICAO } from '@/features/onboarding/onboarding.service'

export async function listarPrestadoresAdmin(params: {
    page: number
    limit: number
    status?: string
}) {
    const { page, limit, status } = params
    const skip = (page - 1) * limit

    let whereClause: any = {}
    if (status === 'pendentes') whereClause.aprovado = false
    else if (status === 'bloqueados') whereClause.ativo = false
    else if (status === 'ativos') whereClause = { ativo: true, aprovado: true }

    const [prestadores, total] = await Promise.all([
        prisma.prestador.findMany({
            where: whereClause,
            include: {
                servico: { select: { nome: true } },
                cidade: { select: { nome: true, uf: true } },
                user: { select: { email: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.prestador.count({ where: whereClause })
    ])

    return { prestadores, total, pagina: page, totalPaginas: Math.ceil(total / limit) }
}

export async function aprovarPrestador(prestadorId: string) {
    return prisma.prestador.update({
        where: { id: prestadorId },
        data: { aprovado: true }
    })
}

export async function rejeitarPrestador(params: {
    prestadorId: string
    adminId: string
    motivo: string
    detalhes?: string
    ip: string
}) {
    const { prestadorId, adminId, motivo, detalhes, ip } = params

    const prestador = await prisma.prestador.findUnique({
        where: { id: prestadorId },
        include: { user: true }
    })

    if (!prestador) throw new Error('Prestador nao encontrado')

    // auditLog DENTRO da transaction — padrão específico desta rota
    await prisma.$transaction([
        (prisma as any).rejeicao.create({
            data: { prestadorId, adminId, motivo, detalhes }
        }),
        prisma.prestador.update({
            where: { id: prestadorId },
            data: { aprovado: false, ativo: false }
        }),
        prisma.auditLog.create({
            data: {
                evento: 'prestador.rejeitado',
                userId: adminId,
                payload: { prestadorId, motivo },
                ip
            }
        })
    ])

    const txtMotivo = MOTIVOS_REJEICAO[motivo as keyof typeof MOTIVOS_REJEICAO] || motivo

    await emailQueue.add('cadastro-rejeitado', {
        to: prestador.user.email,
        subject: 'Seu cadastro precisa de ajustes — ListasDaqui',
        html: `
        <h2>Olá, ${prestador.nome}</h2>
        <p>Encontramos um ajuste necessário no seu cadastro:</p>
        <blockquote><strong>${txtMotivo}</strong>
        ${detalhes ? `<br><em>${detalhes}</em>` : ''}</blockquote>
        <p>Acesse seu painel, corrija os dados e enviamos para aprovação novamente automaticamente.</p>
        <p><a href="https://listasdaqui.com.br/painel/">Corrigir meu cadastro</a></p>
      `
    })
}

export async function bloquearFichaPrestador(params: {
    prestadorId: string
    adminId: string
    motivo: string
}) {
    const { prestadorId, adminId, motivo } = params

    await prisma.$transaction([
        prisma.bloqueio.create({
            data: { tipo: 'FICHA', alvoId: prestadorId, motivo, adminId }
        }),
        prisma.prestador.update({
            where: { id: prestadorId },
            data: { ativo: false }
        })
    ])
}
