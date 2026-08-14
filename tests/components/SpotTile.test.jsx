import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SpotTile from '../../src/components/SpotTile'

describe('SpotTile', () => {
  it('C4: un espacio ocupado muestra la placa del visitante, no "Libre"', () => {
    const spot = { id: '1', code: 'P1-05', activeVisit: { plate: 'ABC123', visitor_name: 'Karla Rojas' } }
    render(<SpotTile spot={spot} onClick={() => {}} />)

    expect(screen.getByText(/ABC123/)).toBeInTheDocument()
  })

  it('un espacio libre muestra la etiqueta "Libre", no una placa', () => {
    const spot = { id: '2', code: 'P1-06', activeVisit: null }
    render(<SpotTile spot={spot} onClick={() => {}} />)

    expect(screen.getByText('Libre')).toBeInTheDocument()
  })

  it('siempre muestra el código del espacio', () => {
    const spot = { id: '3', code: 'P2-09', activeVisit: null }
    render(<SpotTile spot={spot} onClick={() => {}} />)

    expect(screen.getByText('P2-09')).toBeInTheDocument()
  })
})
