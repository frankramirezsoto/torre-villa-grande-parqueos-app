import './env.js'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

function assertEnv() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'TEST_USER_EMAIL', 'TEST_USER_PASSWORD']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno para las pruebas de integración: ${missing.join(', ')}.\n` +
      'Copia .env.test.example a .env.test y complétalo con los datos de tu proyecto Supabase de prueba (ver README).'
    )
  }
}

/** Cliente sin sesión — simula a alguien que no ha iniciado sesión (I6). */
export function createAnonClient() {
  assertEnv()
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/** Cliente autenticado como el guarda de prueba — el mismo camino que usa la app real. */
export async function createAuthClient() {
  assertEnv()
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { error } = await client.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD
  })
  if (error) {
    throw new Error(
      `No se pudo iniciar sesión con el usuario de prueba (${TEST_USER_EMAIL}): ${error.message}\n` +
      'Verifica que lo creaste en Authentication > Users del proyecto de prueba, y que la contraseña coincide con .env.test.'
    )
  }
  return client
}

/**
 * Cliente con la service_role key — ignora RLS por completo. Se usa SOLO para
 * preparar y limpiar datos de prueba (fixtures), nunca para comprobar el
 * comportamiento real de la app, que siempre debe pasar por RLS.
 */
export function createServiceClient() {
  assertEnv()
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

/** Borra todas las visitas para dejar la tabla limpia antes de cada prueba. */
export async function resetVisits(serviceClient) {
  const { error } = await serviceClient.from('visits').delete().not('id', 'is', null)
  if (error) {
    throw new Error(`No se pudo limpiar la tabla visits antes de la prueba: ${error.message}`)
  }
}

/** Trae el id real de un espacio sembrado, para usarlo como spot_id en los inserts de prueba. */
export async function getSpotId(serviceClient, floor, spotNumber) {
  const { data, error } = await serviceClient
    .from('spots')
    .select('id')
    .eq('floor', floor)
    .eq('spot_number', spotNumber)
    .single()
  if (error) {
    throw new Error(`No se encontró el espacio P${floor}-${spotNumber} en la base de prueba: ${error.message}`)
  }
  return data.id
}
