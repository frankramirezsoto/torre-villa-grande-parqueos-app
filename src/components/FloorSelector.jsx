export default function FloorSelector({ floors, selected, onSelect, counts }) {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-sm shadow-slate-950/40 lg:sticky lg:top-24 lg:self-start">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Piso</p>
      <div className="flex flex-wrap justify-center gap-2 lg:flex-col lg:gap-3">
        {floors.map((floor) => {
          const available = counts?.[floor]?.available
          const active = selected === floor
          return (
            <button
              key={floor}
              className={`flex mx-auto h-16 w-16 flex-col items-center justify-center rounded-full border text-sm transition ${active ? 'border-sky-400 bg-sky-500/10 text-slate-100 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]' : 'border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
              onClick={() => onSelect(floor)}
            >
              <span className="font-mono text-lg font-semibold">{floor}</span>
              {typeof available === 'number' && (
                <span className="text-[10px] text-slate-500">{available} libres</span>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
