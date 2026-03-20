'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

type Configs = {
    ANTHROPIC_API_KEY?: string
    OPENAI_API_KEY?: string
    AI_PROVIDER?: string
}

export default function ConfiguracoesPage() {
    const [configs, setConfigs] = useState<Configs>({})
    const [anthropicKey, setAnthropicKey] = useState('')
    const [openaiKey, setOpenaiKey] = useState('')
    const [provider, setProvider] = useState<'anthropic' | 'openai'>('anthropic')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAnthropicKey, setShowAnthropicKey] = useState(false)
    const [showOpenaiKey, setShowOpenaiKey] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        fetch('/api/admin/configuracoes', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const c: Configs = data.configuracoes || {}
                setConfigs(c)
                setProvider((c.AI_PROVIDER as 'anthropic' | 'openai') || 'anthropic')
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        setSaving(true)
        const token = localStorage.getItem('adminToken')
        const payload: Record<string, string> = {
            AI_PROVIDER: provider,
        }
        if (anthropicKey) payload.ANTHROPIC_API_KEY = anthropicKey
        if (openaiKey) payload.OPENAI_API_KEY = openaiKey

        try {
            const res = await fetch('/api/admin/configuracoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Erro ao salvar')
            toast.success('Configurações salvas com sucesso!')
            setAnthropicKey('')
            setOpenaiKey('')
        } catch {
            toast.error('Erro ao salvar configurações')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-text tracking-tight">Configurações de IA</h1>
                <p className="text-text3 text-sm mt-1">Gerencie as chaves de API e o provedor de IA ativo.</p>
            </div>

            {/* Provedor Ativo */}
            <div className="bg-white rounded-2xl border border-border p-6 mb-4 shadow-sm">
                <h2 className="text-sm font-bold text-text uppercase tracking-wider mb-4">Provedor Ativo</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setProvider('anthropic')}
                        className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${provider === 'anthropic' ? 'border-accent bg-accent/5' : 'border-border hover:border-text2'}`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${provider === 'anthropic' ? 'border-accent' : 'border-border'}`}>
                            {provider === 'anthropic' && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-text text-sm">Anthropic</div>
                            <div className="text-text3 text-xs">Claude Sonnet / Haiku</div>
                        </div>
                        <span className="ml-auto text-lg">🟠</span>
                    </button>

                    <button
                        onClick={() => setProvider('openai')}
                        className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${provider === 'openai' ? 'border-accent bg-accent/5' : 'border-border hover:border-text2'}`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${provider === 'openai' ? 'border-accent' : 'border-border'}`}>
                            {provider === 'openai' && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-text text-sm">OpenAI</div>
                            <div className="text-text3 text-xs">GPT-4o / GPT-4 Turbo</div>
                        </div>
                        <span className="ml-auto text-lg">🟢</span>
                    </button>
                </div>
            </div>

            {/* Anthropic Key */}
            <div className="bg-white rounded-2xl border border-border p-6 mb-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🟠</span>
                    <h2 className="text-sm font-bold text-text uppercase tracking-wider">Anthropic API Key</h2>
                    {configs.ANTHROPIC_API_KEY && (
                        <span className="ml-auto text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">✓ Configurada</span>
                    )}
                </div>
                {configs.ANTHROPIC_API_KEY && (
                    <div className="bg-bg2 rounded-lg px-3 py-2 text-xs text-text3 font-mono mb-3">
                        Atual: <span className="text-text2">{configs.ANTHROPIC_API_KEY}</span>
                    </div>
                )}
                <div className="relative">
                    <input
                        type={showAnthropicKey ? 'text' : 'password'}
                        value={anthropicKey}
                        onChange={e => setAnthropicKey(e.target.value)}
                        placeholder="sk-ant-... (deixe em branco para manter a atual)"
                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-mono text-text bg-bg2 outline-none focus:border-accent transition-colors pr-16"
                    />
                    <button
                        type="button"
                        onClick={() => setShowAnthropicKey(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 text-xs font-semibold hover:text-text transition-colors"
                    >
                        {showAnthropicKey ? 'Ocultar' : 'Ver'}
                    </button>
                </div>
                <p className="text-xs text-text3 mt-2">
                    Obtenha em <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">console.anthropic.com</a>
                </p>
            </div>

            {/* OpenAI Key */}
            <div className="bg-white rounded-2xl border border-border p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🟢</span>
                    <h2 className="text-sm font-bold text-text uppercase tracking-wider">OpenAI API Key</h2>
                    {configs.OPENAI_API_KEY && (
                        <span className="ml-auto text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">✓ Configurada</span>
                    )}
                </div>
                {configs.OPENAI_API_KEY && (
                    <div className="bg-bg2 rounded-lg px-3 py-2 text-xs text-text3 font-mono mb-3">
                        Atual: <span className="text-text2">{configs.OPENAI_API_KEY}</span>
                    </div>
                )}
                <div className="relative">
                    <input
                        type={showOpenaiKey ? 'text' : 'password'}
                        value={openaiKey}
                        onChange={e => setOpenaiKey(e.target.value)}
                        placeholder="sk-... (deixe em branco para manter a atual)"
                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-mono text-text bg-bg2 outline-none focus:border-accent transition-colors pr-16"
                    />
                    <button
                        type="button"
                        onClick={() => setShowOpenaiKey(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 text-xs font-semibold hover:text-text transition-colors"
                    >
                        {showOpenaiKey ? 'Ocultar' : 'Ver'}
                    </button>
                </div>
                <p className="text-xs text-text3 mt-2">
                    Obtenha em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-accent underline">platform.openai.com/api-keys</a>
                </p>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-text text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {saving ? (
                    <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Salvando...
                    </>
                ) : (
                    '💾 Salvar Configurações'
                )}
            </button>

            <p className="text-center text-xs text-text3 mt-3">
                As chaves são armazenadas de forma segura no banco de dados.
            </p>
        </div>
    )
}
