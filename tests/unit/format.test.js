import { describe, it, expect } from 'vitest'
import { formatearHora } from '../../src/utils/format'

describe('formatearHora (U5)', () => {
  it('formatea una fecha ISO como dd/mm/yy, hh:mm en 24 horas, con padding', () => {
    const result = formatearHora('2026-07-30T13:10:00')
    expect(result).toBe('30/07/26, 13:10')
  })

  it('agrega el padding correcto para días, meses y horas de un solo dígito', () => {
    const result = formatearHora('2026-01-05T09:05:00')
    expect(result).toBe('05/01/26, 09:05')
  })

  it('retorna un guion largo cuando no hay fecha', () => {
    expect(formatearHora(null)).toBe('—')
    expect(formatearHora(undefined)).toBe('—')
  })
})
