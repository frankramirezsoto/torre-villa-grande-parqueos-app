// Lógica de validación extraída de EntryModal para que sea comprobable
// de forma aislada, sin necesidad de renderizar el componente (HU-05, HU-06).

const APARTMENT_MIN = 1
const APARTMENT_MAX = 30

/**
 * Valida que un número de apartamento esté dentro del rango de la torre.
 * Cualquier valor fuera de 1-30 (incluyendo vacío, 0, negativos o decimales)
 * se trata como error de rango.
 */
export function validarApartamento(apartment) {
  const value = Number(apartment)
  if (!Number.isInteger(value) || value < APARTMENT_MIN || value > APARTMENT_MAX) {
    return {
      valid: false,
      error: `El apartamento debe estar entre ${APARTMENT_MIN} y ${APARTMENT_MAX}.`
    }
  }
  return { valid: true, value }
}

/** Normaliza una placa: sin espacios al inicio/final, en mayúsculas. */
export function normalizarPlaca(plate) {
  return (plate || '').trim().toUpperCase()
}

/**
 * Valida los tres campos del formulario de registro de entrada.
 * Retorna el primer error encontrado, en el mismo orden en que
 * aparecen los campos en el formulario.
 */
export function validarFormularioEntrada({ visitorName, plate, apartment }) {
  if (!visitorName || !visitorName.trim()) {
    return { valid: false, error: 'Falta el nombre del visitante.' }
  }
  if (!plate || !plate.trim()) {
    return { valid: false, error: 'Falta la placa del vehículo.' }
  }
  const apartmentCheck = validarApartamento(apartment)
  if (!apartmentCheck.valid) {
    return apartmentCheck
  }
  return { valid: true }
}
