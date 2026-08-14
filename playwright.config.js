import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '.env.test') })

// Fallamos fuerte y temprano en vez de dejar que Vite caiga en silencio a
// un .env equivocado -- es exactamente el tipo de fallo silencioso que
// causó el problema original.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan SUPABASE_URL / SUPABASE_ANON_KEY en .env.test.\n' +
    'Copia .env.test.example a .env.test y complétalo (ver README, sección "Pruebas de integración").'
  )
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,

  // Todas las pruebas E2E comparten el mismo proyecto Supabase de prueba.
  // Correrlas en paralelo haría que se pisen entre sí (una registra una
  // entrada mientras otra está a medio verificar el grid). Un solo worker,
  // en serie, las hace lentas pero deterministas -- lo correcto para este
  // nivel de la pirámide.
  fullyParallel: false,
  workers: 1,
  retries: 0,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:5173',
    // Nunca reusa un servidor que ya esté corriendo. Combinado con
    // strictPort en vite.config.js, cualquier conflicto de puerto falla
    // fuerte y visible, en vez de servir en silencio la app equivocada.
    reuseExistingServer: false,
    timeout: 30000,
    // CLAVE: estas variables se inyectan directamente en el proceso hijo
    // que arranca Vite. Esto le gana a CUALQUIER archivo .env, .env.local
    // o .env.e2e que exista o no exista en el proyecto -- ya no depende de
    // que Vite resuelva bien la precedencia entre archivos. Reutiliza las
    // mismas credenciales de .env.test que ya usan las pruebas de integración.
    env: {
      VITE_SUPABASE_URL: process.env.SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    }
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
})
