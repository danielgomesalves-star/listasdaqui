'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ContaPage() {
    const router = useRouter()
    const [ficha, setFicha] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            router.push('/login')
            return
        }

        fetch('/api/painel/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Falha na autenticação')
                return res.json()
            })
            .then(data => {
                setFicha(data.ficha)
                setLoading(false)
            })
            .catch(() => {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                router.push('/login')
            })
    }, [router])

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ refreshToken })
            }).catch(console.error)
        }

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        router.push('/login')
    }

    if (loading) {
        return <div className="flex flex-1 items-center justify-center p-8 bg-white"><div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
    }

    return (
        <div className="flex flex-col flex-1 pb-20 bg-white overflow-y-auto">
            <div className="topbar">
                <div className="tb-row mb-0">
                    <div className="font-black text-text text-[18px] tracking-[-0.5px]">Minha conta</div>
                    <Link href="/" className="logo-sm no-underline text-text">Listas<em className="text-accent not-italic">Daqui</em></Link>
                </div>
            </div>

            <div className="conta-hero">
                <div className="conta-av">{ficha.nome.substring(0, 2).toUpperCase()}</div>
                <div className="conta-info">
                    <div className="conta-name">{ficha.nome}</div>
                    <span className="conta-plan">✓✓ Plano {ficha.plano} · {ficha.cidade.nome}</span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><div className="sc-value">148</div><div className="sc-label">Visualizações mensais</div></div>
                <div className="stat-card"><div className="sc-value">23</div><div className="sc-label">Cliques no WhatsApp</div></div>
                <div className="stat-card"><div className="sc-value">4.9</div><div className="sc-label">Avaliação média</div></div>
                <div className="stat-card"><div className="sc-value">#1</div><div className="sc-label">Posição na cidade</div></div>
                <div className="stat-card"><div className="sc-value">23</div><div className="sc-label">Cliques no WhatsApp</div></div>
                <div className="stat-card"><div className="sc-value">4.9</div><div className="sc-label">Avaliação média</div></div>
                <div className="stat-card"><div className="sc-value">#1</div><div className="sc-label">Posição na cidade</div></div>
            </div>

            <div className="menu-list">
                <Link href={`/${ficha.cidade.slug}/${ficha.servico.slug}/${ficha.slug}`} className="menu-item no-underline">
                    <div className="mi-icon" style={{ background: 'var(--accent-light)' }}>👤</div>
                    <div className="mi-text"><div className="mi-title">Ver meu perfil</div><div className="mi-sub">Como os clientes me veem</div></div>
                    <span className="mi-arrow">›</span>
                </Link>

                <div className="menu-item opacity-50">
                    <div className="mi-icon" style={{ background: '#F0FDF4' }}>✏️</div>
                    <div className="mi-text"><div className="mi-title">Editar dados (em breve)</div><div className="mi-sub">Nome, WhatsApp, foto</div></div>
                    <span className="mi-arrow">›</span>
                </div>

                <div className="menu-item">
                    <div className="mi-icon" style={{ background: 'var(--gold-light)' }}>⭐</div>
                    <div className="mi-text"><div className="mi-title">Avaliações recebidas</div><div className="mi-sub">{ficha._count?.avaliacoes || 0} avaliações</div></div>
                    <span className="mi-arrow">›</span>
                </div>

                <div className="menu-item opacity-50">
                    <div className="mi-icon" style={{ background: 'var(--red-light)' }}>💳</div>
                    <div className="mi-text"><div className="mi-title">Plano e pagamento</div><div className="mi-sub">{ficha.plano}</div></div>
                    <span className="mi-badge">Em dia</span>
                    <span className="mi-arrow">›</span>
                </div>

                <div onClick={handleLogout} className="menu-item border-b-0 cursor-pointer">
                    <div className="mi-icon" style={{ background: 'var(--red-light)' }}>🚪</div>
                    <div className="mi-text"><div className="mi-title" style={{ color: 'var(--red)' }}>Sair</div><div className="mi-sub">Encerrar sessão</div></div>
                    <span className="mi-arrow">›</span>
                </div>
            </div>

            <div className="footer mt-4">
                <div className="f-logo">Listas<em>Daqui</em></div>
                <div className="f-sub">O guia de prestadores de serviço do Brasil</div>
                <div className="f-copy">© 2026 ListasDaqui</div>
            </div>
        </div>
    )
}
