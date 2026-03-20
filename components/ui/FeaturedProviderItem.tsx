import Link from 'next/link'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

type Props = {
    href: string
    initials: string
    bgStyle: { background: string; color: string }
    nome: string
    meta: string
}

export function FeaturedProviderItem({ href, initials, bgStyle, nome, meta }: Props) {
    return (
        <Link href={href} className="featured-item">
            <div className="fi-av" style={bgStyle}>
                {initials}<div className="fi-online"></div>
            </div>
            <div className="fi-info">
                <div className="fi-name">{nome}</div>
                <div className="fi-meta">{meta}</div>
            </div>
            <div className="fi-wa text-[20px]"><WhatsAppIcon /></div>
        </Link>
    )
}
