import { z } from 'zod'

export const gerarModoSchema = z.object({
    modo: z.string().optional()
})

export const manualSchema = z.object({
    servicoId: z.string().min(1),
    cidadeId: z.string().min(1),
    titulo: z.string().optional(),
    introducao: z.string().optional(),
    corpoTexto: z.string().optional(),
    precoMin: z.number().optional(),
    precoMax: z.number().optional(),
    beneficios: z.array(z.string()).optional(),
    dicas: z.array(z.object({ titulo: z.string(), descricao: z.string() })).optional(),
    faq: z.array(z.object({ pergunta: z.string(), resposta: z.string() })).optional()
})

export const individualSchema = z.object({
    servicoId: z.string().min(1),
    cidadeId: z.string().min(1)
})
