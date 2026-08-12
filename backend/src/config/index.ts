import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Not validated with z.string().url(): the WHATWG URL parser rejects
  // legitimate multi-host connection strings (e.g. Atlas's standard,
  // non-SRV format lists comma-separated host:port pairs, which the
  // URL spec's authority component doesn't allow).
  MONGODB_URI: z
    .string()
    .min(1, 'Required')
    .regex(/^mongodb(\+srv)?:\/\/\S+$/, 'Must be a valid mongodb:// or mongodb+srv:// connection string'),
  CRAWLER_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  CRAWLER_MAX_RESPONSE_BYTES: z.coerce.number().int().positive().default(5242880),
  CRAWLER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  CRAWLER_MAX_NAV_LINKS: z.coerce.number().int().positive().default(20),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

type Config = z.infer<typeof envSchema>;

let config: Config;

export function loadConfig(): Config {
  const env = process.env;

  try {
    config = envSchema.parse(env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Environment validation failed:\n${formatted}`);
    }
    throw error;
  }
}

export function getConfig(): Config {
  if (!config) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return config;
}
