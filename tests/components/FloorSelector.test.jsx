import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FloorSelector from '../../src/components/FloorSelector'

describe('FloorSelector', () => {
  it('C6: al hacer clic en un piso, llama a onSelect con ese número de piso', async () => {
    const onSelect = vi.fn()
    render(<FloorSelector floors={[1, 2, 3]} selected={1} onSelect={onSelect} counts={{}} />)

    await userEvent.click(screen.getByText('2').closest('button'))

    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('marca como activo únicamente el botón del piso seleccionado', () => {
    render(<FloorSelector floors={[1, 2, 3]} selected={2} onSelect={() => {}} counts={{}} />)

    expect(screen.getByText('2').closest('button')).toHaveClass('border-sky-400')
    expect(screen.getByText('1').closest('button')).not.toHaveClass('border-sky-400')
    expect(screen.getByText('3').closest('button')).not.toHaveClass('border-sky-400')
  })

  it('muestra el conteo de espacios disponibles cuando se provee', () => {
    render(<FloorSelector floors={[1]} selected={1} onSelect={() => {}} counts={{ 1: { available: 7 } }} />)
    expect(screen.getByText('7 libres')).toBeInTheDocument()
  })
})
