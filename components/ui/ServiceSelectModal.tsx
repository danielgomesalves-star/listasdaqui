'use client'

import { useState, useEffect } from 'react'

export type ServicoItem = { slug: string; nome: string; icone?: string | null }

export function ServiceSelectModal({
    isOpen,
    onClose,
    onSelect,
    servicos,
    title = 'Que serviço você precisa?'
}: {
    isOpen: boolean
    onClose: () => void
    onSelect: (s: ServicoItem) => void
    servicos: ServicoItem[]
    title?: string
}) {
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (!isOpen) setSearch('')
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const filtered = search.trim()
        ? servicos.filter(s => s.nome.toLowerCase().includes(search.toLowerCase()))
        : servicos

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col"
                style={{ maxHeight: '80vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-black text-text">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-bg2 text-text3 font-bold text-lg hover:bg-border transition-colors"
                        >
                            ×
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-bg2 rounded-xl px-3 py-2.5 border border-border">
                        <span className="text-text3 text-sm">🔍</span>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Pesquisar serviço..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-text placeholder:text-text3"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-text3 text-sm font-bold">×</button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="overflow-y-auto flex-1 p-4">
                    {filtered.length === 0 ? (
                        <p className="text-center text-text3 text-sm py-8">Nenhum serviço encontrado</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {filtered.map(s => (
                                <button
                                    key={s.slug}
                                    onClick={() => { onSelect(s); onClose() }}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-bg2 border border-border hover:border-accent hover:bg-accent/5 active:scale-95 transition-all text-left"
                                >
                                    <span className="text-xl shrink-0">{s.icone || '🔧'}</span>
                                    <span className="text-sm font-semibold text-text leading-tight">{s.nome}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
