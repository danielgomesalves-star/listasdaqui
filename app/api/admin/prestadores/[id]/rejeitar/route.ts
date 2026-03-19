import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth-admin'
import { emailQueue } from '@/jobs/queues'
import { MOTIVOS_REJEICAO } from '@/features/onboarding/onboarding.service'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    // Verifica super admin
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    const decoded = await verifyAdminToken(token)
    if (!decoded) return NextResponse.json({ error: 'Token invalido' }, { status: 401 })

    const adminId = decoded.adminId
    const reqBody = await req.json()
    const { motivo, detalhes } = reqBody

    if (!motivo) return NextResponse.json({ error: 'Motivo obrigatorio' }, { status: 400 })

    const prestador = await prisma.prestador.findUnique({
        where: { id: params.id },
        include: { user: true }
    })

    if (!prestador) return NextResponse.json({ error: 'Prestador nao encontrado' }, { status: 404 })

    try {
        // Registra rejeição SEM deletar — prestador pode corrigir
        await prisma.$transaction([
            prisma.rejeicao.create({
                data: { prestadorId: params.id, adminId: adminId, motivo, detalhes }
            }),
            prisma.prestador.update({
                where: { id: params.id },
                data: { aprovado: false, ativo: false }
            }),
            prisma.auditLog.create({
                data: {
                    evento: 'prestador.rejeitado',
                    userId: adminId,
                    payload: { prestadorId: params.id, motivo },
                    ip: req.headers.get('x-forwarded-for') ?? 'unknown'
                }
            })
        ])

        const txtMotivo = MOTIVOS_REJEICAO[motivo as keyof typeof MOTIVOS_REJEICAO] || motivo

        // Email para o prestador com motivo e link para corrigir via queue
        await emailQueue.add('cadastro-rejeitado', {
            to: prestador.user.email,
            subject: 'Seu cadastro precisa de ajustes — ListasDaqui',
            html: `
        <h2>Olá, \${prestador.nome}</h2>
        <p>Encontramos um ajuste necessário no seu cadastro:</p>
        <blockquote><strong>\${txtMotivo}</strong>
        \${detalhes ? \`<br><em>\${detalhes}</em>\` : ''}</blockquote>
        <p>Acesse seu painel, corrija os dados e enviamos para aprovação novamente automaticamente.</p>
        <p><a href="https://listasdaqui.com.br/painel/">Corrigir meu cadastro</a></p>
      `
        })

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro ao registrar rejeicao' }, { status: 500 })
    }
}
