import { z } from 'zod'

export const listarQuerySchema = z.object({
    pagina: z.coerce.number().default(1),
    porPagina: z.coerce.number().default(50),
    status: z.enum(['pendentes', 'bloqueados', 'ativos', 'todos']).optional()
})

export const bloquearFichaSchema = z.object({
    motivo: z.string().min(3)
})

export const rejeitarSchema = z.object({
    motivo: z.string().min(1, 'Motivo obrigatorio'),
    detalhes: z.string().optional()
})
