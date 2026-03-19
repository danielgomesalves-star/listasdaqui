'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Credenciais inválidas')
            }

            localStorage.setItem('accessToken', data.accessToken)
            // Idealmente salvar o refreshToken em cookies HTTP Only para maior segurança, 
            // mas para este protótipo PWA salvar localmente resolve.
            localStorage.setItem('refreshToken', data.refreshToken)

            router.push('/conta')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col flex-1 pb-16 bg-white overflow-y-auto w-full">
            <div className="cad-hero" style={{ paddingBottom: '32px' }}>
                <div className="flex justify-between items-center mb-4">
                    <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 text-white no-underline shrink-0">←</Link>
                    <span className="text-sm font-black text-white tracking-tight">Listas<em className="text-[#7DD3FC] not-italic">Daqui</em></span>
                </div>
                <h2 className="text-[22px] font-black text-white leading-tight mb-2 tracking-tight">Acesse seu Painel</h2>
                <p className="text-[14px] text-white/80 leading-relaxed">Gerencie seu perfil, edite visualizações e veja métricas</p>
            </div>

            <div className="cad-form" style={{ marginTop: '-16px' }}>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 font-semibold">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input required type="email" className="form-input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Senha</label>
                        <input required type="password" minLength={8} className="form-input" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} />
                    </div>

                    <button type="submit" disabled={loading} className="form-submit disabled:opacity-50 mt-2">
                        {loading ? 'Entrando...' : 'Entrar →'}
                    </button>

                    <div className="text-[13px] text-text3 text-center mt-5">
                        Ainda não tem cadastro? <Link href="/cadastro" className="text-accent underline font-bold">Anuncie seu serviço</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
