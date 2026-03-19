import { prisma } from '@/lib/prisma'
import { writeFileSync } from 'fs'

async function main() {
    const prestadores = await prisma.prestador.findMany({
        where: { ativo: true },
        include: { servico: true, cidade: true }
    })

    // Transforma cada prestador da versao legada em redirecionamento de Nginx
    const linhas = prestadores.map(p => {
        const antiga = `/negocios/${p.slug}/`
        const nova = `/${p.cidade.slug}-${p.cidade.uf.toLowerCase()}/${p.servico.slug}/${p.slug}/`
        return `${antiga} ${nova};`
    })

    writeFileSync('/etc/nginx/redirects-listasdaqui.map', linhas.join('\n'))
    console.log(`${linhas.length} redirecionamentos gerados e salvos em /etc/nginx/redirects-listasdaqui.map`)
}

main()
