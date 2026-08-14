import { describe, it, expect } from 'vitest'
import { validarApartamento, normalizarPlaca, validarFormularioEntrada } from '../../src/utils/validation'

describe('validarApartamento (U1)', () => {
  it('rechaza apartamentos fuera del rango 1-30', () => {
    expect(validarApartamento(0).valid).toBe(false)
    expect(validarApartamento(0).error).toMatch(/entre 1 y 30/)

    expect(validarApartamento(31).valid).toBe(false)
    expect(validarApartamento(31).error).toMatch(/entre 1 y 30/)
  })

  it('acepta apartamentos dentro del rango', () => {
    expect(validarApartamento(1)).toEqual({ valid: true, value: 1 })
    expect(validarApartamento(30)).toEqual({ valid: true, value: 30 })
    expect(validarApartamento(15).valid).toBe(true)
  })
})

describe('normalizarPlaca (U3)', () => {
  it('recorta espacios y convierte a mayúsculas', () => {
    expect(normalizarPlaca(' abc123 ')).toBe('ABC123')
  })

  it('maneja valores vacíos o indefinidos sin lanzar error', () => {
    expect(normalizarPlaca('')).toBe('')
    expect(normalizarPlaca(undefined)).toBe('')
  })
})

describe('validarFormularioEntrada (U7)', () => {
  it('retorna error indicando que falta el nombre cuando viene vacío', () => {
    const result = validarFormularioEntrada({ visitorName: '', plate: 'ABC123', apartment: 5 })
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Falta el nombre del visitante.')
  })

  it('retorna error indicando que falta la placa cuando viene vacía', () => {
    const result = validarFormularioEntrada({ visitorName: 'Karla Rojas', plate: '  ', apartment: 5 })
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Falta la placa del vehículo.')
  })

  it('propaga el error de rango cuando el apartamento es inválido', () => {
    const result = validarFormularioEntrada({ visitorName: 'Karla Rojas', plate: 'ABC123', apartment: 99 })
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/entre 1 y 30/)
  })

  it('es válido cuando los tres campos están correctos', () => {
    const result = validarFormularioEntrada({ visitorName: 'Karla Rojas', plate: 'ABC123', apartment: 12 })
    expect(result.valid).toBe(true)
  })
})
