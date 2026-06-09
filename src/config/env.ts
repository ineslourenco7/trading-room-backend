import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
})

export const env = envSchema.parse(process.env)
