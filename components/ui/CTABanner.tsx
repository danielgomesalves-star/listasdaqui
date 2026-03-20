import Link from 'next/link'

type Props = {
    title?: string
    subtitle?: string
    showPrice?: boolean
    buttonLabel?: string
    className?: string
}

export function CTABanner({
    title = 'É prestador de serviço?',
    subtitle = 'Apareça para clientes da sua cidade e receba contatos direto no WhatsApp',
    showPrice = true,
    buttonLabel = 'Quero me cadastrar →',
    className,
}: Props) {
    return (
        <div className={`cta-home ${className ?? ''}`}>
            <h3>{title}</h3>
            <p>{subtitle}</p>
            {showPrice && (
                <>
                    <div className="price">R$97 <small>/ano</small></div>
                    <div className="text-xs text-white/40 mb-4">ou cadastre-se grátis</div>
                </>
            )}
            <Link href="/cadastro" className={`hs-btn rounded-lg${showPrice ? '' : ' mt-4'}`}>{buttonLabel}</Link>
        </div>
    )
}
