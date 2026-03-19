import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function CategoryPage({ params }: { params: { cidadeUf: string, servico: string } }) {
    const { cidadeUf, servico: servicoSlug } = params;

    // 1. Fetch Location and Service concurrently
    const [cidade, servico] = await Promise.all([
        prisma.cidade.findUnique({ where: { slug: cidadeUf } }),
        prisma.servico.findUnique({ where: { slug: servicoSlug } })
    ]);

    if (!cidade || !servico) {
        notFound();
    }

    // 2. Fetch Prestadores (Mocking the list structure if empty since we haven't seeded pros yet)
    const prestadores = await prisma.prestador.findMany({
        where: { cidadeId: cidade.id, servicoId: servico.id, ativo: true },
        orderBy: [{ plano: 'desc' }]
    });

    return (
        <div className="flex flex-col flex-1 pb-16 bg-white overflow-hidden">

            {/* TOPBAR */}
            <header className="topbar">
                <div className="tb-row">
                    <Link href="/" className="back-btn no-underline">←</Link>
                    <div className="tb-title flex-1">
                        {servico.nome} em {cidade.nome}
                        <small>📍 {cidade.nome}, {cidade.uf} · {prestadores.length} profissionais</small>
                    </div>
                    <Link href="/" className="logo-sm no-underline">Listas<em>Daqui</em></Link>
                </div>
                <div className="search-bar">
                    <span className="text-[15px] shrink-0 text-text3">🔍</span>
                    <input
                        type="text"
                        placeholder={`Buscar ${servico.nome.toLowerCase()}...`}
                        className="flex-1 border-none bg-transparent font-sans text-sm text-text outline-none placeholder:text-text3"
                    />
                    <span className="loc-pill bg-white border border-border rounded-full px-2.5 py-1 text-[11px] font-bold text-accent whitespace-nowrap shrink-0 cursor-pointer">
                        📍 {cidade.nome} ↓
                    </span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                {/* FILTERS */}
                <div className="flex gap-2 p-3 overflow-x-auto border-b border-border bg-white scrollbar-hide">
                    <button className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border-1.5 border-text bg-text text-white whitespace-nowrap shrink-0">Todos</button>
                    <button className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border-1.5 border-border bg-bg2 text-text2 hover:border-text transition-colors whitespace-nowrap shrink-0">✓ Verificados</button>
                    <button className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border-1.5 border-border bg-bg2 text-text2 hover:border-text transition-colors whitespace-nowrap shrink-0">⭐ Melhor avaliados</button>
                    <button className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border-1.5 border-border bg-bg2 text-text2 hover:border-text transition-colors whitespace-nowrap shrink-0">📍 Centro</button>
                </div>

                {/* SUMMARY */}
                <div className="px-4 py-3 flex items-center justify-between bg-white">
                    <span className="text-[13px] text-text2"><strong>{prestadores.length || 4}</strong> {servico.nome.toLowerCase()}s encontrados</span>
                    <button className="flex items-center gap-1 text-xs font-semibold text-text2 bg-transparent border border-border rounded-lg px-2.5 py-1.5">↕ Ordenar</button>
                </div>

                {/* LIST */}
                <div className="bg-white">

                    {/* Mock Item 1: Destaque */}
                    <Link href={`/${cidade.slug}/${servico.slug}/joao-ricardo`} className="flex items-start gap-3.5 p-4 border-b border-border relative no-underline text-inherit hover:bg-bg2 transition-colors bg-gradient-to-r from-[#FFFBEB] to-white">
                        <div className="relative shrink-0">
                            <div className="w-[62px] h-[62px] rounded-full flex items-center justify-center text-[20px] font-extrabold overflow-hidden bg-[#FEF3C7] text-[#B45309]">JR</div>
                            <div className="absolute bottom-0.5 right-0.5 w-[14px] h-[14px] bg-green rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-lg font-black text-text tracking-tight truncate max-w-[200px]">João Ricardo Elétrica</span>
                                <span className="text-accent text-[13px] tracking-[-2px] shrink-0">✓✓</span>
                            </div>
                            <div className="text-[13.5px] text-text2 mb-1.5 truncate">Instalação, manutenção e quadros elétricos. Tr...</div>
                            <div className="flex items-center gap-1.5 text-[13px] text-text2 flex-wrap">
                                <span className="text-gold text-[13px]">★</span>
                                <span className="font-bold text-text">4.9</span>
                                <span className="text-[12px] text-text3">(38 avaliações)</span>
                                <span className="text-border text-base leading-none">·</span>
                                <span>Asa Sul</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-[72px] text-[13px] font-semibold text-text3">1.2 km</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-wa rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(37,211,102,0.35)] text-white text-[22px]">
                            <WhatsAppIcon />
                        </div>
                    </Link>

                    {/* Mock Item 2: Verificado */}
                    <Link href={`/${cidade.slug}/${servico.slug}/marcos-silva`} className="flex items-start gap-3.5 p-4 border-b border-border relative no-underline text-inherit hover:bg-bg2 transition-colors bg-white">
                        <div className="relative shrink-0">
                            <div className="w-[62px] h-[62px] rounded-full flex items-center justify-center text-[20px] font-extrabold overflow-hidden bg-accent-light text-accent">MS</div>
                            <div className="absolute bottom-0.5 right-0.5 w-[14px] h-[14px] bg-green rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-lg font-black text-text tracking-tight truncate max-w-[200px]">Marcos Silva Eletricista</span>
                                <span className="text-accent text-[13px] tracking-[-2px] shrink-0">✓✓</span>
                            </div>
                            <div className="text-[13.5px] text-text2 mb-1.5 truncate">Laudos elétricos e SPDA. Certificado CREA...</div>
                            <div className="flex items-center gap-1.5 text-[13px] text-text2 flex-wrap">
                                <span className="text-gold text-[13px]">★</span>
                                <span className="font-bold text-text">4.7</span>
                                <span className="text-[12px] text-text3">(21 avaliações)</span>
                                <span className="text-border text-base leading-none">·</span>
                                <span>Taguatinga</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-[72px] text-[13px] font-semibold text-text3">4.5 km</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-wa rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(37,211,102,0.35)] text-white text-[22px]">
                            <WhatsAppIcon />
                        </div>
                    </Link>

                    {/* Mock Item 3: Gratuito */}
                    <div className="flex items-start gap-3.5 p-4 border-b border-border relative bg-white">
                        <div className="relative shrink-0">
                            <div className="w-[62px] h-[62px] rounded-full flex items-center justify-center text-[20px] font-extrabold overflow-hidden bg-bg2 text-text3">PT</div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-lg font-black text-text2 tracking-tight truncate max-w-[200px]">Paulo Torres Instalações</span>
                            </div>
                            <div className="text-[13.5px] text-text3 mb-1.5 truncate">Eletricista residencial e comercial básico...</div>
                            <div className="flex items-center gap-1.5 text-[13px] text-text3 flex-wrap">
                                <span className="text-border text-[13px]">★</span>
                                <span className="font-bold text-text2">4.3</span>
                                <span className="text-[12px] text-text3">(9 avaliações)</span>
                                <span className="text-border text-base leading-none">·</span>
                                <span>Ceilândia</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-[72px] text-[13px] font-semibold text-border">0.8 km</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-bg2 rounded-full flex items-center justify-center shrink-0 border-2 border-dashed border-border text-lg cursor-not-allowed">
                            🔒
                        </div>
                    </div>
                </div>

                {/* CTA INLINE */}
                <Link href="/cadastro" className="m-4 bg-text rounded-2xl p-4 flex items-center gap-3.5 no-underline hover:opacity-90 transition-opacity">
                    <div className="w-[46px] h-[46px] bg-white/10 rounded-xl flex items-center justify-center text-[22px] shrink-0 text-white">⚡</div>
                    <div className="flex-1">
                        <div className="text-[14px] font-extrabold text-white mb-0.5 tracking-tight">É {servico.nome.toLowerCase()} em {cidade.nome}?</div>
                        <div className="text-[11px] text-white/55 leading-snug">Apareça aqui e receba clientes pelo WhatsApp</div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-[20px] font-black text-white leading-none tracking-tight">R$97</div>
                        <div className="text-[10px] text-white/50">/ano</div>
                        <div className="text-[11px] font-semibold text-green mt-0.5">ou grátis →</div>
                    </div>
                </Link>

                {/* PAGINATION */}
                <div className="flex justify-center gap-1.5 p-4 bg-white">
                    <button className="w-9 h-9 rounded-xl border-1.5 border-text bg-text text-white text-[13px] font-semibold flex items-center justify-center">1</button>
                    <button className="w-9 h-9 rounded-xl border-1.5 border-border bg-white text-text2 text-[13px] font-semibold flex items-center justify-center">2</button>
                    <button className="w-9 h-9 rounded-xl border-1.5 border-border bg-white text-text2 text-[13px] font-semibold flex items-center justify-center">3</button>
                    <button className="w-9 h-9 rounded-xl border-1.5 border-border bg-white text-text2 text-[13px] font-semibold flex items-center justify-center">›</button>
                </div>

                {/* SEO SECTION */}
                <div className="px-4 pt-2 pb-4 bg-white">
                    <div className="bg-bg2 rounded-[18px] p-5">
                        <h2 className="text-[15px] font-extrabold text-text tracking-tight mb-2">Como contratar {servico.nome.toLowerCase()} em {cidade.nome}</h2>
                        <p className="text-[13px] text-text2 leading-relaxed mb-2">
                            {cidade.nome} tem profissionais qualificados disponíveis. Verifique o orçamento e confira as avaliações de outros moradores.
                        </p>

                        <h2 className="text-[15px] font-extrabold text-text tracking-tight mb-2 mt-4">Preços médios em {cidade.nome}</h2>
                        <div className="grid grid-cols-2 gap-2 my-2.5">
                            <div className="bg-white rounded-xl p-3 border border-border">
                                <div className="text-[10px] font-semibold text-text3 uppercase tracking-wider mb-1">Serviço avulso</div>
                                <div className="text-base font-extrabold text-text tracking-tight">R$80–200</div>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-border">
                                <div className="text-[10px] font-semibold text-text3 uppercase tracking-wider mb-1">Instalação</div>
                                <div className="text-base font-extrabold text-text tracking-tight">R$200–450</div>
                            </div>
                        </div>

                        <h2 className="text-[15px] font-extrabold text-text tracking-tight mb-2 mt-4">Perguntas frequentes</h2>
                        <div className="border-t border-border pt-3 mt-3">
                            <div className="flex justify-between items-start gap-2.5 cursor-pointer mb-1.5">
                                <div className="text-[13px] font-bold text-text tracking-tight">Qual o prazo médio do serviço?</div>
                                <div className="w-5 h-5 bg-border rounded-full flex items-center justify-center text-[13px] font-bold text-text2 shrink-0 leading-none">+</div>
                            </div>
                            <div className="text-[12.5px] text-text2 leading-relaxed pb-1">
                                Serviços simples no mesmo dia. Serviços complexos em média de 2 a 5 dias úteis.
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
