'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ManualRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ManualRegistrationModal({ isOpen, onClose, onSuccess }: ManualRegistrationModalProps) {
    const [loading, setLoading] = useState(false)
    const [cidades, setCidades] = useState<any[]>([])
    const [servicos, setServicos] = useState<any[]>([])

    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        instagram: '',
        bio: '',
        email: '',
        cidadeId: '',
        servicoId: ''
    })

    useEffect(() => {
        if (isOpen) {
            // carregar cidades e servicos
            fetchOpcoes()
        }
    }, [isOpen])

    async function fetchOpcoes() {
        try {
            const token = localStorage.getItem('adminToken')
            const res = await fetch('/api/admin/prestadores/opcoes', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCidades(data.cidades || [])
                setServicos(data.servicos || [])
            }
        } catch (e) {
            console.error(e)
            toast.error('Erro ao carregar opcoes')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('adminToken')
            const res = await fetch('/api/admin/prestadores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Prestador cadastrado com sucesso!')
                onSuccess()
                onClose()
            } else {
                toast.error(data.error || 'Erro ao cadastrar')
            }
        } catch (e: any) {
            toast.error(e.message || 'Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50 sticky top-0 z-10 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-black">Cadastrar Prestador Manualmente</h2>
                        <p className="text-xs text-text3 font-bold uppercase tracking-tight">Criação Rápida de Ficha</p>
                    </div>
                    <button onClick={onClose} className="text-text3 hover:text-black font-bold text-sm">FECHAR</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text2 uppercase mb-1">Nome Completo / Empresa *</label>
                            <input required name="nome" value={formData.nome} onChange={handleChange} className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Ex: João Encanador" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text2 uppercase mb-1">E-mail (Login) *</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="joao@email.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text2 uppercase mb-1">WhatsApp *</label>
                            <input required name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="11999999999" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text2 uppercase mb-1">Instagram (opcional)</label>
                            <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="@joao_encanador" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text2 uppercase mb-1">Serviço *</label>
                            <select required name="servicoId" value={formData.servicoId} onChange={handleChange} className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none">
                                <option value="">Selecione um serviço</option>
                                {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text2 uppercase mb-1">Cidade *</label>
                            <select required name="cidadeId" value={formData.cidadeId} onChange={handleChange} className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none">
                                <option value="">Selecione uma cidade</option>
                                {cidades.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.uf}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text2 uppercase mb-1">Biografia (opcional)</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Pequena descrição ou resumo sobre os serviços oferecidos..." />
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-text2 hover:bg-bg transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-black text-white px-8 py-2.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors">
                            {loading ? 'Cadastrando...' : 'Cadastrar Prestador'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
