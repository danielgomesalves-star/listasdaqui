import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

const prisma = new PrismaClient();
export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function CityPage({ params }: { params: { cidadeUf: string } }) {
    const cidade = await prisma.cidade.findUnique({ where: { slug: params.cidadeUf } });

    if (!cidade) {
        notFound();
    }

    const topServicos = await prisma.servico.findMany({
        take: 7,
        orderBy: { nome: 'asc' }
    });

    const fallbackIcons: Record<string, string> = {
        'eletricista': '⚡', 'encanador': '🔧', 'pintor': '🎨',
        'ar-condicionado': '❄️', 'chaveiro': '🔑', 'mecanico': '🚗',
        'cabeleireiro': '✂️'
    };

    return (
        <div className="flex flex-col flex-1 pb-16 bg-white overflow-y-auto">

            {/* 1. HERO */}
            <section className="home-hero">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white font-bold shrink-0 no-underline">←</Link>
                    <span className="text-white font-black text-sm tracking-tight opacity-80">ListasDaqui</span>
                </div>
                <div className="hero-eyebrow">📍 {cidade.nome}, {cidade.uf}</div>
                <h1 className="hero-h1">Encontre profissionais em <em>{cidade.nome}</em></h1>
                <p className="hero-sub">Eletricista, pintor, mecânico e mais — avaliados por moradores do seu bairro</p>

                <div className="hero-search">
                    <div className="hs-label">O que você precisa?</div>
                    <div className="hs-field mb-0">
                        <span className="hs-icon">🔍</span>
                        <input type="text" placeholder="Ex: eletricista, encanador..." />
                    </div>
                    <Link href={`/${cidade.slug}/eletricista`} className="hs-btn mt-3 text-center">Buscar agora</Link>
                </div>

                <div className="hero-stats">
                    <div className="hs-stat"><div className="hs-stat-n">1.2k+</div><div className="hs-stat-l">Cadastrados</div></div>
                    <div className="hs-stat"><div className="hs-stat-n">4.8★</div><div className="hs-stat-l">Média local</div></div>
                </div>
            </section>

            {/* 2. SERVICES GRID */}
            <section className="section">
                <div className="section-head">
                    <span className="section-title">Serviços populares</span>
                    <Link href="/busca" className="see-all">Ver todos →</Link>
                </div>
                <div className="service-grid">
                    {topServicos.map(s => (
                        <Link href={`/${cidade.slug}/${s.slug}`} key={s.id} className="sg-item">
                            <span className="sg-icon">{fallbackIcons[s.slug] || '💼'}</span>
                            <span className="sg-name">{s.nome}</span>
                        </Link>
                    ))}
                    <Link href="/busca" className="sg-item">
                        <span className="sg-icon">＋</span>
                        <span className="sg-name">Ver mais</span>
                    </Link>
                </div>
            </section>

            <div className="divider mt-5" />

            {/* 4. FEATURED PROS LOCAL */}
            <section className="section">
                <div className="section-head">
                    <span className="section-title">⭐ Mais bem avaliados na cidade</span>
                </div>
            </section>
            <div className="featured-list">
                {/* Mocked Featured Pros for homepage visual demonstration */}
                <Link href={`/${cidade.slug}/eletricista/joao-ricardo`} className="featured-item">
                    <div className="fi-av" style={{ background: '#FEF3C7', color: '#B45309' }}>
                        JR<div className="fi-online"></div>
                    </div>
                    <div className="fi-info">
                        <div className="fi-name">João Ricardo Elétrica</div>
                        <div className="fi-meta">⚡ Eletricista · {cidade.nome} · ★ 4.9 (38)</div>
                    </div>
                    <div className="fi-wa text-[20px]"><WhatsAppIcon /></div>
                </Link>

                <Link href={`/${cidade.slug}/eletricista/marcos-silva`} className="featured-item">
                    <div className="fi-av" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                        MS<div className="fi-online"></div>
                    </div>
                    <div className="fi-info">
                        <div className="fi-name">Marcos Silva Eletricista</div>
                        <div className="fi-meta">⚡ Eletricista · {cidade.nome} · ★ 4.7 (21)</div>
                    </div>
                    <div className="fi-wa text-[20px]"><WhatsAppIcon /></div>
                </Link>
            </div>

            <div className="divider" />

            {/* 6. CTA & SEO */}
            <div className="px-4 py-6 bg-white">
                <h2 className="text-[16px] font-black text-text tracking-tight mb-2">Por que usar o ListasDaqui em {cidade.nome}?</h2>
                <p className="text-[13px] text-text2 leading-relaxed mb-4">
                    Nossa plataforma ajuda moradores de {cidade.nome} e região a encontrarem profissionais qualificados, com contato direto via WhatsApp e avaliações reais de outros clientes da mesma cidade.
                </p>
            </div>

            <div className="cta-home mt-0">
                <h3>É de {cidade.nome}?</h3>
                <p>Apareça para clientes da sua cidade e receba contatos direto no WhatsApp</p>
                <Link href="/cadastro" className="hs-btn rounded-lg mt-4">Quero me cadastrar grátis →</Link>
            </div>

        </div>
    );
}
