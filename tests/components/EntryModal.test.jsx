import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EntryModal from '../../src/components/EntryModal'
import { supabase } from '../../src/supabaseClient'

vi.mock('../../src/supabaseClient', () => ({
  supabase: { from: vi.fn() }
}))

const spot = { id: 'spot-1', code: 'P1-05' }

describe('EntryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('C7: envía nombre, placa normalizada y apartamento al confirmar un formulario válido', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    supabase.from.mockReturnValue({ insert })
    const onSaved = vi.fn()

    render(<EntryModal spot={spot} onClose={() => {}} onSaved={onSaved} />)
    await userEvent.type(screen.getByLabelText('Nombre del visitante'), 'Karla Rojas')
    await userEvent.type(screen.getByLabelText('Placa'), ' abc123 ')
    await userEvent.type(screen.getByLabelText('Apartamento'), '12')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar entrada' }))

    expect(supabase.from).toHaveBeenCalledWith('visits')
    expect(insert).toHaveBeenCalledWith({
      spot_id: 'spot-1',
      apartment: 12,
      plate: 'ABC123', // normalizada: sin espacios, en mayúsculas
      visitor_name: 'Karla Rojas'
    })
    expect(onSaved).toHaveBeenCalled()
  })

  it('C8: muestra un mensaje específico cuando el apartamento ya tiene un espacio ocupado', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value violates unique constraint "one_active_visit_per_apartment"' }
    })
    supabase.from.mockReturnValue({ insert })

    render(<EntryModal spot={spot} onClose={() => {}} onSaved={() => {}} />)
    await userEvent.type(screen.getByLabelText('Nombre del visitante'), 'Karla Rojas')
    await userEvent.type(screen.getByLabelText('Placa'), 'ABC123')
    await userEvent.type(screen.getByLabelText('Apartamento'), '12')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar entrada' }))

    expect(await screen.findByText('El apartamento 12 ya tiene un espacio de visita ocupado.')).toBeInTheDocument()
  })

  it('no llama a Supabase cuando el formulario tiene campos faltantes', async () => {
    render(<EntryModal spot={spot} onClose={() => {}} onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Registrar entrada' }))

    expect(screen.getByText('Falta el nombre del visitante.')).toBeInTheDocument()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
