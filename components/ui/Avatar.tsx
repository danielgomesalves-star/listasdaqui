const BG_COLORS = [
    'bg-[#FEF3C7] text-[#B45309]',
    'bg-[#EFF6FF] text-[#1D4ED8]',
    'bg-[#F0FDF4] text-[#166534]',
    'bg-[#FDF4FF] text-[#7C3AED]',
    'bg-[#FFF7ED] text-[#C2410C]',
]

const SIZE_CLASSES = {
    sm: 'w-10 h-10 text-[14px]',
    md: 'w-[62px] h-[62px] text-[20px]',
    lg: 'w-20 h-20 text-[28px]',
}

type Props = {
    nome: string
    foto?: string | null
    size?: 'sm' | 'md' | 'lg'
    isPago?: boolean
    colorIndex?: number
}

export function Avatar({ nome, foto, size = 'md', isPago = false, colorIndex = 0 }: Props) {
    const initials = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    const bgColor = BG_COLORS[colorIndex % BG_COLORS.length]

    return (
        <div className="relative shrink-0">
            {foto ? (
                <img src={foto} alt={nome} className={`${SIZE_CLASSES[size]} rounded-full object-cover`} />
            ) : (
                <div className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center font-extrabold overflow-hidden ${bgColor}`}>
                    {initials}
                </div>
            )}
            {isPago && (
                <div className="absolute bottom-0.5 right-0.5 w-[14px] h-[14px] bg-green rounded-full border-2 border-white" />
            )}
        </div>
    )
}
