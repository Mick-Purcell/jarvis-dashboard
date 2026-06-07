import { useState, useEffect } from 'react'

function randomWalk(prev, min, max, step = 3) {
  const delta = (Math.random() - 0.5) * step
  return Math.max(min, Math.min(max, prev + delta))
}

export function useSimulatedData() {
  const [data, setData] = useState({ cpu: 35, ram: 58, swap: 42 })

  useEffect(() => {
    const t = setInterval(() => {
      setData(prev => ({
        cpu: randomWalk(prev.cpu, 10, 90),
        ram: randomWalk(prev.ram, 30, 85),
        swap: randomWalk(prev.swap, 10, 70),
      }))
    }, 2500)
    return () => clearInterval(t)
  }, [])

  return data
}
