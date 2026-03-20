'use client'

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value?: string) => void;
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    showInput?: boolean;
    inputPlaceholder?: string;
}

import { useState } from 'react'

export default function ConfirmModal({
    isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'bg-black', showInput = false, inputPlaceholder = 'Digite aqui...'
}: ConfirmModalProps) {
    const [inputValue, setInputValue] = useState('')

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h3 className="text-xl font-black mb-2">{title}</h3>
                    <p className="text-text3 text-sm leading-relaxed mb-6">{message}</p>

                    {showInput && (
                        <textarea
                            className="w-full border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none mb-6 min-h-[100px]"
                            placeholder={inputPlaceholder}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                        />
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 border border-border px-4 py-3 rounded-xl font-bold text-text3 hover:bg-bg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onConfirm(showInput ? inputValue : undefined);
                                onClose();
                            }}
                            className={`flex-1 ${confirmColor} text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
