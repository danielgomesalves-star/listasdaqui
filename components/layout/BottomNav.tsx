import Link from 'next/link';

export function BottomNav() {
    return (
        <>
            {/* spacer to prevent content from hiding behind nav */}
            <div className="h-16 shrink-0" />

            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-border flex z-[200] pb-[env(safe-area-inset-bottom,0px)]">
                <Link href="/" className="flex-1 flex flex-col items-center justify-center gap-[3px] py-2.5 text-accent">
                    <span className="text-xl leading-none">🏠</span>
                    <span className="text-[10px] font-semibold">Início</span>
                </Link>
                <Link href="/busca" className="flex-1 flex flex-col items-center justify-center gap-[3px] py-2.5 text-text3 hover:text-text transition-colors">
                    <span className="text-xl leading-none">🔍</span>
                    <span className="text-[10px] font-semibold">Buscar</span>
                </Link>
                <Link href="/cadastro" className="flex-1 flex flex-col items-center justify-center gap-[3px] py-2.5 text-text3 hover:text-text transition-colors">
                    <span className="text-xl leading-none">➕</span>
                    <span className="text-[10px] font-semibold">Anunciar</span>
                </Link>
                <Link href="/painel" className="flex-1 flex flex-col items-center justify-center gap-[3px] py-2.5 text-text3 hover:text-text transition-colors">
                    <span className="text-xl leading-none">👤</span>
                    <span className="text-[10px] font-semibold">Conta</span>
                </Link>
            </nav>
        </>
    );
}
