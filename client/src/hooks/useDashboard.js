import { useEffect, useState } from 'react'
import { getDashboard } from '../services/dashboardApi'

const useDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await getDashboard()
        if (!active) return
        setData(response.data.data)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDashboard()

    return () => {
      active = false
    }
  }, [])

  return { data, loading, error }
}

export default useDashboard
