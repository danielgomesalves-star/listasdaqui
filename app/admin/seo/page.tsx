'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import ManualEditModal from './components/ManualEditModal'

const BASE_URL = 'https://listasdaqui.com.br'

async function fetchConteudo(filter: string, pagina: number = 1) {
    const token = localStorage.getItem('adminToken')
    if (!token) throw new Error('Não autenticado')

    const res = await fetch(`/api/admin/seo/conteudo?status=${filter}&porPagina=50&pagina=${pagina}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Falha ao consultar banco')
    return json
}

export default function SeoManagerPage() {
    const [filter, setFilter] = useState('todos')
    const [pagina, setPagina] = useState(1)
    const [itens, setItens] = useState<any[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery({
        queryKey: ['seo-conteudo', filter, pagina],
        queryFn: () => fetchConteudo(filter, pagina),
    })

    useEffect(() => {
        if (data?.itens) {
            if (pagina === 1) {
                setItens(data.itens)
            } else {
                setItens(prev => [...prev, ...data.itens])
            }
        }
    }, [data, pagina])

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter)
        setPagina(1)
        setItens([])
        setSelected(new Set())
    }

    const toggleSelect = (key: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selected.size === itens.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(itens.map((p: any) => `${p.servicoId}:${p.cidadeId}`)))
        }
    }

    const generateMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('adminToken')
            const res = await fetch('/api/admin/seo/conteudo/gerar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ modo: 'ia' })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Erro ao gerar')
            return json
        },
        onSuccess: (data) => {
            toast.success(data.message)
            queryClient.invalidateQueries({ queryKey: ['seo-conteudo'] })
        },
        onError: (err: Error) => toast.error(err.message)
    })

    const generateSelectedMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('adminToken')
            const alvos = itens
                .filter((p: any) => selected.has(`${p.servicoId}:${p.cidadeId}`))
                .map((p: any) => ({ servicoId: p.servicoId, cidadeId: p.cidadeId }))

            let ok = 0
            for (const alvo of alvos) {
                const res = await fetch('/api/admin/seo/conteudo/individual', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(alvo)
                })
                if (res.ok) ok++
            }
            return ok
        },
        onSuccess: (ok) => {
            toast.success(`${ok} página(s) geradas com sucesso!`)
            setSelected(new Set())
            queryClient.invalidateQueries({ queryKey: ['seo-conteudo'] })
        },
        onError: (err: Error) => toast.error(err.message)
    })

    const stats = data?.stats || { totalGeradas: 0, totalFaltando: 0 }
    const percentual = Math.round((stats.totalGeradas / Math.max(1, stats.totalGeradas + stats.totalFaltando)) * 100) || 0
    const allSelected = itens.length > 0 && selected.size === itens.length

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Content Factory (SEO)</h1>
                    <p className="text-text3 text-sm font-semibold max-w-xl">Gerencie as páginas otimizadas para busca local geradas via Inteligência Artificial.</p>
                </div>

                <div className="flex gap-2">
                    {selected.size > 0 && (
                        <button
                            onClick={() => generateSelectedMutation.mutate()}
                            disabled={generateSelectedMutation.isPending}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {generateSelectedMutation.isPending
                                ? 'Gerando...'
                                : `✨ Gerar ${selected.size} selecionado(s)`}
                        </button>
                    )}
                    <button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending || stats.totalFaltando === 0}
                        className="bg-accent text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-black transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {generateMutation.isPending ? 'Gerando com IA...' : '✨ Iniciar Geração em Lote'}
                    </button>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-8">Erro de carregamento: {(error as Error).message}</div>
            ) : (
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm mb-8">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-2">
                        <span>Progresso da Indexação Global</span>
                        <span className={percentual === 100 ? 'text-green-500' : 'text-accent'}>{percentual}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-4 mb-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-accent to-blue-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${percentual}%` }}></div>
                    </div>
                    <div className="flex gap-8 text-sm">
                        <div><span className="w-3 h-3 inline-block rounded-full bg-green-500 mr-2"></span><strong className="text-lg">{stats.totalGeradas}</strong> combinadas com conteúdo</div>
                        <div><span className="w-3 h-3 inline-block rounded-full bg-orange-300 mr-2"></span><strong className="text-lg">{stats.totalFaltando}</strong> faltando a IA escrever</div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 mb-6">
                <button onClick={() => handleFilterChange('todos')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'todos' ? 'bg-text text-white' : 'bg-white border border-border text-text3'}`}>Ver Todos</button>
                <button onClick={() => handleFilterChange('faltando')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'faltando' ? 'bg-orange-500 text-white' : 'bg-white border border-border text-text3'}`}>Faltando Conteúdo</button>
                <button onClick={() => handleFilterChange('gerado')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'gerado' ? 'bg-green-600 text-white' : 'bg-white border border-border text-text3'}`}>Indexadas (Prontas)</button>
            </div>

            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="p-10 text-center font-bold text-text3 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4"></div>
                        Lendo banco de dados...
                    </div>
                ) : itens.length === 0 ? (
                    <div className="p-10 text-center font-bold text-text3">Nenhuma página encontrada com este filtro.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-bg text-text3 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 accent-accent cursor-pointer"
                                        title="Selecionar todos"
                                    />
                                </th>
                                <th className="p-4">Alvo URL</th>
                                <th className="p-4">Meta Title (SEO)</th>
                                <th className="p-4 w-32 text-center">Status</th>
                                <th className="p-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {itens.map((p: any, i: number) => {
                                const key = `${p.servicoId}:${p.cidadeId}`
                                const url = `/${p.cidadeSlug}/${p.servicoSlug}/`
                                const fullUrl = `${BASE_URL}${url}`
                                const isChecked = selected.has(key)

                                return (
                                    <tr key={i} className={`hover:bg-gray-50 transition-colors ${isChecked ? 'bg-blue-50' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleSelect(key)}
                                                className="w-4 h-4 accent-accent cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4 font-mono text-xs text-text2 max-w-[220px]">
                                            <span className="break-all">{url}</span>
                                        </td>
                                        <td className="p-4 text-text3 truncate max-w-[220px]">
                                            {p.status === 'gerado' ? p.titulo : <span className="opacity-40 italic">Aguardando IA...</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            {p.status === 'gerado' ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">✓ PRONTO</span>
                                            ) : (
                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">⏳ FALTANDO</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <a
                                                    href={fullUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-bg border border-border px-3 py-1.5 rounded-lg font-bold hover:bg-white text-text3 text-xs transition-colors"
                                                    title="Abrir página"
                                                >
                                                    ↗
                                                </a>
                                                <button
                                                    onClick={() => { setSelectedItem(p); setIsModalOpen(true) }}
                                                    className="bg-bg border border-border px-3 py-1.5 rounded-lg font-bold hover:bg-white text-text3 text-xs transition-colors"
                                                >
                                                    {p.status === 'gerado' ? 'Editar' : '✨ Gerar'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {data?.totalPaginas > pagina && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => setPagina(prev => prev + 1)}
                        disabled={isLoading}
                        className="bg-white border border-border px-8 py-3 rounded-xl font-bold text-text3 hover:bg-bg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-3"
                    >
                        {isLoading && <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>}
                        Carregar Mais (+50 itens)
                    </button>
                </div>
            )}

            <ManualEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['seo-conteudo'] })}
            />
        </div>
    )
}
