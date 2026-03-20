# Skill: Feature Compartimentalizada

## Regra fundamental

Toda lógica de negócio DEVE viver em `features/`.
As rotas `app/api/` são **thin controllers** — só fazem:
1. Autenticação
2. Chamar a função da feature
3. Retornar `NextResponse`

**Nunca coloque `prisma.*`, `emailQueue`, ou regras de negócio diretamente em `route.ts`.**

## Estrutura de uma feature

```
features/{nome}/
├── {nome}.schema.ts    ← Schemas Zod (validação de input/output)
└── {nome}.service.ts   ← Funções de negócio (prisma, emails, filas)
```

## Exemplo completo

### schema.ts
```typescript
// features/avaliacoes/avaliacoes.schema.ts
import { z } from 'zod'

export const criarAvaliacaoSchema = z.object({
    prestadorId: z.string().cuid(),
    nota: z.number().int().min(1).max(5),
    comentario: z.string().max(500).optional()
})

export type CriarAvaliacaoInput = z.infer<typeof criarAvaliacaoSchema>
```

### service.ts
```typescript
// features/avaliacoes/avaliacoes.service.ts
import { prisma } from '@/lib/prisma'
import type { CriarAvaliacaoInput } from './avaliacoes.schema'

export async function criarAvaliacao(userId: string, input: CriarAvaliacaoInput) {
    return prisma.avaliacao.create({
        data: { userId, ...input }
    })
}

export async function listarAvaliacoes(prestadorId: string) {
    return prisma.avaliacao.findMany({
        where: { prestadorId },
        orderBy: { createdAt: 'desc' }
    })
}
```

### route.ts (thin controller)
```typescript
// app/api/avaliacoes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { criarAvaliacaoSchema } from '@/features/avaliacoes/avaliacoes.schema'
import { criarAvaliacao } from '@/features/avaliacoes/avaliacoes.service'

export async function POST(req: NextRequest) {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const input = criarAvaliacaoSchema.parse(await req.json())
    const avaliacao = await criarAvaliacao(session.userId, input)
    return NextResponse.json(avaliacao, { status: 201 })
}
```

## Checklist antes de commitar

- [ ] Nenhum `prisma.*` dentro de `route.ts`
- [ ] Nenhum `emailQueue.add()` dentro de `route.ts`
- [ ] Schema Zod em `.schema.ts`, não inline no route
- [ ] Feature tem `{nome}.schema.ts` **e** `{nome}.service.ts`
- [ ] `npm run build` passa sem erros localmente
- [ ] Fazer deploy após commit (ver [deploy.md](./deploy.md))

## Features existentes — consultar antes de criar

Ver [architecture.md](./architecture.md#features-existentes) para lista completa.
Nunca criar feature duplicada — expandir a existente.

## Padrões específicos preservados

- `rejeitar/route.ts` usa `verifyAdminToken` direto (não `superAdminOnly`) — preservar
- `auditLog` dentro de `$transaction` em rejeitar — preservar atomicidade
- Worker `listasdaqui-worker` usa `tsx` para rodar TypeScript diretamente
