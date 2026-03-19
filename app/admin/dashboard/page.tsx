'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

async function fetchDashboardData(router: any) {
    const token = localStorage.getItem('adminToken')
    if (!token) {
        router.push('/admin/login')
        throw new Error('Not authenticated')
    }

    const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
        throw new Error('Unauthorized')
    }

    return res.json()
}

export default function Dashboard() {
    const router = useRouter()

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: () => fetchDashboardData(router),
        refetchInterval: 30000, // Poll every 30s
    })

    if (error) return <div className="p-4 text-red-500 font-bold bg-red-50 rounded-lg">{(error as Error).message}</div>
    if (isLoading || !data) return (
        <div className="animate-pulse flex items-center gap-3 font-bold text-text3 p-10">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            Carregando painel de métricas...
        </div>
    )

    return (
        <div>
            <h1 className="text-3xl font-black mb-8 tracking-tight">Estatísticas do Sistema</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KpiCard title="Total Prestadores" value={data.prestadores.total} />
                <KpiCard title="Ativos" value={data.prestadores.ativos} color="text-green-600" />
                <KpiCard title="Fila de Aprovação" value={data.prestadores.pendentes} color="text-orange-500" highlight />
                <KpiCard title="Bloqueados" value={data.prestadores.bloqueados} color="text-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Receita */}
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-sm font-bold text-text3 uppercase mb-4 tracking-wider flex items-center gap-2">💰 Faturamento (Estimado)</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-text3">MRR (Recorrente Mensal)</div>
                            <div className="text-2xl font-black text-accent">R$ {data.receita.mrr.toLocaleString('pt-BR')}</div>
                        </div>
                        <div>
                            <div className="text-xs text-text3">ARR (Anualizado)</div>
                            <div className="text-xl font-bold">R$ {data.receita.arr.toLocaleString('pt-BR')}</div>
                        </div>
                        <div className="pt-4 border-t border-border mt-4 flex justify-between">
                            <span className="text-xs text-text3">Planos Vendidos</span>
                            <span className="text-xs font-bold">{data.prestadores.porPlano?.VERIFICADO + data.prestadores.porPlano?.DESTAQUE || 0} assinaturas</span>
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-sm font-bold text-text3 uppercase mb-4 tracking-wider">🔍 Páginas SEO Geradas</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-text3">Concluídas (SSG)</div>
                            <div className="text-2xl font-black text-green-600">{data.conteudo.paginasGeradas} <span className="text-sm font-normal text-text3">páginas</span></div>
                        </div>
                        <div>
                            <div className="text-xs text-text3">Faltando Gerar IA</div>
                            <div className="text-xl font-bold">{data.conteudo.paginasFaltando}</div>
                        </div>

                        <div className="w-full bg-border rounded-full h-2.5 mt-4">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(data.conteudo.paginasGeradas / Math.max(1, data.conteudo.paginasGeradas + data.conteudo.paginasFaltando)) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Moderação Opeacional */}
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm overflow-hidden relative group">
                    <h2 className="text-sm font-bold text-text3 uppercase mb-4 tracking-wider">⚠️ Moderação Avaliações</h2>

                    <div className="space-y-4 relative z-10">
                        <div>
                            <div className="text-xs text-text3">Pendentes de aprovação</div>
                            <div className={`text-2xl font-black ${data.avaliacoes.pendentes > 0 ? 'text-orange-500' : 'text-text'}`}>{data.avaliacoes.pendentes}</div>
                        </div>
                        <div>
                            <div className="text-xs text-text3">Aprovadas no total</div>
                            <div className="text-xl font-bold">{data.avaliacoes.aprovadas}</div>
                        </div>
                    </div>

                    <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 group-hover:scale-110 transition-transform duration-500">⭐</div>
                </div>

            </div>
        </div>
    )
}

function KpiCard({ title, value, color = 'text-text', highlight = false }: { title: string, value: string | number, color?: string, highlight?: boolean }) {
    return (
        <div className={`bg-white hover:bg-gray-50 transition-colors border ${highlight && value && Number(value) > 0 ? 'border-orange-200 bg-orange-50' : 'border-border'} rounded-xl p-6 shadow-sm`}>
            <div className="text-xs font-bold text-text3 uppercase mb-2 tracking-wider">{title}</div>
            <div className={`text-4xl font-black ${color}`}>{value}</div>
        </div>
    )
}
