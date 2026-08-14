import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError('Usuario o contraseña incorrectos.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800/80 bg-slate-900/80 p-7 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <h1 className="text-xl font-semibold text-slate-100">Torre Villa Grande</h1>
        <p className="mt-1 text-sm text-slate-400">Control de acceso · Parqueo de visitas</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500" htmlFor="email">Usuario</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@torrevillagrande.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" className="mt-2 w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
