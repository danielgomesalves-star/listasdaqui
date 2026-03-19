import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32).default('a-very-secret-key-32-chars-long-XYZ!'),
  JWT_REFRESH_SECRET: z.string().min(32).default('another-secret-key-32-chars-long-ABC!'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'), // Default local fallback
  ANTHROPIC_API_KEY: z.string().default('sk-ant-dummy'),
  RESEND_API_KEY: z.string().default('re_dummy'),
  EMAIL_FROM: z.string().email().default('noreply@listasdaqui.com.br'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// process.env destructuring might fail in some edge environments if not handled carefully,
// but Next.js automatically injects process.env here.
export const env = envSchema.parse(process.env)
