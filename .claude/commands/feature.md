# /feature — Criar ou expandir uma feature compartimentalizada

Você é um engenheiro de software trabalhando no projeto **ListasDaqui** (Next.js 14 App Router + TypeScript + Prisma + Redis).

## Regra de arquitetura obrigatória

Toda lógica de negócio DEVE viver em `features/`. As rotas `app/api/` são **thin controllers** — só fazem:
1. Autenticação
2. Chamar a função da feature
3. Retornar NextResponse

**NUNCA coloque `prisma.*`, regras de negócio ou envio de email diretamente em `route.ts`.**

## Estrutura padrão de uma feature

```
features/{nome}/
├── {nome}.schema.ts    ← schemas Zod (validação de input)
└── {nome}.service.ts   ← funções de negócio (prisma, emails, filas)
```

## Features existentes (não recriar)

```
features/
├── auth/                  → login/registro de usuários
├── onboarding/            → emails de boas-vindas, MOTIVOS_REJEICAO
├── prestadores/           → CRUD público de prestadores
├── prestadores-admin/     → aprovar, rejeitar, bloquear (admin)
├── admin-auth/            → login do painel admin
├── seo/                   → conteudo SEO por cidade+serviço
├── media/                 → upload de imagens (S3/R2)
└── painel/                → painel do prestador (conta, perfil)
```

## Como implementar uma nova feature

### 1. Criar o schema
```typescript
// features/{nome}/{nome}.schema.ts
import { z } from 'zod'
export const meuSchema = z.object({ ... })
```

### 2. Criar o service
```typescript
// features/{nome}/{nome}.service.ts
import { prisma } from '@/lib/prisma'

export async function minhaFuncao(params: { ... }) {
  return prisma.modelo.findMany({ ... })
}
```

### 3. Criar o route handler (thin controller)
```typescript
// app/api/{path}/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { meuSchema } from '@/features/{nome}/{nome}.schema'
import { minhaFuncao } from '@/features/{nome}/{nome}.service'

export async function POST(req: NextRequest) {
  const data = meuSchema.parse(await req.json())
  const result = await minhaFuncao(data)
  return NextResponse.json(result)
}
```

## Checklist antes de commitar

- [ ] Nenhum `prisma.*` dentro de `route.ts`
- [ ] Nenhum `emailQueue.add()` dentro de `route.ts`
- [ ] Schema Zod no `.schema.ts`, não inline no route
- [ ] Feature tem `{nome}.schema.ts` E `{nome}.service.ts`
- [ ] `npm run build` passa sem erros

## Deploy (servidor CentOS 7 — não suporta build remoto)

O servidor tem **glibc 2.17** — o SWC do Next.js exige 2.28+. O build DEVE ser feito localmente:

```bash
# 1. Build local (Windows/PowerShell)
npm run build

# 2. Upload para o servidor
pscp -P 4360 -r .next root@167.114.209.181:/var/www/listasdaqui/

# 3. Restart no servidor (PuTTY)
pm2 restart listasdaqui-app
```

**NUNCA rodar `npm run build` no servidor diretamente — vai crashar com SIGSEGV.**

---

Agora analise o que o usuário pediu e implemente seguindo estas regras.
$ARGUMENTS
