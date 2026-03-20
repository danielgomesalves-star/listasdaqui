'use client'

import { toast } from 'sonner'

interface ModerationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    prestador: any;
    onAction: (action: 'aprovar' | 'bloquear', id: string, motivo?: string) => void;
}

export default function ModerationDetailsModal({ isOpen, onClose, prestador, onAction }: ModerationDetailsModalProps) {
    if (!isOpen || !prestador) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50 sticky top-0 z-10 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-black">{prestador.nome}</h2>
                        <p className="text-xs text-text3 font-bold uppercase tracking-tight">Detalhamento da Ficha</p>
                    </div>
                    <button onClick={onClose} className="text-text3 hover:text-black font-bold text-sm">FECHAR</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Cabeçalho de Status */}
                    <div className="flex gap-4">
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${prestador.aprovado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {prestador.aprovado ? '✓ Aprovado' : '⏳ Pendente de Aprovação'}
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${prestador.ativo ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {prestador.ativo ? '🌐 Visível' : '🚫 Oculto/Bloqueado'}
                        </div>
                        <div className="px-4 py-2 bg-bg border border-border rounded-xl text-xs font-bold uppercase tracking-widest text-text3">
                            ⭐ Plano {prestador.plano}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Imagem / Avatar */}
                        <div>
                            <label className="block text-[10px] font-black text-text3 uppercase mb-2">Foto de Perfil</label>
                            {prestador.foto ? (
                                <img src={prestador.foto} alt={prestador.nome} className="w-full aspect-square rounded-2xl object-cover border border-border shadow-sm" />
                            ) : (
                                <div className="w-full aspect-square rounded-2xl bg-bg border border-dashed border-border flex items-center justify-center text-text3 font-bold">Sem foto</div>
                            )}
                        </div>

                        {/* Informações de Contato */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-text3 uppercase mb-1">E-mail do Usuário</label>
                                <div className="font-bold text-sm bg-bg p-3 rounded-lg border border-border">{prestador.user?.email || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text3 uppercase mb-1">WhatsApp</label>
                                <div className="font-bold text-sm bg-bg p-3 rounded-lg border border-border">{prestador.whatsapp}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text3 uppercase mb-1">Instagram / Social</label>
                                <div className="font-bold text-sm bg-bg p-3 rounded-lg border border-border">{prestador.instagram || 'Não informado'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-[10px] font-black text-text3 uppercase mb-1">Biografia / Descrição</label>
                        <div className="text-sm bg-bg p-4 rounded-xl border border-border whitespace-pre-wrap leading-relaxed italic text-text2">
                            {prestador.bio || 'Sem biografia informada.'}
                        </div>
                    </div>

                    {/* Metadados */}
                    <div className="grid grid-cols-2 gap-4 bg-bg/50 p-4 rounded-xl border border-border border-dashed">
                        <div>
                            <label className="block text-[10px] font-black text-text3 uppercase mb-1">Localização</label>
                            <div className="font-bold text-xs">{prestador.cidade?.nome} - {prestador.cidade?.uf}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text3 uppercase mb-1">Serviço</label>
                            <div className="font-bold text-xs">{prestador.servico?.nome}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text3 uppercase mb-1">Slug da Ficha</label>
                            <div className="font-mono text-[10px]">{prestador.slug}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text3 uppercase mb-1">Cadastrado em</label>
                            <div className="font-bold text-xs">{new Date(prestador.createdAt).toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-bg/30 flex gap-4 sticky bottom-0">
                    {prestador.aprovado === false && (
                        <button
                            onClick={() => onAction('aprovar', prestador.id)}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors"
                        >
                            APROVAR AGORA
                        </button>
                    )}
                    {prestador.ativo === true && (
                        <button
                            onClick={() => onAction('bloquear', prestador.id)}
                            className="flex-1 bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
                        >
                            BLOQUEAR FICHA
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
