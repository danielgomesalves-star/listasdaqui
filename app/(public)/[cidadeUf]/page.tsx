import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsRow } from '@/components/ui/StatsRow';
import { CTABanner } from '@/components/ui/CTABanner';
import { FeaturedProviderItem } from '@/components/ui/FeaturedProviderItem';

const prisma = new PrismaClient();
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { cidadeUf: string } }): Promise<Metadata> {
    const cidade = await prisma.cidade.findUnique({ where: { slug: params.cidadeUf } });
    if (!cidade) return {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listasdaqui.com.br';
    const title = `Prestadores de serviço em ${cidade.nome}, ${cidade.uf} | ListasDaqui`;
    const description = `Encontre eletricistas, encanadores, pintores e muito mais em ${cidade.nome}. Profissionais avaliados por moradores da cidade.`;
    const url = `${baseUrl}/${cidade.slug}`;
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

export default async function CityPage({ params }: { params: { cidadeUf: string } }) {
    const cidade = await prisma.cidade.findUnique({ where: { slug: params.cidadeUf } });

    if (!cidade) {
        notFound();
    }

    const topServicos = await prisma.servico.findMany({
        take: 7,
        orderBy: { nome: 'asc' }
    });

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

                <StatsRow stats={[
                    { value: '1.2k+', label: 'Cadastrados' },
                    { value: '4.8★', label: 'Média local' },
                ]} />
            </section>

            {/* 2. SERVICES GRID */}
            <section className="section">
                <SectionHeader title="Serviços populares" href="/busca" />
                <div className="service-grid">
                    {topServicos.map(s => <ServiceCard key={s.id} servico={s} cidadeSlug={cidade.slug} />)}
                    <Link href="/busca" className="sg-item">
                        <span className="sg-icon">＋</span>
                        <span className="sg-name">Ver mais</span>
                    </Link>
                </div>
            </section>

            <div className="divider mt-5" />

            {/* 4. FEATURED PROS LOCAL */}
            <section className="section">
                <SectionHeader title="⭐ Mais bem avaliados na cidade" />
            </section>
            <div className="featured-list">
                <FeaturedProviderItem
                    href={`/${cidade.slug}/eletricista/joao-ricardo`}
                    initials="JR"
                    bgStyle={{ background: '#FEF3C7', color: '#B45309' }}
                    nome="João Ricardo Elétrica"
                    meta={`⚡ Eletricista · ${cidade.nome} · ★ 4.9 (38)`}
                />
                <FeaturedProviderItem
                    href={`/${cidade.slug}/eletricista/marcos-silva`}
                    initials="MS"
                    bgStyle={{ background: '#EFF6FF', color: '#1D4ED8' }}
                    nome="Marcos Silva Eletricista"
                    meta={`⚡ Eletricista · ${cidade.nome} · ★ 4.7 (21)`}
                />
            </div>

            <div className="divider" />

            {/* 6. CTA & SEO */}
            <div className="px-4 py-6 bg-white">
                <h2 className="text-[16px] font-black text-text tracking-tight mb-2">Por que usar o ListasDaqui em {cidade.nome}?</h2>
                <p className="text-[13px] text-text2 leading-relaxed mb-4">
                    Nossa plataforma ajuda moradores de {cidade.nome} e região a encontrarem profissionais qualificados, com contato direto via WhatsApp e avaliações reais de outros clientes da mesma cidade.
                </p>
            </div>

            <CTABanner
                title={`É de ${cidade.nome}?`}
                showPrice={false}
                buttonLabel="Quero me cadastrar grátis →"
                className="mt-0"
            />

        </div>
    );
}
