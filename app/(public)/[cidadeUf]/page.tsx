import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsRow } from '@/components/ui/StatsRow';
import { CTABanner } from '@/components/ui/CTABanner';
import { FeaturedProviderItem } from '@/components/ui/FeaturedProviderItem';
import { CitySearch } from '@/components/ui/CitySearch';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { cidadeUf: string } }): Promise<Metadata> {
    const cidade = await prisma.cidade.findUnique({ where: { slug: params.cidadeUf } });
    if (!cidade) return {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listasdaqui.com.br';
    const title = `Prestadores de serviço em ${cidade.nome}, ${cidade.uf} | ListasDaqui`;
    const description = `Encontre eletricistas, encanadores, pintores e muito mais em ${cidade.nome}. Profissionais avaliados por moradores da cidade. Compare e fale direto pelo WhatsApp.`;
    const url = `${baseUrl}/${cidade.slug}`;
    return {
        title,
        description,
        alternates: { canonical: url },
        robots: { index: true, follow: true },
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

    const [topServicos, todosServicos] = await Promise.all([
        prisma.servico.findMany({ take: 7, orderBy: { nome: 'asc' } }),
        prisma.servico.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' }, select: { slug: true, nome: true, icone: true } }),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listasdaqui.com.br';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Prestadores de serviço em ${cidade.nome}`,
        description: `Diretório de prestadores de serviço em ${cidade.nome}, ${cidade.uf}. Eletricistas, encanadores, pintores e mais.`,
        url: `${baseUrl}/${cidade.slug}`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Início', item: baseUrl },
                { '@type': 'ListItem', position: 2, name: `${cidade.nome}, ${cidade.uf}` }
            ]
        }
    };

    return (
        <div className="flex flex-col flex-1 pb-16 bg-white overflow-y-auto">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* 1. HERO */}
            <section className="home-hero">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white font-bold shrink-0 no-underline">←</Link>
                    <span className="text-white font-black text-sm tracking-tight opacity-80">ListasDaqui</span>
                </div>
                <div className="hero-eyebrow">📍 {cidade.nome}, {cidade.uf}</div>
                <h1 className="hero-h1">Encontre profissionais em <em>{cidade.nome}</em></h1>
                <p className="hero-sub">Eletricista, pintor, mecânico e mais — avaliados por moradores do seu bairro</p>

                <CitySearch cidadeSlug={cidade.slug} servicos={todosServicos} />

                <StatsRow stats={[
                    { value: '1.2k+', label: 'Cadastrados' },
                    { value: '4.8★', label: 'Média local' },
                ]} />
            </section>

            {/* 2. SERVICES GRID */}
            <section className="section">
                <SectionHeader title="Serviços populares" href="/busca" />
                <div className="service-grid">
                    {topServicos.map((s: any) => <ServiceCard key={s.id} servico={s} cidadeSlug={cidade.slug} />)}
                    <Link href="/busca" className="sg-item">
                        <span className="sg-icon">＋</span>
                        <span className="sg-name">Ver mais</span>
                    </Link>
                </div>
            </section>

            <div className="divider mt-5" />

            {/* 3. FEATURED PROS LOCAL */}
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

            {/* SEO text block */}
            <div className="px-4 py-6 bg-white">
                <h2 className="text-[16px] font-black text-text tracking-tight mb-2">
                    Por que usar o ListasDaqui em {cidade.nome}?
                </h2>
                <p className="text-[13px] text-text2 leading-relaxed mb-4">
                    Nossa plataforma ajuda moradores de {cidade.nome} e região a encontrarem profissionais
                    qualificados, com contato direto via WhatsApp e avaliações reais de outros clientes da
                    mesma cidade. Todos os profissionais são verificados antes de aparecer na plataforma.
                </p>
                <h3 className="text-[14px] font-bold text-text mb-2">Serviços mais buscados em {cidade.nome}</h3>
                <div className="flex flex-wrap gap-2">
                    {topServicos.slice(0, 6).map((s: any) => (
                        <Link
                            key={s.id}
                            href={`/${cidade.slug}/${s.slug}`}
                            className="text-xs font-semibold bg-bg2 border border-border px-3 py-1.5 rounded-full text-text2 hover:border-accent hover:text-accent transition-colors no-underline"
                        >
                            {s.nome}
                        </Link>
                    ))}
                </div>
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
