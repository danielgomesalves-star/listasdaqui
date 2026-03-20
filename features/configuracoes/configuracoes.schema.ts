import { z } from 'zod'

export const salvarConfigSchema = z.object({
    ANTHROPIC_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    AI_PROVIDER: z.enum(['anthropic', 'openai']).optional(),
})

export type SalvarConfigInput = z.infer<typeof salvarConfigSchema>
