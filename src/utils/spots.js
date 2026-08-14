// Lógica de espacios extraída de App.jsx y SpotTile.jsx (HU-01, HU-03, HU-04).

/** Cuenta cuántos espacios de una lista están libres (sin visita activa). */
export function contarDisponibles(spots) {
  return spots.filter((spot) => !spot.activeVisit).length
}

/** Determina el estado de un espacio a partir de su visita activa. */
export function obtenerEstado(spot) {
  return spot.activeVisit ? 'ocupado' : 'libre'
}
