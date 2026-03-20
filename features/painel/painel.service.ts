import { prisma } from '@/lib/prisma'
import { validarArquivoFoto, processarFotoPrestador } from '@/features/media/media.service'

export async function buscarFichaPrestador(prestadorId: string) {
    return prisma.prestador.findUnique({
        where: { id: prestadorId },
        include: {
            servico: true,
            cidade: true,
            _count: { select: { avaliacoes: true } }
        }
    })
}

export async function atualizarFotoPrestador(token: string, file: File): Promise<{ url: string }> {
    // Padrão de auth existente preservado exatamente — busca por refreshToken no DB
    const sessionUser = await prisma.user.findFirst({
        where: { refreshTokens: { some: { token } } },
        include: { prestador: true }
    })

    if (!sessionUser || !sessionUser.prestador) {
        throw new Error('Conta de prestador não encontrada')
    }

    validarArquivoFoto(file)

    const buffer = Buffer.from(await file.arrayBuffer())
    const { fotoUrl } = await processarFotoPrestador(buffer, sessionUser.prestador.id)

    await prisma.prestador.update({
        where: { userId: sessionUser.id },
        data: { foto: fotoUrl }
    })

    return { url: fotoUrl }
}
