import { z } from 'zod'

export const cadastroSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres').max(72),
    whatsapp: z.string().regex(/^\+55\d{10,11}$/, 'Formato: +5511999990000'),
    cidadeId: z.string().min(1, 'A cidade é obrigatória'),
    servicoId: z.string().min(1, 'O serviço principal é obrigatório'),
    bio: z.string().max(500, 'A biografia não pode exceder 500 caracteres').optional(),
    instagram: z.string().max(60).optional(),
})

export const atualizarPrestadorSchema = z.object({
    nome: z.string().min(3).max(100).optional(),
    whatsapp: z.string().regex(/^\+55\d{10,11}$/).optional(),
    bio: z.string().max(500).optional(),
    instagram: z.string().max(60).optional(),
    foto: z.string().url().optional(),
})
