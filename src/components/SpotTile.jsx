import { obtenerEstado } from '../utils/spots'

export default function SpotTile({ spot, onClick }) {
  const occupied = obtenerEstado(spot) === 'ocupado'

  return (
    <button
      className={`flex h-28 flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition ${occupied ? 'border-rose-500/30 bg-rose-500/10 hover:border-rose-400/40' : 'border-emerald-500/20 bg-slate-900/70 hover:border-slate-500 hover:bg-slate-800/70'}`}
      onClick={() => onClick(spot)}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">{spot.code}</span>
      <span className={`mt-2 h-2.5 w-2.5 rounded-full ${occupied ? 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.55)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.45)]'}`} aria-hidden="true" />
      {occupied ? (<>
        <span className="mt-2 font-mono text-sm font-semibold text-slate-100">Placa: {spot.activeVisit.plate}</span>
        <span className="mt-2 font-mono text-sm font-semibold text-slate-100">Apartamento: {spot.activeVisit.apartment}</span>
        </>
      ) : (
        <span className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-500">Libre</span>
      )}
    </button>
  )
}
