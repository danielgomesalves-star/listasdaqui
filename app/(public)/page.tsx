import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { PrismaClient } from '@prisma/client';

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

  // Mapping icons to generic services for visual fidelity
  const fallbackIcons: Record<string, string> = {
    'eletricista': '⚡', 'encanador': '🔧', 'pintor': '🎨',
    'ar-condicionado': '❄️', 'chaveiro': '🔑', 'mecanico': '🚗',
    'cabeleireiro': '✂️'
  };

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

        <div className="hero-stats">
          <div className="hs-stat"><div className="hs-stat-n">487k</div><div className="hs-stat-l">Profissionais</div></div>
          <div className="hs-stat"><div className="hs-stat-n">406</div><div className="hs-stat-l">Cidades</div></div>
          <div className="hs-stat"><div className="hs-stat-n">4.8★</div><div className="hs-stat-l">Média</div></div>
        </div>
      </section>

      {/* 2. SERVICES GRID */}
      <section className="section">
        <div className="section-head">
          <span className="section-title">Serviços em destaque</span>
          <Link href="/busca" className="see-all">Ver todos →</Link>
        </div>
        <div className="service-grid">
          {topServicos.map(s => (
            <Link href={`/brasilia-df/${s.slug}`} key={s.id} className="sg-item">
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

      {/* 3. CITIES */}
      <section className="section">
        <div className="section-head">
          <span className="section-title">Cidades em destaque</span>
        </div>
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
        <div className="section-head">
          <span className="section-title">⭐ Mais bem avaliados</span>
          <Link href="/brasilia-df" className="see-all">Ver todos →</Link>
        </div>
      </section>
      <div className="featured-list">
        {/* Mocked Featured Pros for homepage visual demonstration */}
        <Link href="/brasilia-df/eletricista/joao-ricardo" className="featured-item">
          <div className="fi-av" style={{ background: '#FEF3C7', color: '#B45309' }}>
            JR<div className="fi-online"></div>
          </div>
          <div className="fi-info">
            <div className="fi-name">João Ricardo Elétrica</div>
            <div className="fi-meta">⚡ Eletricista · Asa Sul, Brasília · ★ 4.9 (38)</div>
          </div>
          <div className="fi-wa text-[20px]"><WhatsAppIcon /></div>
        </Link>

        <Link href="/brasilia-df/eletricista/marcos-silva" className="featured-item">
          <div className="fi-av" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            MS<div className="fi-online"></div>
          </div>
          <div className="fi-info">
            <div className="fi-name">Marcos Silva Eletricista</div>
            <div className="fi-meta">⚡ Eletricista · Taguatinga, DF · ★ 4.7 (21)</div>
          </div>
          <div className="fi-wa text-[20px]"><WhatsAppIcon /></div>
        </Link>
      </div>

      <div className="divider" />

      {/* 5. HOW IT WORKS */}
      <section className="section">
        <div className="section-head">
          <span className="section-title">Como funciona</span>
        </div>
        <div className="how-grid mb-5">
          <div className="how-item"><div className="hi-num">01</div><div className="hi-title">Busque o serviço</div><div className="hi-desc">Digite o que precisa e sua cidade para ver profissionais disponíveis</div></div>
          <div className="how-item"><div className="hi-num">02</div><div className="hi-title">Compare avaliações</div><div className="hi-desc">Leia opiniões de moradores da sua cidade antes de decidir</div></div>
          <div className="how-item"><div className="hi-num">03</div><div className="hi-title">Chame no WhatsApp</div><div className="hi-desc">Fale direto com o profissional e peça orçamento sem compromisso</div></div>
          <div className="how-item"><div className="hi-num">04</div><div className="hi-title">Avalie depois</div><div className="hi-desc">Compartilhe sua experiência e ajude outros moradores</div></div>
        </div>
      </section>

      <div className="divider" />

      {/* 6. CTA */}
      <div className="cta-home">
        <h3>É prestador de serviço?</h3>
        <p>Apareça para clientes da sua cidade e receba contatos direto no WhatsApp</p>
        <div className="price">R$97 <small>/ano</small></div>
        <div className="text-xs text-white/40 mb-4">ou cadastre-se grátis</div>
        <Link href="/cadastro" className="hs-btn rounded-lg">Quero me cadastrar →</Link>
      </div>

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
