import { z } from 'zod'

export const adminLoginSchema = z.object({
    email: z.string().email(),
    senha: z.string()
})
