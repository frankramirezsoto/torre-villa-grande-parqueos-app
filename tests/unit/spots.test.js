import { describe, it, expect } from 'vitest'
import { generarCodigoEspacio, contarDisponibles, obtenerEstado } from '../../src/utils/spots'

describe('contarDisponibles (U4)', () => {
  it('cuenta correctamente los espacios libres de una lista mixta', () => {
    const spots = [
      { activeVisit: null },
      { activeVisit: { id: 'v1' } },
      { activeVisit: null },
      { activeVisit: { id: 'v2' } },
      { activeVisit: { id: 'v3' } },
      { activeVisit: null },
      { activeVisit: null },
      { activeVisit: null },
      { activeVisit: null },
      { activeVisit: null }
    ]
    expect(contarDisponibles(spots)).toBe(7)
  })

  it('retorna 0 cuando todos los espacios están ocupados', () => {
    const spots = [{ activeVisit: { id: 'v1' } }, { activeVisit: { id: 'v2' } }]
    expect(contarDisponibles(spots)).toBe(0)
  })
})

describe('obtenerEstado (U6)', () => {
  it('retorna "libre" cuando activeVisit es null', () => {
    expect(obtenerEstado({ activeVisit: null })).toBe('libre')
  })

  it('retorna "ocupado" cuando hay una visita activa', () => {
    expect(obtenerEstado({ activeVisit: { id: 'v1', plate: 'ABC123' } })).toBe('ocupado')
  })
})
