import { useState, useEffect, useRef } from 'react'

// ========== PROFILE PANEL ==========
export function ProfilePanel({ data }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2
    const r = Math.min(w, h) / 2 - 10

    let frame
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const pct = data.ram / 100
      const start = -Math.PI * 0.75
      const end = start + pct * Math.PI * 1.5
      const color = pct > 0.8 ? '#ff8c00' : '#00f0ff'

      ctx.beginPath()
      ctx.arc(cx, cy, r, start, Math.PI * 0.75)
      ctx.strokeStyle = 'rgba(0,240,255,0.08)'
      ctx.lineWidth = 8
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, r, start, end)
      ctx.strokeStyle = color
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.shadowColor = color
      ctx.shadowBlur = 14
      ctx.stroke()
      ctx.shadowBlur = 0

      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [data.ram])

  return (
    <div className="hud-panel">
      <div className="font-orbitron text-[0.85rem] tracking-[0.12em] text-white">MICK_PUR</div>
      <div className="text-[0.65rem] text-hud-dim mt-0.5 tracking-[0.08em]">build 2.0.0</div>
      <div className="text-[0.65rem] text-hud-dim tracking-[0.08em]">Created by J.A.R.V.I.S.</div>
      <div className="mt-3">
        <div className="hud-label">RAM Usage</div>
        <div className="relative w-[130px] h-[130px] mx-auto">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-orbitron text-[1.3rem] text-white pointer-events-none">
            {Math.round(data.ram)}%
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 mt-2">
        <button className="flex-1 bg-white/[0.04] border border-cyan/15 text-hud-dim text-[0.55rem] uppercase tracking-[0.1em] py-1 rounded hover:border-cyan hover:text-cyan transition-all cursor-pointer"
          onClick={() => alert('Shutdown sequence initiated')}>
          Shutdown
        </button>
        <button className="flex-1 bg-white/[0.04] border border-cyan/15 text-hud-dim text-[0.55rem] uppercase tracking-[0.1em] py-1 rounded hover:border-cyan hover:text-cyan transition-all cursor-pointer"
          onClick={() => window.location.reload()}>
          Restart
        </button>
        <button className="flex-1 bg-white/[0.04] border border-cyan/15 text-hud-dim text-[0.55rem] uppercase tracking-[0.1em] py-1 rounded hover:border-cyan hover:text-cyan transition-all cursor-pointer">
          Log Off
        </button>
      </div>
    </div>
  )
}

// ========== NETWORK PANEL ==========
export function NetworkPanel() {
  const [ip, setIp] = useState('--')
  const [down, setDown] = useState('--')

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setIp(d.ip))
      .catch(() => setIp('46.202.179.113'))

    const conn = navigator.connection
    if (conn) {
      const update = () => setDown(conn.downlink ? conn.downlink + ' Mbps' : '--')
      update()
      conn.addEventListener('change', update)
      return () => conn.removeEventListener('change', update)
    }
  }, [])

  return (
    <div className="hud-panel">
      <div className="hud-label">Network</div>
      <div className="text-[0.7rem] text-white mb-1">IP: <span className="neon">{ip}</span></div>
      <div className="text-[0.7rem] text-hud-dim">Up: <span className="neon">0 B/s</span></div>
      <div className="text-[0.7rem] text-hud-dim">Down: <span className="neon">{down}</span></div>
    </div>
  )
}

// ========== CALENDAR PANEL ==========
export function CalendarPanel() {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return (
    <div className="hud-panel">
      <div className="hud-label">Calendar</div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[0.6rem]">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-hud-dim text-[0.5rem] mb-1">{d}</div>
        ))}
        {days.map((d, i) => (
          <div key={i} className={`py-0.5 ${d === now.getDate() ? 'text-cyan font-bold neon' : 'text-hud-dim'}`}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

// ========== APP LAUNCHER PANEL ==========
const APPS = [
  { icon: 'C', name: 'Chrome', url: 'https://google.com' },
  { icon: 'S', name: 'Settings', url: '#' },
  { icon: 'S', name: 'Steam', url: 'https://store.steampowered.com' },
  { icon: 'W', name: 'WhatsApp', url: 'https://web.whatsapp.com' },
  { icon: '$', name: 'Terminal', url: '#' },
  { icon: 'D', name: 'Discord', url: 'https://discord.com' },
]

export function AppLauncherPanel() {
  return (
    <div className="hud-panel flex-1 overflow-auto">
      <div className="hud-label">J.A.R.V.I.S. Theme Control</div>
      <div className="flex flex-col gap-1.5">
        {APPS.map(app => (
          <div key={app.name}
            className="flex items-center gap-2.5 py-1.5 px-2 bg-white/[0.02] border-l-2 border-amber cursor-pointer hover:bg-cyan/5 hover:border-cyan transition-all"
            onClick={() => app.url !== '#' && window.open(app.url, '_blank')}>
            <div className="w-[22px] h-[22px] flex items-center justify-center font-orbitron text-[0.7rem] text-white bg-amber/15 rounded hover:bg-cyan/20 transition-colors">
              {app.icon}
            </div>
            <span className="text-[0.75rem] tracking-wide">{app.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-cyan/10">
        <div className="text-[0.6rem] text-hud-dim mb-1">System Stats</div>
        <div className="text-[0.65rem] text-white">Uptime: <span className="amber">0h 0m</span></div>
        <div className="text-[0.65rem] text-white">CPU: <span className="amber">--</span></div>
        <div className="text-[0.65rem] text-white">RAM: <span className="amber">--</span></div>
      </div>
    </div>
  )
}

// ========== SYSTEM MONITOR PANEL ==========
export function SystemMonitorPanel({ data }) {
  const [tab, setTab] = useState('sys')
  const tabs = ['sys', 'data', 'apps', 'media']

  return (
    <div className="hud-panel">
      <div className="flex gap-2 mb-2">
        {tabs.map(t => (
          <div key={t}
            className={`text-[0.55rem] uppercase tracking-[0.12em] cursor-pointer pb-0.5 border-b transition-all ${tab === t ? 'text-cyan border-cyan' : 'text-hud-dim border-transparent hover:text-cyan'}`}
            onClick={() => setTab(t)}>
            {t}
          </div>
        ))}
      </div>
      {tab === 'sys' && (
        <>
          <Metric label="CPU Usage" value={`${Math.round(data.cpu)}%`} />
          <Metric label="RAM Usage" value={`${Math.round(data.ram)}%`} />
          <Metric label="SWAP Usage" value={`${Math.round(data.swap)}%`} />
          <div className="text-[0.6rem] text-hud-dim mt-2 mb-1">DISK</div>
          <Metric label="C:\\" value="47.4 / 97.0 GB" />
          <Metric label="D:\\" value="0.0 / 0.0 B" />
        </>
      )}
      {tab === 'data' && <div className="text-[0.7rem] text-hud-dim">Data streams active...</div>}
      {tab === 'apps' && <div className="text-[0.7rem] text-hud-dim">No active applications</div>}
      {tab === 'media' && <div className="text-[0.7rem] text-hud-dim">Media idle</div>}
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="flex justify-between mb-1 text-[0.7rem]">
      <span className="text-hud-dim">{label}</span>
      <span className="font-orbitron text-white">{value}</span>
    </div>
  )
}

// ========== WEATHER PANEL ==========
export function WeatherPanel() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then(r => r.json())
        .then(d => setWeather(d))
        .catch(() => {})
    }, () => {}, { timeout: 5000 })
  }, [])

  const cur = weather?.current
  const daily = weather?.daily

  return (
    <div className="hud-panel">
      <div className="hud-label">Weather</div>
      <div className="text-[0.7rem] text-white mb-1.5">
        {cur ? `${cur.temperature_2m}°C` : '--'}
      </div>
      <div className="flex gap-3 text-[0.6rem] text-hud-dim">
        <div>Humidity: <span className="neon">{cur ? cur.relative_humidity_2m + '%' : '--'}</span></div>
        <div>Wind: <span className="neon">{cur ? cur.wind_speed_10m + ' km/h' : '--'}</span></div>
      </div>
      <div className="mt-2 text-[0.6rem] text-hud-dim">
        <div>Today: <span className="neon">{daily ? `${daily.temperature_2m_max[0]}°/${daily.temperature_2m_min[0]}°` : '--'}</span></div>
        <div>Tomorrow: <span className="neon">{daily ? `${daily.temperature_2m_max[1]}°/${daily.temperature_2m_min[1]}°` : '--'}</span></div>
      </div>
    </div>
  )
}

// ========== DATE / POWER PANEL ==========
export function DatePowerPanel() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  return (
    <div className="hud-panel flex-1 flex flex-col justify-center">
      <div className="text-center">
        <div className="font-orbitron text-[2.8rem] text-white" style={{ textShadow: '0 0 15px rgba(0,240,255,0.3)' }}>
          {now.getDate()}
        </div>
        <div className="text-[0.9rem] text-amber uppercase tracking-[0.2em]">
          {now.toLocaleDateString([], { month: 'long' })}
        </div>
        <div className="text-[0.7rem] text-white uppercase tracking-[0.15em] mt-0.5">
          {now.toLocaleDateString([], { weekday: 'long' })}
        </div>
      </div>
      <div className="mt-auto">
        <div className="hud-label text-center mb-1.5">Power Level</div>
        <div className="h-1 bg-white/5 rounded overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-cyan to-amber" style={{ boxShadow: '0 0 6px rgba(0,240,255,0.4)' }} />
        </div>
        <div className="text-center text-[0.6rem] text-hud-dim mt-1">100% — Holding steady</div>
      </div>
    </div>
  )
}

// ========== MEDIA PLAYER PANEL ==========
export function MediaPlayerPanel() {
  return (
    <div className="hud-panel">
      <div className="hud-label">Media Player</div>
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-[#ff00cc] to-[#3333ff] flex items-center justify-center text-[0.5rem] text-white font-orbitron">
          ♪
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.75rem] text-white truncate">Lost in the Crowd</div>
          <div className="text-[0.6rem] text-hud-dim">BassNectar</div>
          <div className="flex gap-2 mt-1.5">
            <button className="w-[22px] h-[22px] flex items-center justify-center text-[0.6rem] text-cyan border border-cyan/20 rounded hover:border-cyan hover:bg-cyan/5 transition-all cursor-pointer">◄◄</button>
            <button className="w-[22px] h-[22px] flex items-center justify-center text-[0.6rem] text-cyan border border-cyan/20 rounded hover:border-cyan hover:bg-cyan/5 transition-all cursor-pointer">▶</button>
            <button className="w-[22px] h-[22px] flex items-center justify-center text-[0.6rem] text-cyan border border-cyan/20 rounded hover:border-cyan hover:bg-cyan/5 transition-all cursor-pointer">►►</button>
          </div>
        </div>
        <div className="text-[0.6rem] text-hud-dim">4:04</div>
      </div>
    </div>
  )
}

// ========== FOOTER PANEL ==========
export function FooterPanel() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const daysLeft = Math.ceil((endOfYear - now) / 86400000)

  return (
    <div className="hud-panel col-span-3 flex items-center justify-between px-6">
      <div>
        <div className="font-orbitron text-[3.2rem] text-white leading-none" style={{ textShadow: '0 0 15px rgba(0,240,255,0.3)' }}>
          {timeStr} {ampm}
        </div>
        <div className="text-[0.75rem] text-hud-dim tracking-[0.1em] mt-1">
          {now.toLocaleDateString([], { day: 'numeric', month: 'short', weekday: 'long' })}
        </div>
        <div className="text-[0.65rem] text-cyan tracking-[0.08em] mt-1.5 opacity-80">
          Currently power level is at 100 percent and holding steady.
        </div>
        <div className="flex gap-4 mt-2">
          <YrItem val={daysLeft} label="Days Left" />
          <YrItem val={Math.ceil(daysLeft / 7)} label="Weeks" />
          <YrItem val={12 - now.getMonth() - 1} label="Months" />
          <YrItem val={now.getFullYear()} label="Year" />
        </div>
      </div>
      <div className="text-right">
        <div className="font-orbitron text-[1.4rem] text-white">{timeStr}</div>
        <div className="text-[0.6rem] text-hud-dim mt-1">SYSTEM ONLINE</div>
      </div>
    </div>
  )
}

function YrItem({ val, label }) {
  return (
    <div className="text-center">
      <div className="font-orbitron text-[0.85rem] text-amber">{val}</div>
      <div className="text-[0.5rem] text-hud-dim uppercase tracking-[0.1em]">{label}</div>
    </div>
  )
}
