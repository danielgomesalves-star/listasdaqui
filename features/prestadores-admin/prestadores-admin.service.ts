import { prisma } from '@/lib/prisma'
import { emailQueue } from '@/jobs/queues'
import { MOTIVOS_REJEICAO } from '@/features/onboarding/onboarding.service'
import { hash } from 'bcryptjs'

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

export async function criarPrestadorManual(data: {
    nome: string,
    email?: string,
    whatsapp: string,
    cidadeId: string,
    servicoId: string,
    bio?: string,
    instagram?: string
}) {
    // 1. Generate a friendly slug from name
    let slugBase = data.nome.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, '')
        .trim()
        .replace(/\s+/g, '-')

    // Ensure slug uniqueness
    let slug = slugBase
    let isUnique = false
    let count = 0
    while (!isUnique) {
        const existing = await prisma.prestador.findUnique({ where: { slug } })
        if (existing) {
            count++
            slug = `${slugBase}-${count}`
        } else {
            isUnique = true
        }
    }

    // 2. Resolve email (if empty, generate one)
    const finalEmail = data.email && data.email.trim() !== ''
        ? data.email
        : `${slug}-${Math.floor(Date.now() / 1000)}@listasdaqui.com.br`

    // Check if email already exists
    const userExists = await prisma.user.findUnique({
        where: { email: finalEmail },
    })

    if (userExists) {
        throw new Error('E-mail já está em uso')
    }

    // 3. Hash random password
    const randomPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await hash(randomPassword, 10)

    // 4. Create User and Prestador
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: finalEmail,
                passwordHash,
                role: 'PRESTADOR',
            }
        })

        const prestador = await tx.prestador.create({
            data: {
                userId: user.id,
                nome: data.nome,
                slug,
                whatsapp: data.whatsapp.replace(/\D/g, ''),
                cidadeId: data.cidadeId,
                servicoId: data.servicoId,
                bio: data.bio || null,
                instagram: data.instagram || null,
                plano: 'GRATUITO',
                ativo: true,
                aprovado: true,
            }
        })

        return { user, prestador }
    })

    return result
}
