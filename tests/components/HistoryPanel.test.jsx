import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HistoryPanel from '../../src/components/HistoryPanel'
import { supabase } from '../../src/supabaseClient'

vi.mock('../../src/supabaseClient', () => ({
  supabase: { from: vi.fn() }
}))

// El cliente de Supabase encadena métodos (.select().order().limit()...) y el
// resultado final se "awaitea" directamente. Este builder simula esa cadena:
// cada método devuelve el mismo objeto (para poder seguir encadenando) y el
// objeto es "then-able", así que `await query` funciona igual que en producción.
function buildQuery(result) {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    then: (resolve) => resolve(result)
  }
  return builder
}

const allRows = [
  { id: 'v1', plate: 'BCR482', visitor_name: 'Marco Jiménez', apartment: 12, entry_time: '2026-07-30T13:10:00', exit_time: null, spots: { code: 'P1-02' } },
  { id: 'v2', plate: 'CL204X', visitor_name: 'Andrea Solano', apartment: 7, entry_time: '2026-07-30T14:00:00', exit_time: null, spots: { code: 'P1-05' } }
]

describe('HistoryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('C10: al filtrar por apartamento, consulta solo ese apartamento y muestra solo su fila', async () => {
    // Carga inicial al montar el componente: todos los registros.
    supabase.from.mockReturnValueOnce(buildQuery({ data: allRows, error: null }))
    render(<HistoryPanel onClose={() => {}} />)

    expect(await screen.findByText('Marco Jiménez')).toBeInTheDocument()
    expect(screen.getByText('Andrea Solano')).toBeInTheDocument()

    // Segunda carga, disparada por el filtro: solo el apartamento 12.
    const filteredQuery = buildQuery({ data: [allRows[0]], error: null })
    supabase.from.mockReturnValueOnce(filteredQuery)

    await userEvent.type(screen.getByPlaceholderText('Apartamento'), '12')
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar' }))

    expect(filteredQuery.eq).toHaveBeenCalledWith('apartment', 12)
    expect(await screen.findByText('Marco Jiménez')).toBeInTheDocument()
    expect(screen.queryByText('Andrea Solano')).not.toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay registros que coincidan con el filtro', async () => {
    supabase.from.mockReturnValueOnce(buildQuery({ data: [], error: null }))
    render(<HistoryPanel onClose={() => {}} />)

    expect(await screen.findByText('No se encontraron registros con estos filtros.')).toBeInTheDocument()
  })
})
