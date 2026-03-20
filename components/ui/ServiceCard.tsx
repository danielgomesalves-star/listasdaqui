import Link from 'next/link'

const FALLBACK_ICONS: Record<string, string> = {
    'eletricista': '⚡', 'encanador': '🔧', 'pintor': '🎨',
    'ar-condicionado': '❄️', 'chaveiro': '🔑', 'mecanico': '🚗',
    'cabeleireiro': '✂️',
}

type Props = {
    servico: { slug: string; nome: string; icone?: string | null }
    cidadeSlug?: string
}

export function ServiceCard({ servico, cidadeSlug }: Props) {
    const href = cidadeSlug ? `/${cidadeSlug}/${servico.slug}` : `/brasilia-df/${servico.slug}`
    const icon = servico.icone || FALLBACK_ICONS[servico.slug] || '💼'
    return (
        <Link href={href} className="sg-item">
            <span className="sg-icon">{icon}</span>
            <span className="sg-name">{servico.nome}</span>
        </Link>
    )
}
