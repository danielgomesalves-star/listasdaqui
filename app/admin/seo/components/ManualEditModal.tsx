'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface FAQItem {
    pergunta: string;
    resposta: string;
}

interface ManualEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        servicoId: string;
        cidadeId: string;
        servicoNome: string;
        cidadeNome: string;
        uf: string;
        titulo?: string;
        descricao?: string;
        precoMin?: number;
        precoMax?: number;
        status: string;
        faqJson?: any;
    } | null;
    onSuccess: () => void;
}

export default function ManualEditModal({ isOpen, onClose, item, onSuccess }: ManualEditModalProps) {
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        precoMin: 50,
        precoMax: 300,
        faq: [] as FAQItem[]
    })

    useEffect(() => {
        if (item) {
            setFormData({
                titulo: item.titulo || '',
                descricao: item.descricao || '',
                precoMin: item.precoMin || 50,
                precoMax: item.precoMax || 300,
                faq: Array.isArray(item.faqJson) ? item.faqJson : []
            })
        }
    }, [item])

    if (!isOpen || !item) return null

    const handleGenerateAI = async () => {
        setGenerating(true)
        const token = localStorage.getItem('adminToken')

        try {
            const res = await fetch('/api/admin/seo/conteudo/individual', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ servicoId: item.servicoId, cidadeId: item.cidadeId })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Erro na geração')

            const data = json.data
            setFormData({
                titulo: data.titulo,
                descricao: data.descricao,
                precoMin: data.precoMin,
                precoMax: data.precoMax,
                faq: data.faqJson || []
            })
            toast.success('Conteúdo sugerido com sucesso pela IA!')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setGenerating(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        const token = localStorage.getItem('adminToken')

        try {
            const res = await fetch('/api/admin/seo/conteudo/manual', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    servicoId: item.servicoId,
                    cidadeId: item.cidadeId,
                    ...formData
                })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Erro ao salvar')

            toast.success('Salvo com sucesso!')
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const updateFaq = (index: number, field: keyof FAQItem, value: string) => {
        const newFaq = [...formData.faq]
        newFaq[index][field] = value
        setFormData({ ...formData, faq: newFaq })
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
                    <div>
                        <h2 className="text-xl font-black">{item.servicoNome} em {item.cidadeNome}</h2>
                        <p className="text-xs text-text3 font-bold uppercase tracking-tight">Edição Manual de SEO</p>
                    </div>
                    <button onClick={onClose} className="text-text3 hover:text-black font-bold">FECHAR</button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center bg-accent/5 p-4 rounded-xl border border-accent/10">
                        <div className="text-sm">
                            <p className="font-bold text-accent">Sugestão de Conteúdo</p>
                            <p className="text-text3 text-xs">Deixe o Claude escrever a primeira versão para você.</p>
                        </div>
                        <button
                            onClick={handleGenerateAI}
                            disabled={generating}
                            className="bg-accent text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {generating ? 'Gerando...' : '✨ Sugerir com IA'}
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text3 uppercase mb-1">Título SEO (MÁX 160)</label>
                        <input
                            type="text"
                            className="w-full border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={formData.titulo}
                            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text3 uppercase mb-1">Descrição Página</label>
                        <textarea
                            rows={4}
                            className="w-full border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text3 uppercase mb-1">Preço Mín (R$)</label>
                            <input
                                type="number"
                                className="w-full border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                                value={formData.precoMin}
                                onChange={e => setFormData({ ...formData, precoMin: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text3 uppercase mb-1">Preço Máx (R$)</label>
                            <input
                                type="number"
                                className="w-full border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                                value={formData.precoMax}
                                onChange={e => setFormData({ ...formData, precoMax: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text3 uppercase mb-4">Perguntas Frequentes (FAQ)</label>
                        <div className="space-y-4">
                            {formData.faq.map((q, idx) => (
                                <div key={idx} className="bg-bg p-4 rounded-xl border border-border space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Pergunta"
                                        className="w-full bg-white border border-border rounded-lg p-2 text-sm outline-none"
                                        value={q.pergunta}
                                        onChange={e => updateFaq(idx, 'pergunta', e.target.value)}
                                    />
                                    <textarea
                                        placeholder="Resposta"
                                        className="w-full bg-white border border-border rounded-lg p-2 text-sm outline-none"
                                        value={q.resposta}
                                        onChange={e => updateFaq(idx, 'resposta', e.target.value)}
                                    />
                                </div>
                            ))}
                            {formData.faq.length === 0 && (
                                <p className="text-center text-xs text-text3 italic">Nenhuma pergunta cadastrada. Use a IA para sugerir.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-bg/30 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-border px-6 py-3 rounded-xl font-bold text-text3 hover:bg-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    )
}
