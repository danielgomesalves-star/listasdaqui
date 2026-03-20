import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads/fotos')
export const MAX_SIZE_MB = 5
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const TAMANHOS = {
    thumb: { width: 80, height: 80 },
    perfil: { width: 400, height: 400 },
}

export function validarArquivoFoto(file: File): void {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`Máximo ${MAX_SIZE_MB}MB`)
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error('Use JPG, PNG ou WebP')
    }
}

export async function processarFotoPrestador(buffer: Buffer, prestadorId: string): Promise<{ fotoUrl: string }> {
    const dir = path.join(UPLOAD_DIR, prestadorId)
    await mkdir(dir, { recursive: true })

    for (const [nome, dims] of Object.entries(TAMANHOS)) {
        await sharp(buffer)
            .resize(dims.width, dims.height, { fit: 'cover', position: 'entropy' })
            .webp({ quality: 85 })
            .toFile(path.join(dir, `${nome}.webp`))
    }

    return { fotoUrl: `/uploads/fotos/${prestadorId}/perfil.webp` }
}
