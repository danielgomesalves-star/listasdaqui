'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isClient, setIsClient] = useState(false)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        setIsClient(true)
        const storedToken = localStorage.getItem('adminToken')

        // Rota de login livre de proteção
        if (pathname === '/admin/login') {
            if (storedToken) router.push('/admin/dashboard') // ja ta logado
            return
        }

        if (!storedToken) {
            router.push('/admin/login')
        } else {
            setToken(storedToken)
        }
    }, [pathname, router])

    if (!isClient) return <div className="min-h-screen bg-bg flex items-center justify-center font-bold">Verificando segurança...</div>

    // Tela de Login não tem Sidebar
    if (pathname === '/admin/login') {
        return <div className="min-h-screen bg-bg text-text">{children}</div>
    }

    // Sidebar visível apenas se logado
    if (!token) return <div className="min-h-screen bg-bg"></div>

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminData')
        router.push('/admin/login')
    }

    return (
        <div className="min-h-screen bg-bg flex flex-col md:flex-row text-text font-sans">
            {/* Sidebar sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-border flex flex-col shadow-sm">
                <div className="p-6 border-b border-border">
                    <div className="text-xl font-black tracking-tight flex items-center gap-2">
                        <div className="w-6 h-6 bg-accent rounded text-white flex items-center justify-center text-xs">LD</div>
                        Super Admin
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin/dashboard" className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${pathname === '/admin/dashboard' ? 'bg-bg text-accent' : 'text-text3 hover:bg-gray-50'}`}>
                        Visão Geral (KPIs)
                    </Link>
                    <Link href="/admin/prestadores" className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${pathname.startsWith('/admin/prestadores') ? 'bg-bg text-accent' : 'text-text3 hover:bg-gray-50'}`}>
                        Moderação (Prestadores)
                    </Link>
                    <Link href="/admin/seo" className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${pathname.startsWith('/admin/seo') ? 'bg-bg text-accent' : 'text-text3 hover:bg-gray-50'}`}>
                        Geração de Conteúdo SEO
                    </Link>
                    <Link href="/admin/configuracoes" className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${pathname.startsWith('/admin/configuracoes') ? 'bg-bg text-accent' : 'text-text3 hover:bg-gray-50'}`}>
                        ⚙️ Configurações de IA
                    </Link>
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden bg-bg/30">
                <div className="p-6 md:p-10 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
