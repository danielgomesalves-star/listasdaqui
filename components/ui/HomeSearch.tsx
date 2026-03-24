'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceSelectModal, ServicoItem } from './ServiceSelectModal'

type Cidade = { uf: string; nome: string; slug: string }

const UF_NOMES: Record<string, string> = {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
    BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
    GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
    PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
    SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
}

export function HomeSearch({ servicos }: { servicos: ServicoItem[] }) {
    const router = useRouter()
    const [cidades, setCidades] = useState<Cidade[]>([])
    const [uf, setUf] = useState('')
    const [cidadeSlug, setCidadeSlug] = useState('')
    const [loadingCidades, setLoadingCidades] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [servicoSelecionado, setServicoSelecionado] = useState<ServicoItem | null>(null)

    useEffect(() => {
        fetch('/api/cidades')
            .then(r => r.json())
            .then(d => { setCidades(d.cidades || []); setLoadingCidades(false) })
            .catch(() => setLoadingCidades(false))
    }, [])

    const cidadesDaUF = uf ? cidades.filter(c => c.uf === uf) : []
    const ufs = Array.from(new Set(cidades.map(c => c.uf))).sort()

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (!cidadeSlug) return
        const path = servicoSelecionado
            ? `/${cidadeSlug}/${servicoSelecionado.slug}`
            : `/${cidadeSlug}`
        router.push(path)
    }

    return (
        <>
            <form className="hero-search" onSubmit={handleSearch}>
                <div className="hs-label">O que você precisa?</div>

                {/* Serviço — abre modal */}
                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="hs-field text-left w-full cursor-pointer hover:bg-white/10 transition-colors"
                >
                    <span className="hs-icon">{servicoSelecionado?.icone || '🔍'}</span>
                    <span className={`flex-1 text-sm ${servicoSelecionado ? 'text-text font-semibold' : 'text-text3'}`}>
                        {servicoSelecionado ? servicoSelecionado.nome : 'Ex: eletricista, pintor...'}
                    </span>
                    {servicoSelecionado && (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setServicoSelecionado(null) }}
                            className="text-text3 font-bold text-base shrink-0"
                        >
                            ×
                        </button>
                    )}
                </button>

                {/* Estado */}
                <div className="hs-field" style={{ marginBottom: 0 }}>
                    <span className="hs-icon">🗺️</span>
                    <select
                        value={uf}
                        onChange={e => { setUf(e.target.value); setCidadeSlug('') }}
                        className="bg-transparent flex-1 outline-none text-sm"
                        style={{ border: 'none' }}
                        disabled={loadingCidades}
                    >
                        <option value="">Selecione o estado</option>
                        {ufs.map(u => (
                            <option key={u} value={u}>{UF_NOMES[u] || u} ({u})</option>
                        ))}
                    </select>
                </div>

                {/* Cidade — só aparece após escolher UF */}
                {uf && (
                    <div className="hs-field" style={{ marginBottom: 0 }}>
                        <span className="hs-icon">📍</span>
                        <select
                            value={cidadeSlug}
                            onChange={e => setCidadeSlug(e.target.value)}
                            className="bg-transparent flex-1 outline-none text-sm"
                            style={{ border: 'none' }}
                        >
                            <option value="">Selecione a cidade</option>
                            {cidadesDaUF.map(c => (
                                <option key={c.slug} value={c.slug}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!cidadeSlug}
                    className="hs-btn mt-2 text-center disabled:opacity-50"
                >
                    {servicoSelecionado ? `Buscar ${servicoSelecionado.nome}` : 'Buscar profissionais'}
                </button>
            </form>

            <ServiceSelectModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={setServicoSelecionado}
                servicos={servicos}
            />
        </>
    )
}
