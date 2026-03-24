/** Gera a URL dinâmica para a imagem OG sem dependências pesadas */
export function buildOgUrl(servicoNome: string, servicoSlug: string, cidadeNome: string, uf: string): string {
    const params = new URLSearchParams({ servico: servicoNome, slug: servicoSlug, cidade: cidadeNome, uf })
    return `/api/og?${params.toString()}`
}
