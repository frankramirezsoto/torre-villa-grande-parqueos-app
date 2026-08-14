import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ParkingGrid from '../../src/components/ParkingGrid'

function makeSpots(floor = 1, occupiedNumbers = []) {
  return Array.from({ length: 10 }, (_, i) => {
    const spotNumber = i + 1
    return {
      id: `p${floor}-${spotNumber}`,
      floor,
      spot_number: spotNumber,
      code: `P${floor}-${String(spotNumber).padStart(2, '0')}`,
      activeVisit: occupiedNumbers.includes(spotNumber) ? { plate: 'XYZ999' } : null
    }
  })
}

describe('ParkingGrid', () => {
  it('C3: renderiza 10 espacios "Libre" cuando ninguno está ocupado', () => {
    render(<ParkingGrid spots={makeSpots()} loading={false} onTileClick={() => {}} />)
    expect(screen.getAllByText('Libre')).toHaveLength(10)
  })

  it('C5: muestra "Cargando espacios…" cuando loading es true', () => {
    render(<ParkingGrid spots={[]} loading={true} onTileClick={() => {}} />)
    expect(screen.getByText('Cargando espacios…')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando el piso no tiene espacios configurados', () => {
    render(<ParkingGrid spots={[]} loading={false} onTileClick={() => {}} />)
    expect(screen.getByText('No hay espacios configurados para este piso.')).toBeInTheDocument()
  })
})
