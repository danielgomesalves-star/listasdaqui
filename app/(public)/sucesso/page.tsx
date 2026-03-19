import Link from 'next/link'

export default function SucessoPage() {
    return (
        <div className="flex flex-col flex-1 pb-16 bg-white overflow-y-auto">
            <div className="success-page" style={{ minHeight: 'auto', paddingTop: '60px' }}>
                <div className="text-[52px] leading-none mb-3">🎉</div>
                <h2 className="text-[24px] font-black text-text mb-2.5 tracking-tight">Cadastro realizado!</h2>
                <p className="text-[14px] text-text2 leading-relaxed mb-6">
                    Seu perfil já está no sistema. Agora milhares de clientes da sua cidade poderão te encontrar no ListasDaqui.
                </p>

                <div className="bg-bg2 rounded-[14px] border border-border p-4 mb-6 text-left">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-[12px] font-semibold text-text3 uppercase">Plano</span>
                        <span className="text-[13px] font-bold text-accent">✓ Verificado</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-[12px] font-semibold text-text3 uppercase">Visibilidade</span>
                        <span className="text-[13px] font-bold text-text">Público</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-[12px] font-semibold text-text3 uppercase">Conta</span>
                        <span className="text-[13px] font-bold text-text">Ativa</span>
                    </div>
                </div>

                <Link href="/conta" className="hs-btn w-full rounded-[10px] mb-2.5">Acessar Minha Conta →</Link>
                <Link href="/" className="w-full h-[48px] bg-transparent text-text2 font-bold text-[15px] rounded-[10px] flex items-center justify-center transition-colors mb-4 no-underline">
                    Voltar ao início
                </Link>
            </div>
        </div>
    )
}
