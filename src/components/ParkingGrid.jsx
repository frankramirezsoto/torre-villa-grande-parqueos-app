import SpotTile from './SpotTile'

export default function ParkingGrid({ spots, loading, error, onTileClick }) {
  if (loading) {
    return <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-slate-900/70 p-8 text-center text-sm text-slate-400">Cargando espacios…</div>
  }
  if (error) {
    return <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-rose-900/70 p-8 text-center text-sm text-rose-300">Error cargando espacios: {error.message || String(error)}</div>
  }

  if (spots.length === 0) {
    return <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-slate-900/70 p-8 text-center text-sm text-slate-400">No hay espacios configurados para este piso.</div>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {spots.map((spot) => (
        <SpotTile key={spot.id} spot={spot} onClick={onTileClick} />
      ))}
    </div>
  )
}
