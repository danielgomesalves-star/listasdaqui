'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
    servicos: { id: string, nome: string }[],
    cidades: { id: string, nome: string, uf: string }[]
}

export default function CadastroForm({ servicos, cidades }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        nome: '',
        email: '',
        senha: '',
        whatsapp: '',
        cidadeId: '',
        servicoId: '',
        bio: ''
    })

    // The HTML mock had a "plano" selector, we will simulate it visually
    const [plano, setPlano] = useState<'free' | 'verified'>('verified')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Auto-format whatsapp to strictly match the +55... backend Regex
            let wpp = form.whatsapp.replace(/\D/g, '')
            if (wpp.length > 0) {
                if (!wpp.startsWith('55')) wpp = '55' + wpp
                wpp = '+' + wpp
            }

            const res = await fetch('/api/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, whatsapp: wpp })
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.details?.fieldErrors) {
                    const messages = Object.values(data.details.fieldErrors).flat()
                    throw new Error(`Verifique os campos: ${messages.join(' | ')}`)
                }
                throw new Error(data.error || 'Erro ao cadastrar')
            }

            // Success! Auto-login using the credentials they just created
            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, senha: form.senha })
            })

            if (loginRes.ok) {
                const loginData = await loginRes.json()
                localStorage.setItem('accessToken', loginData.accessToken)
            }

            router.push('/sucesso')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* plan selection */}
            <div className="plan-cards">
                <div
                    className={`plan-card ${plano === 'free' ? 'selected' : ''}`}
                    onClick={() => setPlano('free')}
                >
                    <div className="pc-badge" style={{ color: 'var(--text3)' }}>GRATUITO</div>
                    <div className="pc-price">R$0 <small>/mês</small></div>
                    <div className="pc-period">para sempre</div>
                    <div className="pc-feature"><span>✓</span> Ficha básica</div>
                    <div className="pc-feature"><span>✓</span> Aparece na lista</div>
                    <div className="pc-feature" style={{ color: 'var(--text3)' }}><span>✗</span> WhatsApp visível</div>
                    <div className="pc-feature" style={{ color: 'var(--text3)' }}><span>✗</span> Selo verificado</div>
                </div>
                <div
                    className={`plan-card ${plano === 'verified' ? 'selected' : ''}`}
                    onClick={() => setPlano('verified')}
                >
                    <div className="pc-badge" style={{ color: 'var(--accent)' }}>✓ VERIFICADO</div>
                    <div className="pc-price">R$97 <small>/ano</small></div>
                    <div className="pc-period">pagamento anual único</div>
                    <div className="pc-feature" style={{ color: 'var(--accent)' }}><span>✓</span> WhatsApp visível</div>
                    <div className="pc-feature" style={{ color: 'var(--accent)' }}><span>✓</span> Selo ✓✓</div>
                    <div className="pc-feature" style={{ color: 'var(--accent)' }}><span>✓</span> Topo da lista</div>
                    <div className="pc-feature" style={{ color: 'var(--accent)' }}><span>✓</span> Instagram linkado</div>
                </div>
            </div>

            {/* perks */}
            <div className="perks">
                <div className="perk">
                    <div className="perk-icon">⚡</div>
                    <div className="perk-text"><div className="pt1">Receba clientes pelo WhatsApp</div><div className="pt2">Seu número aparece em destaque para quem busca seu serviço</div></div>
                </div>
                <div className="perk">
                    <div className="perk-icon">🏅</div>
                    <div className="perk-text"><div className="pt1">Selo de verificado</div><div className="pt2">Passa mais confiança e você aparece antes dos não verificados</div></div>
                </div>
            </div>

            {/* form */}
            <div className="cad-form">
                <div className="text-[13px] font-bold text-text mb-4">Preencha seus dados de acesso (Novo Usuário)</div>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 font-semibold">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">E-mail *</label>
                        <input required type="email" className="form-input" placeholder="seu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Crie uma Senha *</label>
                        <input required type="password" minLength={8} className="form-input" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} />
                    </div>

                    <div className="h-px bg-border my-6"></div>
                    <div className="text-[13px] font-bold text-text mb-4">Dados da sua Ficha Pública</div>

                    <div className="form-group">
                        <label className="form-label">Ramo de atividade *</label>
                        <select required className="form-input" value={form.servicoId} onChange={e => setForm({ ...form, servicoId: e.target.value })}>
                            <option value="">Selecione o serviço</option>
                            {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nome comercial *</label>
                        <input required type="text" className="form-input" placeholder="Ex: João Ricardo Elétrica" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">WhatsApp *</label>
                        <input required type="tel" className="form-input" placeholder="+5561999999999" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
                        <div className="form-hint">No formato +55 seguido pelo DDD e número. Será exibido apenas para clientes com plano verificado.</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sua Cidade de Atuação *</label>
                        <select required className="form-input" value={form.cidadeId} onChange={e => setForm({ ...form, cidadeId: e.target.value })}>
                            <option value="">Selecione a cidade</option>
                            {cidades.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.uf}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sobre você (opcional)</label>
                        <textarea className="form-input" rows={3} placeholder="Ex: Profissional com 10 anos de experiência..." style={{ resize: 'none' }} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}></textarea>
                    </div>

                    <button type="submit" disabled={loading} className="form-submit disabled:opacity-50">
                        {loading ? 'Cadastrando...' : 'Cadastrar agora →'}
                    </button>
                    <div className="text-[11px] text-text3 text-center mt-2.5">Ao cadastrar, você concorda com nossos <a href="#" className="text-accent underline">Termos de Uso</a></div>
                </form>
            </div>
        </>
    )
}
