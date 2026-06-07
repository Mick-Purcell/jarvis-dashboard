import { useState, useEffect } from 'react'

function randomWalk(prev, min, max, step = 3) {
  const delta = (Math.random() - 0.5) * step
  return Math.max(min, Math.min(max, prev + delta))
}

export function useSimulatedData() {
  const [data, setData] = useState({ cpu: 30, ram: 45, swap: 20 })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        cpu: randomWalk(prev.cpu, 5, 95),
        ram: randomWalk(prev.ram, 20, 85),
        swap: randomWalk(prev.swap, 5, 70),
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return data
}
