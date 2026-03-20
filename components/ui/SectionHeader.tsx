import Link from 'next/link'

type Props = {
    title: string
    href?: string
    linkLabel?: string
}

export function SectionHeader({ title, href, linkLabel = 'Ver todos →' }: Props) {
    return (
        <div className="section-head">
            <span className="section-title">{title}</span>
            {href && <Link href={href} className="see-all">{linkLabel}</Link>}
        </div>
    )
}
