import { NextResponse } from 'next/server'

export async function GET() {
    const content = `User-agent: *
Allow: /

# Bloquear rotas antigas do WordPress para ajudar na transição limpar indexacao antiga
Disallow: /negocios/
Disallow: /segmentos/
Disallow: /wp-admin/
Disallow: /wp-login.php
Disallow: /wp-content/plugins/
Disallow: /wp-content/themes/

# Bloquear painel logado e APIs REST do novo sistema
Disallow: /painel/
Disallow: /admin/
Disallow: /api/
Disallow: /conta/

Sitemap: https://listasdaqui.com.br/sitemap.xml`

    return new NextResponse(content, {
        headers: { 'Content-Type': 'text/plain' }
    })
}
