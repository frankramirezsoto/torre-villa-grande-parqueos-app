// Nivel 4 de la pirámide: simulan el flujo completo del guarda real, de
// principio a fin, con un navegador de verdad. Corren aparte de todo lo
// demás porque son las más lentas y las que más infraestructura necesitan:
//
//   npm run test:e2e
//
// Requiere haber configurado .env.e2e y .env.test (ver README, sección E2E).

import { test, expect } from '@playwright/test'
import { resetTestData, loginAsGuard, clickSpot } from './fixtures.js'

test.describe.configure({ mode: 'serial' }) // comparten la misma base de datos de prueba

test.beforeEach(async () => {
  await resetTestData()
})

async function registrarEntrada(page, code, { nombre, placa, apartamento }) {
  await clickSpot(page, code)
  await page.getByLabel('Nombre del visitante').fill(nombre)
  await page.getByLabel('Placa').fill(placa)
  await page.getByLabel('Apartamento').fill(String(apartamento))
  await page.getByRole('button', { name: 'Registrar entrada' }).click()
}

test('E1: login carga el dashboard con el piso 1 y sus 10 espacios libres', async ({ page }) => {
  await loginAsGuard(page)

  await expect(page.getByText('P1-01')).toBeVisible()
  await expect(page.getByText('P1-10')).toBeVisible()
  await expect(page.getByText('LIBRE')).toHaveCount(11) // 10 espacios + el texto que dice 10 espacios libres
})

test('E2: cambiar a piso 2 muestra los códigos P2-01 a P2-10, no los de piso 1', async ({ page }) => {
  await loginAsGuard(page)

  await page.getByRole('button', { name: '2', exact: true }).click()

  await expect(page.getByText('P2-01')).toBeVisible()
  await expect(page.getByText('P1-01')).not.toBeVisible()
})

test('E3: registrar una entrada hace que el espacio muestre la placa, sin recargar la página', async ({ page }) => {
  await loginAsGuard(page)

  await registrarEntrada(page, 'P1-01', { nombre: 'Karla Rojas', placa: 'abc123', apartamento: 12 })

  await expect(page.getByText('ABC123')).toBeVisible() // normalizada en mayúsculas
})

test('E4: una segunda entrada para un apartamento ya ocupado se bloquea con un mensaje', async ({ page }) => {
  await loginAsGuard(page)

  await registrarEntrada(page, 'P1-01', { nombre: 'Karla Rojas', placa: 'ABC123', apartamento: 12 })
  await expect(page.getByText('ABC123')).toBeVisible()

  await registrarEntrada(page, 'P1-02', { nombre: 'Otro Visitante', placa: 'XYZ999', apartamento: 12 })

  await expect(page.getByText('El apartamento 12 ya tiene un espacio de visita ocupado.')).toBeVisible()
  await expect(page.getByText('XYZ999')).not.toBeVisible() // el segundo registro nunca se creó
})

test('E5: ver el detalle de un espacio ocupado y registrar la salida lo libera', async ({ page }) => {
  await loginAsGuard(page)

  await registrarEntrada(page, 'P1-01', { nombre: 'Karla Rojas', placa: 'ABC123', apartamento: 12 })
  await expect(page.getByText('ABC123')).toBeVisible()

  await clickSpot(page, 'P1-01')
  await expect(page.getByText('Karla Rojas')).toBeVisible()
  await page.getByRole('button', { name: 'Registrar salida' }).click()

  await expect(page.getByRole('button').filter({ hasText: 'P1-01' }).getByText('Libre')).toBeVisible()
})

test('E6: filtrar el historial por placa muestra solo esa placa', async ({ page }) => {
  await loginAsGuard(page)

  await registrarEntrada(page, 'P1-01', { nombre: 'Karla Rojas', placa: 'ABC123', apartamento: 12 })
  await expect(page.getByText('ABC123')).toBeVisible()

  await registrarEntrada(page, 'P1-02', { nombre: 'Andrea Solano', placa: 'XYZ999', apartamento: 7 })
  await expect(page.getByText('XYZ999')).toBeVisible()

  await page.getByRole('button', { name: 'Historial' }).click()
  await page.getByPlaceholder('Placa').fill('abc')
  await page.getByRole('button', { name: 'Filtrar' }).click()

  await expect(page.getByText('Karla Rojas')).toBeVisible()
  await expect(page.getByText('Andrea Solano')).not.toBeVisible()
})
