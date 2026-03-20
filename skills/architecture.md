# Arquitetura — ListasDaqui

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL via Prisma ORM |
| Cache / Filas | Redis + BullMQ |
| Autenticação | JWT (usuários) + JWT separado (admin) |
| Email | Nodemailer via fila BullMQ |
| Deploy | PM2 cluster no CentOS 7 |
| CSS | Tailwind CSS |

## Padrão de camadas

```
HTTP Request
    │
    ▼
app/api/{rota}/route.ts       ← Thin controller
    │  (auth + chamar service + retornar NextResponse)
    │
    ▼
features/{nome}/{nome}.service.ts  ← Lógica de negócio
    │  (prisma, emailQueue, regras)
    │
    ▼
lib/prisma.ts / lib/redis.ts  ← Infraestrutura
```

## Features existentes

```
features/
├── auth/                  → Login e registro de usuários
│   ├── auth.schema.ts
│   └── auth.service.ts
│
├── onboarding/            → Emails de boas-vindas e MOTIVOS_REJEICAO
│   ├── onboarding.schema.ts
│   └── onboarding.service.ts
│
├── prestadores/           → CRUD público de prestadores
│   ├── prestadores.schema.ts
│   └── prestadores.service.ts
│
├── prestadores-admin/     → Aprovar, rejeitar, bloquear (painel admin)
│   ├── prestadores-admin.schema.ts
│   └── prestadores-admin.service.ts
│
├── admin-auth/            → Login do painel administrativo
│   ├── admin-auth.schema.ts
│   └── admin-auth.service.ts
│
├── seo/                   → Conteúdo SEO por cidade+serviço (Content Factory)
│   ├── seo.schema.ts
│   └── seo.service.ts
│
├── media/                 → Upload de imagens
│   ├── media.schema.ts
│   └── media.service.ts
│
└── painel/                → Painel do prestador (conta, perfil)
    ├── painel.schema.ts
    └── painel.service.ts
```

## Componentes UI

```
components/ui/
├── Avatar.tsx             → Iniciais + foto + badge isPago
├── ServiceCard.tsx        → Card de serviço com ícone
├── SectionHeader.tsx      → Cabeçalho de seção com link opcional
├── StatsRow.tsx           → Linha de estatísticas {value, label}[]
├── CTABanner.tsx          → Banner call-to-action
├── FeaturedProviderItem.tsx → Item de prestador em destaque
├── FAQItem.tsx            → Accordion FAQ (details/summary)
├── RatingBar.tsx          → Barra de avaliação com percentual
├── FormField.tsx          → Wrapper de campo de formulário
└── PlanCard.tsx           → Card de plano GRATUITO/VERIFICADO
```

## SEO implementado

- JSON-LD: BreadcrumbList, ItemList, FAQPage, LocalBusiness, AggregateRating
- Open Graph + Twitter Card via `generateMetadata()`
- PWA manifest.json (theme_color #0EA5E9, display standalone)
- Nginx Gzip com tipos expandidos + headers de segurança

## Banco de dados (modelos principais)

- `User` — usuário autenticado
- `Prestador` — ficha do prestador de serviço
- `Servico` — categoria/tipo de serviço
- `Cidade` — cidade com UF
- `Conteudo` — SEO por (cidade × serviço)
- `AuditLog` — log de ações administrativas
- `Rejeicao` — histórico de rejeições de cadastro
- `Bloqueio` — bloqueios de ficha ou usuário
