// Formato de fecha/hora extraído de DetailModal y HistoryPanel (HU-07).
//
// NOTA (defecto encontrado en pruebas unitarias, ver DEF-001 en el informe):
// Intl.DateTimeFormat con { month: '2-digit' } no garantiza el padding del
// mes de forma consistente entre motores/versiones (confirmado en Node 22 /
// ICU 78: "julio" se mostraba como "7" en vez de "07"). Se construye el
// formato manualmente en 24 horas para que sea 100% predecible y comprobable,
// sin depender del comportamiento de Intl del entorno donde corra la app.
function pad(n) {
  return String(n).padStart(2, '0')
}

/** Formatea una fecha ISO como dd/mm/yy, hh:mm en formato de 24 horas. */
export function formatearHora(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1) // getMonth() devuelve 0-11
  const year = date.getFullYear().toString().slice(-2)
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}
