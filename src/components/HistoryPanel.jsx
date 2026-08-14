import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatearHora } from '../utils/format'
import { filtrarPorPlaca } from '../utils/history'

export default function HistoryPanel({ onClose }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [plateFilter, setPlateFilter] = useState('')
  const [apartmentFilter, setApartmentFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  async function fetchHistory() {
    setLoading(true)
    let query = supabase
      .from('visits')
      .select('id, plate, visitor_name, apartment, entry_time, exit_time, spots(code)')
      .order('entry_time', { ascending: false })
      .limit(200)

    if (plateFilter.trim()) {
      query = query.ilike('plate', `%${plateFilter.trim()}%`)
    }
    if (apartmentFilter.trim()) {
      query = query.eq('apartment', Number(apartmentFilter.trim()))
    }
    if (dateFrom) {
      query = query.gte('entry_time', new Date(dateFrom).toISOString())
    }
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      query = query.lte('entry_time', end.toISOString())
    }

    const { data, error } = await query
    if (!error) {
      let rowsData = data || []
      if (plateFilter.trim()) rowsData = filtrarPorPlaca(rowsData, plateFilter)
      setRows(rowsData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFilterSubmit(e) {
    e.preventDefault()
    fetchHistory()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/70" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">Bitácora</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-100">Historial de registros</h2>
          </div>
          <button type="button" className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:text-slate-100" onClick={onClose}>Cerrar</button>
        </div>

        <form className="mb-4 grid gap-2 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" onSubmit={handleFilterSubmit}>
          <input
            placeholder="Placa"
            value={plateFilter}
            onChange={(e) => setPlateFilter(e.target.value)}
          />
          <input
            placeholder="Apartamento"
            type="number"
            value={apartmentFilter}
            onChange={(e) => setApartmentFilter(e.target.value)}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <button type="submit" className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">Filtrar</button>
        </form>

        <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-800">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">Cargando historial…</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No se encontraron registros con estos filtros.</div>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-800/80 text-left text-[11px] uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Espacio</th>
                  <th className="px-3 py-2">Placa</th>
                  <th className="px-3 py-2">Visitante</th>
                  <th className="px-3 py-2">Apto.</th>
                  <th className="px-3 py-2">Entrada</th>
                  <th className="px-3 py-2">Salida</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-800/80 text-slate-300">
                    <td className="px-3 py-2 font-mono text-slate-100">{row.spots?.code}</td>
                    <td className="px-3 py-2 font-mono text-slate-100">{row.plate}</td>
                    <td className="px-3 py-2">{row.visitor_name}</td>
                    <td className="px-3 py-2">{row.apartment}</td>
                    <td className="px-3 py-2 font-mono text-slate-100">{formatearHora(row.entry_time)}</td>
                    <td className="px-3 py-2 font-mono text-slate-100">{row.exit_time ? formatearHora(row.exit_time) : '— activo —'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
