import { useEffect, useState } from 'react'

export default function Header({ onOpenHistory, onSignOut }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">Control de Parqueo de Invitados</p>
            <p className="text-xs text-slate-400">Torre Villa Grande - La Sabana</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-slate-100" onClick={onOpenHistory}>
            Historial
          </button>
          <button className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:text-slate-100" onClick={onSignOut} title="Cerrar sesión">
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}