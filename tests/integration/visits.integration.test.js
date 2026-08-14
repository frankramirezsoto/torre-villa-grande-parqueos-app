// @vitest-environment node
//
// Nivel 3 de la pirámide: a diferencia de las unitarias y de componente,
// estas SÍ hablan con una base de datos Supabase real -- la de un proyecto
// dedicado exclusivamente a pruebas (ver README, sección "Pruebas de
// integración"). No corren con `npm run test` (ese comando debe seguir
// siendo rápido y sin red, apto para correr en cada commit). Se ejecutan
// aparte con:
//
//   npm run test:integration

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { createAnonClient, createAuthClient, createServiceClient, resetVisits, getSpotId } from './clients'

let authClient
let serviceClient

beforeAll(async () => {
  serviceClient = createServiceClient()
  authClient = await createAuthClient()
}, 20000)

beforeEach(async () => {
  await resetVisits(serviceClient)
})

describe('I1: seed de espacios', () => {
  it('crea exactamente 30 espacios, 10 por cada uno de los 3 pisos', async () => {
    const { data, error } = await authClient.from('spots').select('floor, spot_number')
    expect(error).toBeNull()
    expect(data).toHaveLength(30)

    for (const floor of [1, 2, 3]) {
      const count = data.filter((s) => s.floor === floor).length
      expect(count).toBe(10)
    }
  })
})

describe('I2 / I3: restricciones de rango en spots', () => {
  // Usan el cliente de service_role a propósito: no existe política de INSERT
  // para spots (nunca hace falta insertar uno desde la app), así que con el
  // cliente autenticado normal estaríamos probando el permiso, no la restricción.
  it('I2: rechaza un espacio con floor fuera de 1-3', async () => {
    const { error } = await serviceClient.from('spots').insert({ floor: 4, spot_number: 1 })
    expect(error).not.toBeNull()
    expect(error.code).toBe('23514') // check_violation
  })

  it('I3: rechaza un espacio con spot_number fuera de 1-10', async () => {
    const { error } = await serviceClient.from('spots').insert({ floor: 1, spot_number: 11 })
    expect(error).not.toBeNull()
    expect(error.code).toBe('23514')
  })
})

describe('I4: un espacio de visita por apartamento', () => {
  it('rechaza una segunda visita activa para un apartamento que ya tiene una', async () => {
    const spotA = await getSpotId(serviceClient, 1, 1)
    const spotB = await getSpotId(serviceClient, 1, 2)

    const first = await authClient.from('visits').insert({
      spot_id: spotA, apartment: 12, plate: 'AAA111', visitor_name: 'Primera visita'
    })
    expect(first.error).toBeNull()

    const second = await authClient.from('visits').insert({
      spot_id: spotB, apartment: 12, plate: 'BBB222', visitor_name: 'Segunda visita, mismo apto'
    })
    expect(second.error).not.toBeNull()
    expect(second.error.code).toBe('23505') // unique_violation
  })
})

describe('I5: un espacio no puede tener dos visitas activas', () => {
  it('rechaza una segunda visita activa para el mismo espacio', async () => {
    const spotA = await getSpotId(serviceClient, 1, 3)

    const first = await authClient.from('visits').insert({
      spot_id: spotA, apartment: 5, plate: 'CCC333', visitor_name: 'Primera visita'
    })
    expect(first.error).toBeNull()

    const second = await authClient.from('visits').insert({
      spot_id: spotA, apartment: 6, plate: 'DDD444', visitor_name: 'Segunda visita, mismo espacio'
    })
    expect(second.error).not.toBeNull()
    expect(second.error.code).toBe('23505')
  })
})

describe('I6: RLS bloquea el acceso sin sesión', () => {
  it('una consulta sin sesión no retorna ninguna fila (RLS filtra en silencio, sin error)', async () => {
    const spotA = await getSpotId(serviceClient, 2, 5)
    await authClient.from('visits').insert({
      spot_id: spotA, apartment: 8, plate: 'HHH888', visitor_name: 'Visita de control'
    })

    const anon = createAnonClient()
    const { data, error } = await anon.from('visits').select('*')
    expect(error).toBeNull()
    expect(data).toEqual([]) // la fila existe, pero RLS la oculta sin sesión
  })

  it('un intento de insertar sin sesión es rechazado explícitamente', async () => {
    const anon = createAnonClient()
    const spotA = await getSpotId(serviceClient, 2, 1)
    const { error } = await anon.from('visits').insert({
      spot_id: spotA, apartment: 9, plate: 'EEE555', visitor_name: 'Sin sesión'
    })
    expect(error).not.toBeNull() // a diferencia del select, insert SÍ da error explícito
  })
})

describe('I7: liberar un espacio permite una nueva entrada', () => {
  it('tras registrar la salida, el espacio acepta una nueva visita activa', async () => {
    const spotA = await getSpotId(serviceClient, 3, 1)

    const first = await authClient
      .from('visits')
      .insert({ spot_id: spotA, apartment: 20, plate: 'FFF666', visitor_name: 'Visita que se va' })
      .select()
      .single()
    expect(first.error).toBeNull()

    const exit = await authClient
      .from('visits')
      .update({ exit_time: new Date().toISOString() })
      .eq('id', first.data.id)
    expect(exit.error).toBeNull()

    const second = await authClient.from('visits').insert({
      spot_id: spotA, apartment: 21, plate: 'GGG777', visitor_name: 'Visita nueva'
    })
    expect(second.error).toBeNull()
  })
})
