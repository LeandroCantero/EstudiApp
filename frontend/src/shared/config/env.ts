import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Valida las variables de entorno del frontend.
 * Si falta algo, la app lanzará un error descriptivo al buildear/arrancar.
 */
export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
});
