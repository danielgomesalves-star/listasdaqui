import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cadastroSchema } from './prestadores.schema'

export async function criarPrestador(data: z.infer<typeof cadastroSchema>) {
    // 1. Check if email already exists
    const userExists = await prisma.user.findUnique({
        where: { email: data.email },
    })

    if (userExists) {
        throw new Error('E-mail já está em uso')
    }

    // 2. Hash password
    const passwordHash = await hash(data.senha, 10)

    // 3. Generate a friendly slug from name
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

    // 4. Create User and Prestador inside a Transaction
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: 'PRESTADOR',
            }
        })

        const prestador = await tx.prestador.create({
            data: {
                userId: user.id,
                nome: data.nome,
                slug,
                whatsapp: data.whatsapp,
                cidadeId: data.cidadeId,
                servicoId: data.servicoId,
                bio: data.bio || null,
                instagram: data.instagram || null,
                plano: 'GRATUITO',
                ativo: true,     // We can set these to auto-active for MVP
                aprovado: true,
            }
        })

        return { user, prestador }
    })

    return result
}
