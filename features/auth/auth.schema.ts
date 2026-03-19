import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
})

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})
