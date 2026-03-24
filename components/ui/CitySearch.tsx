'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceSelectModal, ServicoItem } from './ServiceSelectModal'

export function CitySearch({
    cidadeSlug,
    servicos
}: {
    cidadeSlug: string
    servicos: ServicoItem[]
}) {
    const router = useRouter()
    const [modalOpen, setModalOpen] = useState(false)
    const [selecionado, setSelecionado] = useState<ServicoItem | null>(null)

    function handleSelect(s: ServicoItem) {
        setSelecionado(s)
        router.push(`/${cidadeSlug}/${s.slug}`)
    }

    return (
        <>
            <div className="hero-search">
                <div className="hs-label">O que você precisa?</div>
                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="hs-field w-full text-left cursor-pointer hover:bg-white/10 transition-colors"
                >
                    <span className="hs-icon">{selecionado?.icone || '🔍'}</span>
                    <span className={`flex-1 text-sm ${selecionado ? 'text-text font-semibold' : 'text-text3'}`}>
                        {selecionado ? selecionado.nome : 'Ex: eletricista, encanador...'}
                    </span>
                    <span className="text-text3 text-xs font-semibold shrink-0">Ver todos →</span>
                </button>
                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="hs-btn mt-3 text-center"
                >
                    Buscar agora
                </button>
            </div>

            <ServiceSelectModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelect}
                servicos={servicos}
                title="Serviços disponíveis"
            />
        </>
    )
}
