import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsRow } from '@/components/ui/StatsRow';
import { CTABanner } from '@/components/ui/CTABanner';
import { FeaturedProviderItem } from '@/components/ui/FeaturedProviderItem';

const prisma = new PrismaClient();

// This prevents the page from failing if the database isn't fully seeded
export const dynamic = 'force-static';
export const revalidate = 3600; // revalidate every hour 

export default async function HomePage() {
  // Try to fetch top cities and services if DB is connected
  let topCidades: any[] = [];
  let topServicos: any[] = [];

  try {
    topCidades = await prisma.cidade.findMany({
      take: 6,
      orderBy: { populacao: 'desc' },
    });

    topServicos = await prisma.servico.findMany({
      take: 7,
      orderBy: { nome: 'asc' }
    });
  } catch (err) {
    console.error("Home query falhou (provavelmente banco vazio ou offline):", err);
  }

  return (
    <div className="flex flex-col flex-1 pb-16 bg-white overflow-y-auto">

      {/* 1. HERO */}
      <section className="home-hero">
        <div className="hero-eyebrow">🇧🇷 O guia de prestadores do Brasil</div>
        <h1 className="hero-h1">Encontre quem <em>resolve</em> perto de você</h1>
        <p className="hero-sub">Eletricista, pintor, mecânico e mais — avaliados por moradores da sua cidade</p>

        <div className="hero-search">
          <div className="hs-label">O que você precisa?</div>
          <div className="hs-field">
            <span className="hs-icon">🔍</span>
            <input type="text" placeholder="Ex: eletricista, pintor..." />
          </div>
          <div className="hs-field" style={{ marginBottom: 0 }}>
            <span className="hs-icon">📍</span>
            <input type="text" placeholder="Sua cidade ou CEP" defaultValue="Brasília, DF" />
          </div>
          <Link href="/brasilia-df" className="hs-btn mt-2 text-center">Buscar profissionais</Link>
        </div>

        <StatsRow stats={[
          { value: '487k', label: 'Profissionais' },
          { value: '406', label: 'Cidades' },
          { value: '4.8★', label: 'Média' },
        ]} />
      </section>

      {/* 2. SERVICES GRID */}
      <section className="section">
        <SectionHeader title="Serviços em destaque" href="/busca" />
        <div className="service-grid">
          {topServicos.map(s => <ServiceCard key={s.id} servico={s} />)}
          <Link href="/busca" className="sg-item">
            <span className="sg-icon">＋</span>
            <span className="sg-name">Ver mais</span>
          </Link>
        </div>
      </section>

      <div className="divider mt-5" />

      {/* 3. CITIES */}
      <section className="section">
        <SectionHeader title="Cidades em destaque" />
      </section>
      <div className="city-chips px-4 pb-4">
        {topCidades.map(c => (
          <Link href={`/${c.slug}`} key={c.id} className="city-chip">
            <span className="cc-name">{c.nome}</span>
            <span className="cc-count">Ver guias listados</span>
            <span className="cc-uf">{c.uf}</span>
          </Link>
        ))}
      </div>

      <div className="divider" />

      {/* 4. FEATURED PROS */}
      <section className="section">
        <SectionHeader title="⭐ Mais bem avaliados" href="/brasilia-df" />
      </section>
      <div className="featured-list">
        <FeaturedProviderItem
          href="/brasilia-df/eletricista/joao-ricardo"
          initials="JR"
          bgStyle={{ background: '#FEF3C7', color: '#B45309' }}
          nome="João Ricardo Elétrica"
          meta="⚡ Eletricista · Asa Sul, Brasília · ★ 4.9 (38)"
        />
        <FeaturedProviderItem
          href="/brasilia-df/eletricista/marcos-silva"
          initials="MS"
          bgStyle={{ background: '#EFF6FF', color: '#1D4ED8' }}
          nome="Marcos Silva Eletricista"
          meta="⚡ Eletricista · Taguatinga, DF · ★ 4.7 (21)"
        />
      </div>

      <div className="divider" />

      {/* 5. HOW IT WORKS */}
      <section className="section">
        <SectionHeader title="Como funciona" />
        <div className="how-grid mb-5">
          <div className="how-item"><div className="hi-num">01</div><div className="hi-title">Busque o serviço</div><div className="hi-desc">Digite o que precisa e sua cidade para ver profissionais disponíveis</div></div>
          <div className="how-item"><div className="hi-num">02</div><div className="hi-title">Compare avaliações</div><div className="hi-desc">Leia opiniões de moradores da sua cidade antes de decidir</div></div>
          <div className="how-item"><div className="hi-num">03</div><div className="hi-title">Chame no WhatsApp</div><div className="hi-desc">Fale direto com o profissional e peça orçamento sem compromisso</div></div>
          <div className="how-item"><div className="hi-num">04</div><div className="hi-title">Avalie depois</div><div className="hi-desc">Compartilhe sua experiência e ajude outros moradores</div></div>
        </div>
      </section>

      <div className="divider" />

      {/* 6. CTA */}
      <CTABanner />

      <footer className="footer pb-safe">
        <div className="f-logo">Listas<em>Daqui</em></div>
        <div className="f-sub">O guia de prestadores de serviço do Brasil</div>
        <div className="f-links">
          <Link href="#">Termos</Link>
          <Link href="#">Privacidade</Link>
          <Link href="#">Contato</Link>
          <Link href="/cadastro">Anuncie</Link>
        </div>
        <div className="f-copy">© 2026 ListasDaqui — Todos os direitos reservados</div>
      </footer>

    </div>
  );
}
