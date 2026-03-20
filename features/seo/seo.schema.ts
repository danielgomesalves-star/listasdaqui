import { z } from 'zod'

export const gerarModoSchema = z.object({
    modo: z.string().optional()
})

export const manualSchema = z.object({
    servicoId: z.string().min(1),
    cidadeId: z.string().min(1),
    titulo: z.string().optional(),
    descricao: z.string().optional(),
    precoMin: z.number().optional(),
    precoMax: z.number().optional(),
    faq: z.unknown().optional()
})

export const individualSchema = z.object({
    servicoId: z.string().min(1),
    cidadeId: z.string().min(1)
})
