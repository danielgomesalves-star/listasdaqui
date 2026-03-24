import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

// Node.js runtime — necessário para ler arquivos do sistema
export const runtime = 'nodejs'

const GRADIENTS: Record<string, string[]> = {
    eletricista:      ['#1e3a5f', '#0f4c81'],
    encanador:        ['#134e4a', '#0f766e'],
    pintor:           ['#3b1f6b', '#6d28d9'],
    pedreiro:         ['#431407', '#9a3412'],
    marceneiro:       ['#1c1917', '#44403c'],
    serralheiro:      ['#0c1445', '#1e3a8a'],
    jardineiro:       ['#14532d', '#15803d'],
    eletrodomesticos: ['#1e1b4b', '#4338ca'],
    informatica:      ['#0f172a', '#1e40af'],
    default:          ['#0f172a', '#1e3a5f'],
}

function getGradient(servico: string): string[] {
    const key = Object.keys(GRADIENTS).find(k => servico.toLowerCase().includes(k))
    return GRADIENTS[key || 'default']
}

function getImageBase64(slug: string): string | null {
    const exts = ['.png', '.jpg', '.jpeg', '.webp']
    for (const ext of exts) {
        const filePath = path.join(process.cwd(), 'public', 'servicos', `${slug}${ext}`)
        if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath)
            const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                : ext === '.webp' ? 'image/webp' : 'image/png'
            return `data:${mime};base64,${buffer.toString('base64')}`
        }
    }
    return null
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const servico = searchParams.get('servico') || 'Serviço'
    const slug    = searchParams.get('slug')    || ''
    const cidade  = searchParams.get('cidade')  || 'sua cidade'
    const uf      = searchParams.get('uf')      || ''

    const localidade = uf ? `${cidade}, ${uf}` : cidade
    const textoLocal = `📍 ${localidade}`
    const textoServico = servico
    const textoEmCidade = `em ${cidade}`
    const textoRodape = 'Profissionais verificados · Avaliações reais · Contato pelo WhatsApp'

    const imagemBase64 = slug ? getImageBase64(slug) : null

    if (imagemBase64) {
        return new ImageResponse(
            (
                <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'sans-serif' }}>
                    <img
                        src={imagemBase64}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)', display: 'flex' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 64px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 20px', color: 'white', fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>
                                <span>ListasDaqui</span>
                            </div>
                            <div style={{ display: 'flex', color: 'rgba(255,255,255,0.85)', fontSize: 22, fontWeight: 600 }}>
                                <span>{textoLocal}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'white', fontSize: 72, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{textoServico}</span>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 52, fontWeight: 600 }}>{textoEmCidade}</span>
                            </div>
                            <div style={{ display: 'flex', color: 'rgba(255,255,255,0.7)', fontSize: 26, fontWeight: 500 }}>
                                <span>{textoRodape}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        )
    }

    // Fallback: gradiente sem foto
    const [cor1, cor2] = getGradient(servico)

    return new ImageResponse(
        (
            <div style={{ background: `linear-gradient(135deg, ${cor1} 0%, ${cor2} 60%, ${cor1} 100%)`, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: '64px 72px', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 20px', color: 'rgba(255,255,255,0.85)', fontSize: 22, fontWeight: 700 }}>
                        <span>ListasDaqui</span>
                    </div>
                    <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 22 }}>
                        <span>{textoLocal}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'white', fontSize: 76, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>{textoServico}</span>
                        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 76, fontWeight: 700 }}>{textoEmCidade}</span>
                    </div>
                    <div style={{ display: 'flex', color: 'rgba(255,255,255,0.6)', fontSize: 26 }}>
                        <span>{textoRodape}</span>
                    </div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    )
}
