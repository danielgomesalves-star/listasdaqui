type Props = {
    pergunta: string
    resposta: string
}

export function FAQItem({ pergunta, resposta }: Props) {
    return (
        <details className="border-t border-border pt-3 mt-3 group/faq">
            <summary className="flex justify-between items-start gap-2.5 cursor-pointer list-none mb-1.5">
                <div className="text-[13px] font-bold text-text tracking-tight">{pergunta}</div>
                <div className="w-5 h-5 bg-border rounded-full flex items-center justify-center text-[13px] font-bold text-text2 shrink-0 leading-none group-open/faq:rotate-45 transition-transform">+</div>
            </summary>
            <div className="text-[12.5px] text-text2 leading-relaxed pb-1">{resposta}</div>
        </details>
    )
}
