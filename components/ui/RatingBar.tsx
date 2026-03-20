type Props = {
    star: number
    count: number
    total: number
}

export function RatingBar({ star, count, total }: Props) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    const isHighlighted = count > 0
    return (
        <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-text2 w-2 shrink-0">{star}</span>
            <div className="flex-1 h-[5px] bg-bg2 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${isHighlighted ? 'bg-gold' : 'bg-border'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[11px] text-text3 w-5 text-right">{count}</span>
        </div>
    )
}
