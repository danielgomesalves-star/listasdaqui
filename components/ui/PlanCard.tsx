const PLANS = {
    free: {
        badge: { label: 'GRATUITO', style: { color: 'var(--text3)' } },
        price: 'R$0',
        period: '/mês',
        periodSub: 'para sempre',
        features: [
            { label: 'Ficha básica', included: true },
            { label: 'Aparece na lista', included: true },
            { label: 'WhatsApp visível', included: false },
            { label: 'Selo verificado', included: false },
        ],
    },
    verified: {
        badge: { label: '✓ VERIFICADO', style: { color: 'var(--accent)' } },
        price: 'R$97',
        period: '/ano',
        periodSub: 'pagamento anual único',
        features: [
            { label: 'WhatsApp visível', included: true },
            { label: 'Selo ✓✓', included: true },
            { label: 'Topo da lista', included: true },
            { label: 'Instagram linkado', included: true },
        ],
    },
}

type Props = {
    plan: 'free' | 'verified'
    selected: boolean
    onSelect: () => void
}

export function PlanCard({ plan, selected, onSelect }: Props) {
    const p = PLANS[plan]
    const featureColor = plan === 'verified' ? 'var(--accent)' : undefined
    return (
        <div className={`plan-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
            <div className="pc-badge" style={p.badge.style}>{p.badge.label}</div>
            <div className="pc-price">{p.price} <small>{p.period}</small></div>
            <div className="pc-period">{p.periodSub}</div>
            {p.features.map(f => (
                <div
                    key={f.label}
                    className="pc-feature"
                    style={f.included ? (featureColor ? { color: featureColor } : undefined) : { color: 'var(--text3)' }}
                >
                    <span>{f.included ? '✓' : '✗'}</span> {f.label}
                </div>
            ))}
        </div>
    )
}
