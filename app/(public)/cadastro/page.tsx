import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import CadastroForm from './CadastroForm'

const prisma = new PrismaClient()

// Revalidate occasionally, but since cities/services rarely change, 24h is fine
export const revalidate = 86400

export default async function CadastroPage() {
    const [servicos, cidades] = await Promise.all([
        prisma.servico.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
        prisma.cidade.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
    ])

    return (
        <div className="flex flex-col flex-1 pb-16 bg-white overflow-y-auto w-full">
            <div className="cad-hero">
                <div className="flex justify-between items-center mb-4">
                    <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 text-white no-underline shrink-0">←</Link>
                    <span className="text-sm font-black text-white tracking-tight">Listas<em className="text-[#7DD3FC] not-italic">Daqui</em></span>
                </div>
                <h2 className="text-[22px] font-black text-white leading-tight mb-2 tracking-tight">Cadastre-se e receba clientes</h2>
                <p className="text-[14px] text-white/80 leading-relaxed max-w-[280px]">Apareça para quem está procurando seu serviço agora na sua cidade</p>
            </div>

            <CadastroForm servicos={servicos} cidades={cidades} />
        </div>
    )
}
