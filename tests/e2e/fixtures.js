import { expect } from '@playwright/test'
import '../integration/env.js' // carga .env.test (mismas credenciales que integración)
import { createServiceClient, resetVisits, getSpotId } from '../integration/clients.js'

export const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
export const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

/** Deja la tabla visits limpia (30 espacios libres) antes de cada prueba. */
export async function resetTestData() {
  const serviceClient = createServiceClient()
  await resetVisits(serviceClient)
  return serviceClient
}

export { getSpotId }

/** Inicia sesión como el guarda de prueba y espera a que cargue el dashboard. */
export async function loginAsGuard(page) {
  await page.goto('/')
  await page.getByLabel('Usuario').fill(TEST_USER_EMAIL)
  await page.getByLabel('Contraseña').fill(TEST_USER_PASSWORD)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page.getByText('Control de Parqueo')).toBeVisible()
}

/** Hace clic en el cuadro de un espacio a partir de su código (ej. "P1-05"). */
export async function clickSpot(page, code) {
  await page.getByRole('button').filter({ hasText: code }).click()
}
