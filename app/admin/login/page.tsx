'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Erro interno')
            }

            localStorage.setItem('adminToken', data.token)
            localStorage.setItem('adminData', JSON.stringify(data.admin))

            router.push('/admin/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-border w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 bg-accent rounded-xl text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">A</div>
                    <h1 className="text-2xl font-black">Admin Restrito</h1>
                    <p className="text-text3 text-sm mt-1">Acesso exclusivo ListasDaqui</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold mb-6">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text3 mb-1.5 uppercase">E-mail Operacional</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            placeholder="admin@listasdaqui.com.br"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text3 mb-1.5 uppercase">Senha</label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-text text-white font-bold text-sm py-4 rounded-xl mt-4 hover:bg-black transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Autenticando...' : 'Entrar no painel →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
