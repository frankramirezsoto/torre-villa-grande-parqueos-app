import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatearHora } from '../utils/format'

export default function DetailModal({ spot, onClose, onSaved }) {
  const visit = spot.activeVisit
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const entryTime = formatearHora(visit.entry_time)

  async function handleExit() {
    setSubmitting(true)
    setError('')
    const { error: updateError } = await supabase
      .from('visits')
      .update({ exit_time: new Date().toISOString() })
      .eq('id', visit.id)
    setSubmitting(false)

    if (updateError) {
      setError('No se pudo registrar la salida. Intenta de nuevo.')
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/70" onClick={(e) => e.stopPropagation()}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">Espacio ocupado · {spot.code}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-100">{visit.visitor_name}</h2>

        <dl className="mt-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
            <dt className="text-slate-400">Placa</dt>
            <dd className="font-mono font-semibold text-slate-100">{visit.plate}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
            <dt className="text-slate-400">Apartamento</dt>
            <dd className="text-slate-100">{visit.apartment}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
            <dt className="text-slate-400">Hora de entrada</dt>
            <dd className="font-mono text-slate-100">{entryTime}</dd>
          </div>
        </dl>

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:text-slate-100" onClick={onClose}>Cerrar</button>
          <button type="button" className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400 disabled:opacity-60" onClick={handleExit} disabled={submitting}>
            {submitting ? 'Registrando…' : 'Registrar salida'}
          </button>
        </div>
      </div>
    </div>
  )
}
