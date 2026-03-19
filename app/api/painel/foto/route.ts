import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Em Produção idealmente usar um bucket ou volume montado.
// Para Vercel edge/serverless, o ideal é usar serviços como S3 ou Vercel Blob.
// Com fallback seguro para pasta public/uploads/ localmente e para PM2/VPS
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads/fotos')
const MAX_SIZE_MB = 5
const TAMANHOS = {
    thumb: { width: 80, height: 80 }, // lista de prestadores
    perfil: { width: 400, height: 400 }, // ficha completa
}

export async function POST(req: NextRequest) {
    const userResp = await authenticate(req)
    if (userResp instanceof NextResponse) return userResp

    // User is injected by authenticate if valid. We mock retrieving user via token for this API route type:
    // Instead, authenticate from headers directly and get User. Em app router:
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // Decodifica o usuário - Aqui usamos uma query ao banco mockando a decodificação segura
    const sessionUser = await prisma.user.findFirst({
        where: {
            refreshTokens: {
                some: { token } // Using refresh token just to simulate auth for now
            }
        },
        include: { prestador: true }
    })

    if (!sessionUser || !sessionUser.prestador) {
        return NextResponse.json({ error: 'Conta de prestador não encontrada' }, { status: 403 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get('foto') as File

        if (!file)
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

        if (file.size > MAX_SIZE_MB * 1024 * 1024)
            return NextResponse.json({ error: `Máximo ${MAX_SIZE_MB}MB` }, { status: 400 })

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
            return NextResponse.json({ error: 'Use JPG, PNG ou WebP' }, { status: 400 })

        const buffer = Buffer.from(await file.arrayBuffer())
        const dir = path.join(UPLOAD_DIR, sessionUser.prestador.id)
        await mkdir(dir, { recursive: true })

        // Gerar versões redimensionadas — fit cover + detecção de face
        for (const [nome, dims] of Object.entries(TAMANHOS)) {
            await sharp(buffer)
                .resize(dims.width, dims.height, { fit: 'cover', position: 'entropy' }) // 'entropy' focuses on the most interesting part (e.g. face)
                .webp({ quality: 85 })
                .toFile(path.join(dir, `${nome}.webp`))
        }

        const fotoUrl = `/uploads/fotos/${sessionUser.prestador.id}/perfil.webp`

        await prisma.prestador.update({
            where: { userId: sessionUser.id },
            data: { foto: fotoUrl }
        })

        return NextResponse.json({ url: fotoUrl })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Falha no processamento da imagem' }, { status: 500 })
    }
}
