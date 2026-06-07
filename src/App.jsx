import { useState, useEffect, useCallback, useRef } from 'react'
import JarvisCore from './components/JarvisCore'
import ParticleField from './components/ParticleField'
import StartOverlay from './components/StartOverlay'
import VoiceIndicator from './components/VoiceIndicator'
import ChatPanel from './components/ChatPanel'
import {
  ProfilePanel, NetworkPanel, CalendarPanel, AppLauncherPanel,
  SystemMonitorPanel, WeatherPanel, DatePowerPanel, MediaPlayerPanel,
  FooterPanel
} from './components/Widgets'
import { useSimulatedData } from './hooks/useData'
import { useChat } from './hooks/useChat'

const WAKE_WORDS = ['jarvis', 'hey computer', 'system', 'hey jarvis']

function speak(text, voices) {
  if (!window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1.08
  u.pitch = 0.92
  const v = voices.find(vo => vo.name.includes('Google UK English Male'))
    || voices.find(vo => vo.name.includes('Daniel'))
    || voices.find(vo => vo.name.includes('Fred'))
    || voices.find(vo => vo.name.includes('Male'))
    || voices[0]
  if (v) u.voice = v
  speechSynthesis.speak(u)
}

export default function App() {
  const [active, setActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voices, setVoices] = useState([])
  const [particles, setParticles] = useState([])
  const [glitchKey, setGlitchKey] = useState(0)
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const recognitionRef = useRef(null)
  const data = useSimulatedData()
  const chat = useChat()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const load = () => setVoices(speechSynthesis.getVoices())
    load()
    speechSynthesis.onvoiceschanged = load
  }, [])

  useEffect(() => {
    const lastMsg = chat.messages[chat.messages.length - 1]
    if (lastMsg?.role === 'assistant' && lastMsg.content && !chat.isTyping) {
      speak(lastMsg.content, voices)
      setGlitchKey(k => k + 1)
    }
  }, [chat.messages, chat.isTyping, voices])

  const spawnParticles = useCallback((count = 20) => {
    const newParts = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 50 + (Math.random() - 0.5) * 40,
      size: 2 + Math.random() * 4,
      color: Math.random() > 0.5 ? '#00f0ff' : '#ff8c00',
      delay: Math.random() * 0.5,
    }))
    setParticles(prev => [...prev.slice(-50), ...newParts])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParts.find(np => np.id === p.id)))
    }, 2000)
  }, [])

  const handleLocalCommand = useCallback((text) => {
    const t = text.toLowerCase()
    if (/time|clock|hour/.test(t)) {
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return `The current time is ${ts}.`
    }
    if (/date|day|today/.test(t)) {
      return new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    }
    if (/status|report|systems/.test(t)) {
      return `All systems nominal. CPU at ${Math.round(data.cpu)}%, RAM at ${Math.round(data.ram)}%.`
    }
    if (/shutdown|power\s+off|sleep/.test(t)) {
      if (recognitionRef.current) recognitionRef.current.stop()
      return 'Entering standby mode.'
    }
    if (/restart|reboot/.test(t)) {
      setTimeout(() => location.reload(), 2000)
      return 'Restarting systems.'
    }
    if (/who\s+are\s+you/.test(t)) {
      return "I am J.A.R.V.I.S., Just A Rather Very Intelligent System."
    }
    if (/hello|hi|greetings/.test(t)) {
      return ["At your service, sir.", "Online and ready.", "Systems active.", "Good day, sir."][Math.floor(Math.random() * 4)]
    }
    if (/thank|thanks/.test(t)) {
      return ["You're welcome, sir.", "My pleasure.", "Always at your service."][Math.floor(Math.random() * 3)]
    }
    return null
  }, [data.cpu, data.ram])

  const handleVoiceResult = useCallback((text) => {
    const t = text.toLowerCase()
    const isWake = WAKE_WORDS.some(w => t.includes(w)) || t.includes('jarvis')
    spawnParticles(20)
    const local = handleLocalCommand(text)
    if (local) {
      speak(local, voices)
      chat.sendMessage(text, { voice: true })
      return
    }
    if (isWake || t.length > 5) {
      const shouldSearch = t.includes('search') || t.includes('find') || t.includes('look up') || t.includes('what is') || t.includes('who is')
      chat.sendMessage(text, { searchFirst: shouldSearch, voice: true })
    }
  }, [handleLocalCommand, spawnParticles, voices, chat])

  const initVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onstart = () => setIsListening(true)
    rec.onend = () => {
      setIsListening(false)
      setTimeout(() => rec.start(), 400)
    }
    rec.onresult = (e) => {
      const text = e.results[e.results.length - 1][0].transcript.trim()
      handleVoiceResult(text)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'audio-capture') rec.stop()
    }
    recognitionRef.current = rec
    rec.start()
    speak('J.A.R.V.I.S. online. Welcome back, sir.', voices)
  }, [handleVoiceResult, voices])

  const activate = useCallback(() => {
    setActive(true)
    initVoice()
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(() => {})
  }, [initVoice])

  const toggleVoice = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    if (isListening) rec.stop()
    else rec.start()
  }, [isListening])

  const quickLinks = [
    { label: 'GOOGLE', url: 'https://google.com' },
    { label: 'GMAIL', url: 'https://gmail.com' },
    { label: 'YOUTUBE', url: 'https://youtube.com' },
    { label: 'GITHUB', url: 'https://github.com' },
    { label: 'CHATGPT', url: 'https://chatgpt.com' },
    { label: 'WIKIPEDIA', url: 'https://wikipedia.org' },
    { label: 'NETFLIX', url: 'https://netflix.com' },
    { label: 'SPOTIFY', url: 'https://spotify.com' },
  ]

  return (
    <>
      {!active && <StartOverlay onActivate={activate} />}

      <div className={`h-full w-full transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
        <ParticleField particles={particles} />

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur border-b border-cyan/10">
          <button onClick={() => { setLeftOpen(!leftOpen); setRightOpen(false) }}
            className="text-cyan text-xl p-1 border border-cyan/20 rounded">
            &#9776;
          </button>
          <h1 className="font-orbitron text-sm tracking-[0.2em] text-white"
            style={{ textShadow: '0 0 8px rgba(0,240,255,0.4)' }}>
            J.A.R.V.I.S.
          </h1>
          <button onClick={() => { setRightOpen(!rightOpen); setLeftOpen(false) }}
            className="text-cyan text-xl p-1 border border-cyan/20 rounded">
            &#9881;
          </button>
        </div>

        {/* Mobile left sidebar overlay */}
        {isMobile && leftOpen && (
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setLeftOpen(false)}>
            <div className="absolute left-0 top-10 bottom-0 w-[260px] bg-black/95 border-r border-cyan/20 p-3 overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <ProfilePanel data={data} />
              <div className="mt-3"><NetworkPanel /></div>
              <div className="mt-3"><CalendarPanel /></div>
              <div className="mt-3"><AppLauncherPanel /></div>
            </div>
          </div>
        )}

        {/* Mobile right sidebar overlay */}
        {isMobile && rightOpen && (
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setRightOpen(false)}>
            <div className="absolute right-0 top-10 bottom-0 w-[260px] bg-black/95 border-l border-cyan/20 p-3 overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <SystemMonitorPanel data={data} />
              <div className="mt-3"><WeatherPanel /></div>
              <div className="mt-3"><DatePowerPanel /></div>
              <div className="mt-3"><MediaPlayerPanel /></div>
            </div>
          </div>
        )}

        {/* Main layout */}
        <div className="jarvis-grid relative z-10 h-full w-full"
          style={{ opacity: active ? 1 : 0, transition: 'opacity 1s' }}>

          {/* Desktop LEFT COLUMN */}
          <div className="hidden lg:flex left-col flex-col gap-3.5 overflow-hidden">
            <ProfilePanel data={data} />
            <NetworkPanel />
            <CalendarPanel />
            <AppLauncherPanel />
          </div>

          {/* HEADER - desktop */}
          <div className="hidden lg:flex header-col hud-panel items-center justify-center">
            <div className="text-center">
              <h1 className="font-orbitron text-2xl tracking-[0.3em] text-white"
                style={{ textShadow: '0 0 10px rgba(0,240,255,0.4)' }}>
                J.A.R.V.I.S.
              </h1>
              <p className="text-[0.7rem] text-hud-dim tracking-[0.15em] mt-1">
                What Can I Search For You, Sir?
              </p>
            </div>
          </div>

          {/* CENTER - all devices */}
          <div className="center-col hud-panel relative flex items-center justify-center overflow-hidden">
            {!chat.chatOpen && (
              <>
                <JarvisCore isListening={isListening} glitchKey={glitchKey} />
                <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-1.5">
                  {quickLinks.map(link => (
                    <div key={link.label}
                      className="text-[0.55rem] tracking-[0.15em] text-hud-dim cursor-pointer py-0.5 px-2 border-l border-transparent hover:border-cyan hover:text-cyan transition-all"
                      onClick={() => window.open(link.url, '_blank')}>
                      {link.label}
                    </div>
                  ))}
                </div>
                {/* Mobile quick links row */}
                <div className="lg:hidden absolute bottom-2 left-0 right-0 flex justify-center gap-2 flex-wrap px-2">
                  {quickLinks.slice(0, 6).map(link => (
                    <button key={link.label}
                      className="text-[0.6rem] tracking-wider text-hud-dim bg-black/40 border border-cyan/10 px-2 py-1 rounded"
                      onClick={() => window.open(link.url, '_blank')}>
                      {link.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <ChatPanel
              messages={chat.messages}
              isTyping={chat.isTyping}
              isSearching={chat.isSearching}
              chatOpen={chat.chatOpen}
              setChatOpen={chat.setChatOpen}
              onSend={chat.sendMessage}
              onClear={chat.clearChat}
              voiceListening={isListening}
              onVoiceToggle={toggleVoice}
            />
          </div>

          {/* Desktop RIGHT COLUMN */}
          <div className="hidden lg:flex right-col flex-col gap-3.5 overflow-hidden">
            <SystemMonitorPanel data={data} />
            <WeatherPanel />
            <DatePowerPanel />
            <MediaPlayerPanel />
          </div>

          {/* FOOTER - desktop */}
          <div className="hidden lg:block footer-col">
            <FooterPanel />
          </div>

          {/* Mobile footer bar */}
          <div className="lg:hidden mobile-footer">
            <div className="flex items-center justify-between px-3 py-2 bg-black/80 border-t border-cyan/10">
              <div className="font-orbitron text-lg text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-[0.6rem] text-hud-dim">SYSTEM ONLINE</div>
              <button onClick={() => chat.setChatOpen(!chat.chatOpen)}
                className="text-cyan text-xs border border-cyan/30 px-2 py-1 rounded">
                {chat.chatOpen ? 'HUD' : 'CHAT'}
              </button>
            </div>
          </div>
        </div>

        <VoiceIndicator isListening={isListening} />
      </div>
    </>
  )
}
