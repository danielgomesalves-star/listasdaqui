import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Avatar } from '@/components/ui/Avatar';
import { FAQItem } from '@/components/ui/FAQItem';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

type Props = { params: { cidadeUf: string, servico: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { cidadeUf, servico: servicoSlug } = params;
    const [cidade, servico] = await Promise.all([
        prisma.cidade.findUnique({ where: { slug: cidadeUf } }),
        prisma.servico.findUnique({ where: { slug: servicoSlug } })
    ]);
    if (!cidade || !servico) return {};
    const conteudo = await prisma.conteudo.findUnique({
        where: { servicoId_cidadeId: { servicoId: servico.id, cidadeId: cidade.id } }
    });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listasdaqui.com.br';
    const title = conteudo?.titulo || `${servico.nome} em ${cidade.nome} | ListasDaqui`;
    const description = conteudo?.descricao?.substring(0, 160) || `Encontre profissionais de ${servico.nome.toLowerCase()} em ${cidade.nome}, ${cidade.uf}.`;
    const url = `${baseUrl}/${cidade.slug}/${servico.slug}`;
    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: 'ListasDaqui',
            locale: 'pt_BR',
            type: 'website',
            images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${baseUrl}/og-default.png`],
        },
    };
}

export default async function CategoryPage({ params }: Props) {
    const { cidadeUf, servico: servicoSlug } = params;

    const [cidade, servico] = await Promise.all([
        prisma.cidade.findUnique({ where: { slug: cidadeUf } }),
        prisma.servico.findUnique({ where: { slug: servicoSlug } })
    ]);

    if (!cidade || !servico) {
        notFound();
    }

    const [prestadores, conteudo] = await Promise.all([
        prisma.prestador.findMany({
            where: { cidadeId: cidade.id, servicoId: servico.id, ativo: true, aprovado: true },
            orderBy: [{ plano: 'desc' }, { createdAt: 'asc' }],
            take: 20
        }),
        prisma.conteudo.findUnique({
            where: { servicoId_cidadeId: { servicoId: servico.id, cidadeId: cidade.id } }
        })
    ]);

    const faqs: Array<{ pergunta: string; resposta: string }> = Array.isArray(conteudo?.faqJson) ? conteudo.faqJson as any : [];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listasdaqui.com.br';
    const pageUrl = `${baseUrl}/${cidade.slug}/${servico.slug}`;

    const jsonLd: Record<string, unknown>[] = [
        {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': baseUrl },
                { '@type': 'ListItem', 'position': 2, 'name': servico.nome, 'item': pageUrl },
                { '@type': 'ListItem', 'position': 3, 'name': `${servico.nome} em ${cidade.nome}` }
            ]
        }
    ];

    if (prestadores.length > 0) {
        jsonLd.push({
            '@type': 'ItemList',
            'name': `${servico.nome} em ${cidade.nome}`,
            'description': conteudo?.descricao?.substring(0, 160) || undefined,
            'itemListElement': prestadores.map((p, i) => ({
                '@type': 'ListItem',
                'position': i + 1,
                'name': p.nome,
                'url': `${pageUrl}/${p.slug || p.id}`
            }))
        });
    }

    if (faqs.length > 0) {
        jsonLd.push({
            '@type': 'FAQPage',
            'mainEntity': faqs.map(faq => ({
                '@type': 'Question',
                'name': faq.pergunta,
                'acceptedAnswer': { '@type': 'Answer', 'text': faq.resposta }
            }))
        });
    }

    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLd })
            }}
        />
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
                </div>

                {/* SUMMARY */}
                <div className="px-4 py-3 flex items-center justify-between bg-white">
                    <span className="text-[13px] text-text2"><strong>{prestadores.length}</strong> {servico.nome.toLowerCase()}s encontrados</span>
                    <button className="flex items-center gap-1 text-xs font-semibold text-text2 bg-transparent border border-border rounded-lg px-2.5 py-1.5">↕ Ordenar</button>
                </div>

                {/* LIST */}
                <div className="bg-white">
                    {prestadores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="text-5xl mb-4">🔍</div>
                            <h2 className="text-lg font-black text-text mb-2">Nenhum profissional encontrado</h2>
                            <p className="text-sm text-text3 mb-6">Ainda não temos profissionais de {servico.nome.toLowerCase()} cadastrados em {cidade.nome}. Seja o primeiro!</p>
                            <Link href="/cadastro" className="bg-text text-white px-6 py-3 rounded-xl font-bold text-sm no-underline hover:opacity-90 transition-opacity">
                                Anunciar meu serviço →
                            </Link>
                        </div>
                    ) : (
                        prestadores.map((p, i) => {
                            const isPago = p.plano !== 'GRATUITO';

                            return (
                                <Link
                                    key={p.id}
                                    href={`/${cidade.slug}/${servico.slug}/${p.slug || p.id}`}
                                    className={`flex items-start gap-3.5 p-4 border-b border-border relative no-underline text-inherit hover:bg-bg2 transition-colors ${i === 0 && isPago ? 'bg-gradient-to-r from-[#FFFBEB] to-white' : 'bg-white'}`}
                                >
                                    <Avatar nome={p.nome} foto={p.foto} isPago={isPago} colorIndex={i} />
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className={`text-lg font-black tracking-tight truncate max-w-[200px] ${isPago ? 'text-text' : 'text-text2'}`}>{p.nome}</span>
                                            {isPago && <span className="text-accent text-[13px] tracking-[-2px] shrink-0">✓✓</span>}
                                        </div>
                                        {p.bio && <div className="text-[13.5px] text-text2 mb-1.5 truncate">{p.bio}</div>}
                                        <div className="text-[13px] text-text3">{cidade.nome}</div>
                                    </div>
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-[22px] ${isPago ? 'bg-wa shadow-[0_4px_14px_rgba(37,211,102,0.35)] text-white' : 'bg-bg2 border-2 border-dashed border-border cursor-not-allowed'}`}>
                                        {isPago ? <WhatsAppIcon /> : '🔒'}
                                    </div>
                                </Link>
                            );
                        })
                    )}
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

                {/* SEO CONTENT (from database) — collapsible */}
                {conteudo && (
                    <div className="px-4 pt-2 pb-4 bg-white">
                        <div className="bg-bg2 rounded-[18px] p-5">
                            <h1 className="text-[17px] font-extrabold text-text tracking-tight mb-3">{conteudo.titulo}</h1>

                            {/* Descrição com "ver mais" */}
                            <details className="group mb-4">
                                <summary className="list-none cursor-pointer">
                                    <p className="text-[13px] text-text2 leading-relaxed line-clamp-3 group-open:line-clamp-none">
                                        {conteudo.descricao}
                                    </p>
                                    <span className="text-[12px] font-semibold text-accent mt-1 inline-block group-open:hidden">Ver mais ↓</span>
                                    <span className="text-[12px] font-semibold text-accent mt-1 hidden group-open:inline-block">Ver menos ↑</span>
                                </summary>
                            </details>

                            {/* PREÇOS */}
                            {(conteudo.precoMin || conteudo.precoMax) && (
                                <>
                                    <h2 className="text-[15px] font-extrabold text-text tracking-tight mb-2">Preços médios em {cidade.nome}</h2>
                                    <div className="grid grid-cols-2 gap-2 my-2.5">
                                        {conteudo.precoMin && (
                                            <div className="bg-white rounded-xl p-3 border border-border">
                                                <div className="text-[10px] font-semibold text-text3 uppercase tracking-wider mb-1">A partir de</div>
                                                <div className="text-base font-extrabold text-text tracking-tight">R${conteudo.precoMin}</div>
                                            </div>
                                        )}
                                        {conteudo.precoMax && (
                                            <div className="bg-white rounded-xl p-3 border border-border">
                                                <div className="text-[10px] font-semibold text-text3 uppercase tracking-wider mb-1">Até</div>
                                                <div className="text-base font-extrabold text-text tracking-tight">R${conteudo.precoMax}</div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* FAQs — cada item colapsável */}
                            {faqs.length > 0 && (
                                <>
                                    <h2 className="text-[15px] font-extrabold text-text tracking-tight mb-2 mt-4">Perguntas frequentes</h2>
                                    {faqs.map((faq, i) => (
                                        <FAQItem key={i} pergunta={faq.pergunta} resposta={faq.resposta} />
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
        </>
    );
}
