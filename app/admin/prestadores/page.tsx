'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ModeraPrestadores() {
    const router = useRouter()
    const [data, setData] = useState<any[]>([])
    const [filter, setFilter] = useState('pendentes')
    const [loading, setLoading] = useState(true)

    async function fetchPrestadores(status: string) {
        setLoading(true)
        const token = localStorage.getItem('adminToken')
        if (!token) return

        try {
            const res = await fetch(`/api/admin/prestadores?status=${status}&porPagina=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Falha na autenticacao')
            const json = await res.json()
            setData(json.prestadores || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrestadores(filter)
    }, [filter])

    const handleAction = async (id: string, action: 'aprovar' | 'bloquear') => {
        const token = localStorage.getItem('adminToken')

        let url = `/api/admin/prestadores/${id}/aprovar`
        let body: any = {}

        if (action === 'bloquear') {
            const motivo = prompt('Motivo do bloqueio:')
            if (!motivo) return
            url = `/api/admin/prestadores/${id}/bloquear-ficha`
            body = { motivo }
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
            })

            if (res.ok) {
                // Refresh local view
                setData(data.filter(p => action === 'aprovar' ? filter !== 'pendentes' : p.id !== id))
                if (action === 'aprovar' && filter === 'pendentes') alert('Aprovado com sucesso!')
            } else {
                alert('Falha ao executar ação.')
            }
        } catch {
            alert('Erro de conexão')
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-black mb-8 tracking-tight">Moderação de Fichas</h1>

            <div className="flex gap-2 mb-6">
                <button onClick={() => setFilter('pendentes')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'pendentes' ? 'bg-orange-500 text-white' : 'bg-white border border-border text-text3'}`}>Pendentes (Aprovação)</button>
                <button onClick={() => setFilter('ativos')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'ativos' ? 'bg-green-600 text-white' : 'bg-white border border-border text-text3'}`}>Ativos Visíveis</button>
                <button onClick={() => setFilter('bloqueados')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'bloqueados' ? 'bg-red-500 text-white' : 'bg-white border border-border text-text3'}`}>Bloqueados / Suspensos</button>
            </div>

            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center font-bold text-text3">Carregando fichas...</div>
                ) : data.length === 0 ? (
                    <div className="p-10 text-center font-bold text-text3">Nenhuma ficha encontrada neste filtro.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-bg text-text3 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Prestador</th>
                                <th className="p-4">Serviço / Cidade</th>
                                <th className="p-4">Plano</th>
                                <th className="p-4">Data Cadastro</th>
                                <th className="p-4 text-right">Ações Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {data.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-base">{p.nome}</div>
                                        <div className="text-text3 text-xs">{p.user?.email || p.whatsapp}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-bg px-2 py-1 rounded-md mb-1 inline-block font-semibold">{p.servico?.nome}</span><br />
                                        <span className="text-text3 text-xs">{p.cidade?.nome} - {p.cidade?.uf}</span>
                                    </td>
                                    <td className="p-4 font-bold">
                                        {p.plano === 'GRATUITO' ? 'GRATUITO' : <span className="text-accent">⭐ {p.plano}</span>}
                                    </td>
                                    <td className="p-4 text-text3">
                                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {p.aprovado === false && (
                                            <button onClick={() => handleAction(p.id, 'aprovar')} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200">Aprovar</button>
                                        )}
                                        {p.ativo === true && (
                                            <button onClick={() => handleAction(p.id, 'bloquear')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100">Bloquear Ficha</button>
                                        )}
                                        <a href={`/${p.cidade?.slug}/${p.servico?.slug}/${p.slug}`} target="_blank" className="inline-block border border-border px-3 py-1.5 rounded-lg font-bold hover:bg-bg text-text3">🌐 Ver</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
