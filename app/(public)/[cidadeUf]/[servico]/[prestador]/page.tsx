import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();
export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function ProviderProfilePage({
    params
}: {
    params: { cidadeUf: string, servico: string, prestador: string }
}) {
    const { cidadeUf, servico: servicoSlug, prestador: prestadorSlug } = params;

    // 1. Fetch base relations
    const [cidade, servico] = await Promise.all([
        prisma.cidade.findUnique({ where: { slug: cidadeUf } }),
        prisma.servico.findUnique({ where: { slug: servicoSlug } })
    ]);

    if (!cidade || !servico) {
        notFound();
    }

    // 2. Fetch Provider or fallback to Mock to allow visual preview before seeding
    let prestador = await prisma.prestador.findUnique({
        where: { slug: prestadorSlug },
        include: {
            avaliacoes: true
        }
    });

    if (!prestador) {
        // Injecting Mock Data for UI demonstration based exactly on the HTML Model
        prestador = {
            id: "mock",
            nome: "João Ricardo Elétrica",
            slug: prestadorSlug,
            telefone: "61999999999",
            descricao: "Eletricista com 15 anos de experiência em Brasília e região. Especializado em instalações residenciais e comerciais, manutenção de quadros elétricos, tomadas, iluminação e ar-condicionado. Trabalho com garantia em todos os serviços. Atendo todas as Regiões Administrativas do DF.",
            plano: "VERIFICADO",
            cidadeId: cidade.id,
            servicoId: servico.id,
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
            avaliacoes: [
                { id: "1", nota: 5, comentario: "Excelente profissional! Resolveu o problema do meu quadro elétrico rapidamente e com muito cuidado.", nomeCliente: "Ana Paula M.", prestadorId: "mock", criadoEm: new Date() },
                { id: "2", nota: 5, comentario: "Chamei para instalar tomadas novas e ficou perfeito. Pontual, educado e cobrou o preço combinado.", nomeCliente: "Carlos Eduardo S.", prestadorId: "mock", criadoEm: new Date() },
                { id: "3", nota: 4, comentario: "Bom serviço no geral, instalou o ar condicionado certinho. Só demorou um pouco mais do que o combinado.", nomeCliente: "Mariana T.", prestadorId: "mock", criadoEm: new Date() }
            ]
        } as any;
    }

    return (
        <div className="flex flex-col flex-1 pb-16 bg-white overflow-y-auto">

            {/* 1. HERO PROFILE */}
            <div className="relative px-5 py-6 bg-gradient-to-br from-[#0F172A] to-[#0E4D7A]">
                <div className="flex justify-between items-start mb-4">
                    <Link href={`/${cidade.slug}/${servico.slug}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 text-white no-underline shrink-0">←</Link>
                    <Link href="/" className="text-sm font-black text-white tracking-tight no-underline">Listas<em className="text-[#7DD3FC] not-italic">Daqui</em></Link>
                </div>

                <div className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-black mb-3 border-[3px] border-white/20 relative bg-[#FEF3C7] text-[#B45309]">
                    {prestador.nome.substring(0, 2).toUpperCase()}
                    <div className="absolute bottom-[3px] right-[3px] w-4 h-4 bg-green rounded-full border-[2.5px] border-[#0F172A]"></div>
                </div>

                <h1 className="text-[22px] font-black text-white tracking-tight mb-1">{prestador.nome}</h1>
                <div className="text-[13px] text-white/65 mb-3">
                    {servico.icone || '⚡'} {servico.nome} · Asa Sul, {cidade.nome}, {cidade.uf} · 15 anos de experiência
                </div>

                <div className="flex gap-1.5 flex-wrap mb-4">
                    {prestador.plano === 'VERIFICADO' && (
                        <>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0EA5E9]/20 text-[#7DD3FC] border border-[#0EA5E9]/30">✓✓ Verificado</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/30">👑 Top da semana</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0EA5E9]/20 text-[#7DD3FC] border border-[#0EA5E9]/30">🛡 CREA-DF</span>
                        </>
                    )}
                </div>

                <div className="flex gap-2">
                    <a href={`https://wa.me/55${prestador.telefone}?text=Olá, vi seu perfil no ListasDaqui e gostaria de um orçamento.`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-wa text-white p-[13px] rounded-sm text-sm font-bold no-underline font-sans cursor-pointer transition-opacity hover:opacity-90">
                        <WhatsAppIcon /> Chamar no WhatsApp
                    </a>
                    <button className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center text-[18px] cursor-pointer border-none shrink-0 transition-opacity hover:bg-white/20">↗️</button>
                </div>
            </div>

            {/* 2. PROFILE BODY */}
            <div className="bg-white">

                {/* Avaliações Metric Card */}
                <div className="p-4 border-b border-border">
                    <div className="text-[12px] font-bold text-text3 uppercase tracking-wider mb-2.5">Avaliações</div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-[48px] font-black text-text tracking-[-2px] leading-none">4.9</div>
                        <div>
                            <div className="text-gold text-[18px] tracking-[2px] mb-0.5">★★★★★</div>
                            <div className="text-[12px] text-text3">{prestador.avaliacoes?.length || 0} avaliações verificadas</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-text2 w-2 shrink-0">5</span>
                        <div className="flex-1 h-[5px] bg-bg2 rounded-full overflow-hidden"><div className="h-full bg-gold rounded-full" style={{ width: '88%' }}></div></div>
                        <span className="text-[11px] text-text3 w-5 text-right">33</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-text2 w-2 shrink-0">4</span>
                        <div className="flex-1 h-[5px] bg-bg2 rounded-full overflow-hidden"><div className="h-full bg-border rounded-full" style={{ width: '8%' }}></div></div>
                        <span className="text-[11px] text-text3 w-5 text-right">3</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-text2 w-2 shrink-0">3</span>
                        <div className="flex-1 h-[5px] bg-bg2 rounded-full overflow-hidden"><div className="h-full bg-border rounded-full" style={{ width: '4%' }}></div></div>
                        <span className="text-[11px] text-text3 w-5 text-right">2</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-text2 w-2 shrink-0">2</span>
                        <div className="flex-1 h-[5px] bg-bg2 rounded-full overflow-hidden"><div className="h-full bg-gold rounded-full" style={{ width: '0%' }}></div></div>
                        <span className="text-[11px] text-text3 w-5 text-right">0</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-text2 w-2 shrink-0">1</span>
                        <div className="flex-1 h-[5px] bg-bg2 rounded-full overflow-hidden"><div className="h-full bg-gold rounded-full" style={{ width: '0%' }}></div></div>
                        <span className="text-[11px] text-text3 w-5 text-right">0</span>
                    </div>

                    <div className="mt-3.5">
                        {prestador.avaliacoes?.map((av: any, i: number) => (
                            <div key={av.id || i} className="py-3.5 border-b border-border last:border-none">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[13px] font-bold text-text">{av.nomeCliente}</span>
                                    <span className="text-gold text-[12px]">{'★'.repeat(av.nota)}{'☆'.repeat(5 - av.nota)}</span>
                                </div>
                                <div className="text-[13px] text-text2 leading-relaxed">{av.comentario}</div>
                                <div className="text-[11px] text-text3 mt-1">Verificado · {cidade.nome}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Informações List */}
                <div className="p-4 border-b border-border">
                    <div className="text-[12px] font-bold text-text3 uppercase tracking-wider mb-2.5">Informações</div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-none">
                        <span className="text-[18px] shrink-0 w-6 text-center mt-px">{servico.icone || '⚡'}</span>
                        <div>
                            <div className="text-[11px] font-semibold text-text3 uppercase tracking-[0.4px] mb-0.5">Serviço</div>
                            <div className="text-[14px] font-semibold text-text">{servico.nome} residencial e comercial</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-none">
                        <span className="text-[18px] shrink-0 w-6 text-center mt-px">📍</span>
                        <div>
                            <div className="text-[11px] font-semibold text-text3 uppercase tracking-[0.4px] mb-0.5">Localização</div>
                            <div className="text-[14px] font-semibold text-text">Asa Sul, {cidade.nome} — {cidade.uf}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-none">
                        <span className="text-[18px] shrink-0 w-6 text-center mt-px">🕐</span>
                        <div>
                            <div className="text-[11px] font-semibold text-text3 uppercase tracking-[0.4px] mb-0.5">Atendimento</div>
                            <div className="text-[14px] font-semibold text-text">Segunda a sábado, 7h às 19h</div>
                        </div>
                    </div>
                </div>

                {/* Sobre */}
                <div className="p-4">
                    <div className="text-[12px] font-bold text-text3 uppercase tracking-wider mb-2.5">Sobre</div>
                    <p className="text-[14px] text-text2 leading-relaxed">
                        {prestador.descricao || "Profissional não adicionou uma descrição."}
                    </p>
                </div>

                {/* CTA Cadastro Upsell */}
                <div className="px-4 pb-4">
                    <div className="bg-bg2 rounded-[14px] p-4 text-center">
                        <div className="text-[13px] font-bold text-text mb-1">Também é prestador de serviço?</div>
                        <div className="text-[12px] text-text2 mb-3">Cadastre-se e apareça para milhares de clientes</div>
                        <Link href="/cadastro" className="inline-block bg-accent text-white font-bold rounded-lg text-[13px] px-3.5 py-2.5">Quero me cadastrar →</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
