# Skills — ListasDaqui

Documentação de convenções, padrões e processos do projeto.
Legível por qualquer agente de IA ou desenvolvedor.

## Índice

| Skill | Arquivo | Descrição |
|---|---|---|
| Arquitetura | [architecture.md](./architecture.md) | Visão geral do projeto e stack técnica |
| Feature | [feature.md](./feature.md) | Como criar/expandir uma feature compartimentalizada |
| Deploy | [deploy.md](./deploy.md) | Processo de deploy para o servidor de produção |

## Como usar (Claude Code)

```
/feature   → Criar ou expandir uma feature
/deploy    → Executar o processo de deploy
```

## Estrutura de pastas relevante

```
listasdaqui/
├── app/                  → Rotas Next.js (thin controllers apenas)
├── features/             → Toda lógica de negócio
├── components/           → Componentes React reutilizáveis
├── components/ui/        → Componentes de UI atômicos
├── lib/                  → Utilitários (prisma, redis, auth)
├── config/               → Configuração (env, constantes)
├── jobs/                 → Filas de background (BullMQ)
├── prisma/               → Schema e migrations do banco
├── public/               → Assets estáticos
└── skills/               → Esta pasta (convenções do projeto)
```
