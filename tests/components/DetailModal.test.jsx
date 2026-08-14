import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DetailModal from '../../src/components/DetailModal'
import { supabase } from '../../src/supabaseClient'

vi.mock('../../src/supabaseClient', () => ({
  supabase: { from: vi.fn() }
}))

const spot = {
  id: 'spot-1',
  code: 'P1-05',
  activeVisit: {
    id: 'visit-1',
    plate: 'ABC123',
    visitor_name: 'Karla Rojas',
    apartment: 12,
    entry_time: '2026-07-30T13:10:00'
  }
}

describe('DetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('C9: al registrar la salida, actualiza exit_time del registro correcto', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn(() => ({ eq }))
    supabase.from.mockReturnValue({ update })
    const onSaved = vi.fn()

    render(<DetailModal spot={spot} onClose={() => {}} onSaved={onSaved} />)
    await userEvent.click(screen.getByRole('button', { name: 'Registrar salida' }))

    expect(supabase.from).toHaveBeenCalledWith('visits')
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ exit_time: expect.any(String) }))
    expect(eq).toHaveBeenCalledWith('id', 'visit-1')
    expect(onSaved).toHaveBeenCalled()
  })

  it('muestra los datos de la visita activa (placa, apartamento, hora)', () => {
    render(<DetailModal spot={spot} onClose={() => {}} onSaved={() => {}} />)

    expect(screen.getByText('Karla Rojas')).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })
})
