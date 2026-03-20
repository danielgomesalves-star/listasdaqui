type Stat = { value: string; label: string }

type Props = {
    stats: Stat[]
}

export function StatsRow({ stats }: Props) {
    return (
        <div className="hero-stats">
            {stats.map((s, i) => (
                <div key={i} className="hs-stat">
                    <div className="hs-stat-n">{s.value}</div>
                    <div className="hs-stat-l">{s.label}</div>
                </div>
            ))}
        </div>
    )
}
