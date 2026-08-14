// Lógica de coincidencia de placa (HU-10). HistoryPanel filtra del lado del
// servidor con `ilike` en Supabase por eficiencia, pero esta función documenta
// y prueba la misma semántica de forma aislada: coincidencia parcial, sin
// distinguir mayúsculas/minúsculas. Queda disponible por si se necesita un
// filtro rápido del lado del cliente sobre datos ya cargados.
export function filtrarPorPlaca(historial, query) {
  const term = (query || '').trim().toLowerCase()
  if (!term) return historial
  return historial.filter((row) => (row.plate || '').toLowerCase().includes(term))
}
