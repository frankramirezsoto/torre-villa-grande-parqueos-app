import { useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useSpots } from './hooks/useSpots'
import { contarDisponibles } from './utils/spots'
import Login from './components/Login'
import Header from './components/Header'
import FloorSelector from './components/FloorSelector'
import ParkingGrid from './components/ParkingGrid'
import EntryModal from './components/EntryModal'
import DetailModal from './components/DetailModal'
import HistoryPanel from './components/HistoryPanel'

const FLOORS = [1, 2, 3]

export default function App() {
  const { session, loading: authLoading, signOut } = useAuth()
  const [floor, setFloor] = useState(1)
  const [activeSpot, setActiveSpot] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { spots, loading, error, refetch } = useSpots(floor, session)

  const counts = useMemo(() => {
    return { [floor]: { available: contarDisponibles(spots) } }
  }, [spots, floor])

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">Cargando…</div>
  }

  if (!session) {
    return <Login />
  }

  function handleTileClick(spot) {
    setActiveSpot(spot)
  }

  function closeModal() {
    setActiveSpot(null)
  }

  function handleSaved() {
    setActiveSpot(null)
    refetch()
  }

  return (
    <div className="min-h-screen text-slate-100">
      <Header onOpenHistory={() => setHistoryOpen(true)} onSignOut={signOut} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[1fr_130px] lg:px-8 lg:py-8">
        <ParkingGrid spots={spots} loading={loading} error={error} onTileClick={handleTileClick} />
        <FloorSelector floors={FLOORS} selected={floor} onSelect={setFloor} counts={counts} />
      </main>

      {activeSpot && !activeSpot.activeVisit && (
        <EntryModal spot={activeSpot} onClose={closeModal} onSaved={handleSaved} />
      )}

      {activeSpot && activeSpot.activeVisit && (
        <DetailModal spot={activeSpot} onClose={closeModal} onSaved={handleSaved} />
      )}

      {historyOpen && <HistoryPanel onClose={() => setHistoryOpen(false)} />}
    </div>
  )
}
