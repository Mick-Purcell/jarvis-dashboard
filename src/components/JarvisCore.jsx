import { useRef, useEffect, useCallback } from 'react'

export default function JarvisCore({ isListening, glitchKey }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const pulseRef = useRef(0)
  const ringRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const hoverRef = useRef(false)

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }, [])

  const handleMouseEnter = useCallback(() => { hoverRef.current = true }, [])
  const handleMouseLeave = useCallback(() => { hoverRef.current = false }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      pulseRef.current += 0.025
      ringRef.current += 0.015
      const pulse = pulseRef.current
      const ring = ringRef.current

      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const cx = w / 2
      const cy = h / 2 + 10

      ctx.clearRect(0, 0, w, h)

      const mx = hoverRef.current ? (mouseRef.current.x - 0.5) * 20 : 0
      const my = hoverRef.current ? (mouseRef.current.y - 0.5) * 20 : 0

      for (let i = 3; i >= 1; i--) {
        const r = 90 + i * 25 + Math.sin(pulse + i * 0.5) * 5
        const alpha = 0.06 + Math.sin(pulse + i) * 0.03
        ctx.beginPath()
        ctx.arc(cx + mx * 0.3 * i, cy + my * 0.3 * i, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      const tickR = 155
      ctx.save()
      ctx.translate(cx + mx * 0.2, cy + my * 0.2)
      ctx.rotate(ring * 0.3)
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2
        const len = i % 6 === 0 ? 12 : 5
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * tickR, Math.sin(a) * tickR)
        ctx.lineTo(Math.cos(a) * (tickR - len), Math.sin(a) * (tickR - len))
        ctx.strokeStyle = i % 6 === 0 ? `rgba(0,240,255,${0.25 + Math.sin(pulse)*0.1})` : `rgba(0,240,255,${0.08})`
        ctx.lineWidth = i % 6 === 0 ? 1.5 : 0.5
        ctx.stroke()
      }
      ctx.restore()

      ctx.save()
      ctx.translate(cx + mx * 0.15, cy + my * 0.15)
      ctx.rotate(-ring * 0.15)
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * 175, Math.sin(a) * 175)
        ctx.lineTo(Math.cos(a) * 170, Math.sin(a) * 170)
        ctx.strokeStyle = `rgba(0,240,255,${0.1 + Math.sin(pulse + i)*0.05})`
        ctx.stroke()
      }
      ctx.restore()

      const bracketY = cy - 70
      const bracketW = 60
      const bracketH = 25
      ctx.beginPath()
      ctx.moveTo(cx - bracketW, bracketY + bracketH)
      ctx.lineTo(cx - bracketW * 0.3, bracketY)
      ctx.lineTo(cx + bracketW * 0.3, bracketY)
      ctx.lineTo(cx + bracketW, bracketY + bracketH)
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + Math.sin(pulse * 2) * 0.15})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(cx - 30, bracketY - 8)
      ctx.lineTo(cx + 30, bracketY - 8)
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 + Math.sin(pulse * 1.5) * 0.1})`
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 18px Orbitron, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = '#00f0ff'
      ctx.shadowBlur = 15 + Math.sin(pulse * 2) * 5
      ctx.fillText('JARVIS', cx + mx * 0.1, cy - 40 + my * 0.1)
      ctx.shadowBlur = 0

      ctx.beginPath()
      ctx.moveTo(cx, bracketY - 30)
      ctx.lineTo(cx, cy - 55)
      ctx.moveTo(cx, cy + 90)
      ctx.lineTo(cx, cy + 160)
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 + Math.sin(pulse) * 0.04})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      const coreGlow = isListening ? 30 + Math.sin(pulse * 3) * 10 : 20 + Math.sin(pulse * 1.5) * 8
      const coreColor = isListening ? '#ff8c00' : '#00f0ff'

      ctx.beginPath()
      ctx.arc(cx + mx * 0.05, cy + my * 0.05, 35, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.5 + Math.sin(pulse) * 0.15})`
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx + mx * 0.05, cy + my * 0.05, 25, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 + Math.sin(pulse * 1.2) * 0.1})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx + mx * 0.05, cy + my * 0.05, 15, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + Math.sin(pulse * 1.8) * 0.15})`
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx + mx * 0.05, cy + my * 0.05, 8, 0, Math.PI * 2)
      ctx.fillStyle = coreColor
      ctx.shadowColor = coreColor
      ctx.shadowBlur = coreGlow
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.beginPath()
      ctx.arc(cx + mx * 0.05 - 2, cy + my * 0.05 - 2, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()

      const bracketOffset = 50
      for (const side of [-1, 1]) {
        const bx = cx + side * bracketOffset + mx * 0.1
        ctx.beginPath()
        ctx.moveTo(bx, cy - 20)
        ctx.lineTo(bx + side * 15, cy - 10)
        ctx.lineTo(bx + side * 15, cy + 10)
        ctx.lineTo(bx, cy + 20)
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 + Math.sin(pulse + side) * 0.05})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      if (isListening) {
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + pulse
          const dist = 40 + Math.sin(pulse * 2 + i) * 15
          const px = cx + Math.cos(angle) * dist
          const py = cy + Math.sin(angle) * dist
          ctx.beginPath()
          ctx.arc(px, py, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 140, 0, ${0.4 + Math.sin(pulse * 3 + i) * 0.3})`
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isListening, glitchKey])

  return (
    <div className="relative w-full h-full flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <canvas
        ref={canvasRef}
        className="w-[360px] h-[420px]"
        style={{ cursor: 'crosshair' }}
      />
    </div>
  )
}
