import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// HU-02, HU-03: trae los espacios del piso seleccionado junto con la
// visita activa (si el espacio está ocupado), y se mantiene sincronizado
// en tiempo real cuando hay una entrada o salida (HU-04, HU-07).
export function useSpots(floor, session) {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSpots = useCallback(async () => {
    if (!session) {
      setSpots([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('spots')
      .select('id, floor, spot_number, code, visits!left(id, plate, visitor_name, apartment, entry_time)')
      .eq('floor', floor)
      .is('visits.exit_time', null)
      .order('spot_number', { ascending: true })

    console.debug('[useSpots] fetchSpots result', { floor, count: (data || []).length, error })
    if (error) {
      console.error('[useSpots] fetchSpots error', error)
      setError(error)
      setSpots([])
    } else {
      const normalized = (data || []).map((spot) => ({
        ...spot,
        activeVisit: spot.visits && spot.visits.length > 0 ? spot.visits[0] : null
      }))
      setSpots(normalized)
      setError(null)
    }
    setLoading(false)
  }, [floor, session])

  useEffect(() => {
    fetchSpots()

    const channel = supabase
      .channel('visits-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, () => {
        fetchSpots()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSpots])

  return { spots, loading, error, refetch: fetchSpots }
}
