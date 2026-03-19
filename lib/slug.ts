import slugify from 'slugify'
import { prisma } from '@/lib/prisma'

export function gerarSlugBase(texto: string): string {
    return slugify(texto, { lower: true, strict: true, locale: 'pt', trim: true })
}

export async function gerarSlugUnico(
    nome: string,
    servicoId: string,
    cidadeId: string,
    excluirId?: string  // para updates — não colidir consigo mesmo
): Promise<string> {
    const base = gerarSlugBase(nome)
    let slug = base
    let contador = 1

    while (true) {
        const existente = await prisma.prestador.findFirst({
            where: {
                slug,
                servicoId,
                cidadeId,
                ...(excluirId ? { NOT: { id: excluirId } } : {})
            }
        })

        if (!existente) return slug

        slug = `${base}-${contador}`
        contador++

        // Segurança: evitar loop infinito em casos extremos
        if (contador > 99) {
            slug = `${base}-${Date.now()}`
            break
        }
    }

    return slug
}
