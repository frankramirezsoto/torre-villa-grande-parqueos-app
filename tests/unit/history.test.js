import { describe, it, expect } from 'vitest'
import { filtrarPorPlaca } from '../../src/utils/history'

const historial = [
  { plate: 'BCR482', visitor_name: 'Marco Jiménez' },
  { plate: 'CL204X', visitor_name: 'Andrea Solano' },
  { plate: 'bcr910', visitor_name: 'Luis Fernández' } // minúsculas a propósito
]

describe('filtrarPorPlaca (U8)', () => {
  it('retorna solo los registros cuya placa contiene el término, sin distinguir mayúsculas', () => {
    const result = filtrarPorPlaca(historial, 'bcr')
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.plate)).toEqual(['BCR482', 'bcr910'])
  })

  it('retorna la lista completa cuando el filtro está vacío', () => {
    expect(filtrarPorPlaca(historial, '')).toHaveLength(3)
    expect(filtrarPorPlaca(historial, '   ')).toHaveLength(3)
  })

  it('retorna una lista vacía cuando ninguna placa coincide', () => {
    expect(filtrarPorPlaca(historial, 'zzz')).toEqual([])
  })
})
