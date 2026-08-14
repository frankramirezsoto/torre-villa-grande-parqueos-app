import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { normalizarPlaca, validarApartamento } from '../utils/validation'

export default function EntryModal({ spot, onClose, onSaved }) {
  const [visitorName, setVisitorName] = useState('')
  const [plate, setPlate] = useState('')
  const [apartment, setApartment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!visitorName || !visitorName.trim()) {
      setError('Falta el nombre del visitante.')
      return
    }
    if (!plate || !plate.trim()) {
      setError('Falta la placa del vehículo.')
      return
    }
    const apartmentCheck = validarApartamento(apartment)
    if (!apartmentCheck.valid) {
      setError(apartmentCheck.error)
      return
    }
    const apartmentValue = apartmentCheck.value

    setSubmitting(true)
    const { error: insertError } = await supabase.from('visits').insert({
      spot_id: spot.id,
      apartment: apartmentValue,
      plate: normalizarPlaca(plate),
      visitor_name: visitorName.trim()
    })
    setSubmitting(false)

    if (insertError) {
      if (insertError.code === '23505' && insertError.message.includes('apartment')) {
        setError(`El apartamento ${apartment} ya tiene un espacio de visita ocupado.`)
      } else if (insertError.code === '23505') {
        setError('Este espacio ya fue ocupado. Actualizando…')
      } else {
        setError('No se pudo registrar la entrada. Intenta de nuevo.')
      }
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/70" onClick={(e) => e.stopPropagation()}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">Registrar entrada · {spot.code}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-100">Nuevo visitante</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500" htmlFor="visitorName">Nombre del visitante</label>
            <input
              id="visitorName"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Nombre completo"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500" htmlFor="plate">Placa</label>
            <input
              id="plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="ABC123"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500" htmlFor="apartment">Apartamento</label>
            <input
              id="apartment"
              type="number"
              min="1"
              max="30"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="1 - 30"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:text-slate-100" onClick={onClose}>Cancelar</button>
            <button type="submit" className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Registrar entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
