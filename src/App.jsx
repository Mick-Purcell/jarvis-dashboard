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
  const recognitionRef = useRef(null)
  const data = useSimulatedData()
  const chat = useChat()

  useEffect(() => {
    const load = () => setVoices(speechSynthesis.getVoices())
    load()
    speechSynthesis.onvoiceschanged = load
  }, [])

  // Speak AI responses when they complete
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

  // Fast local commands (no backend needed)
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

    // Check for local command first
    const local = handleLocalCommand(text)
    if (local) {
      speak(local, voices)
      chat.sendMessage(text, { voice: true })
      return
    }

    // If it has a wake word or is a direct command, send to AI
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

        <div className="h-full w-full transition-opacity duration-1000 relative z-10"
          style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr 300px',
            gridTemplateRows: '90px 1fr 140px',
            gap: '14px',
            padding: '14px',
            height: '100vh',
            opacity: active ? 1 : 0,
          }}>
          {/* LEFT COLUMN */}
          <div style={{ gridColumn: '1', gridRow: '1 / 3', display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}>
            <ProfilePanel data={data} />
            <NetworkPanel />
            <CalendarPanel />
            <AppLauncherPanel />
          </div>

          {/* HEADER */}
          <div className="hud-panel" style={{ gridColumn: '2', gridRow: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

          {/* CENTER - Chat or Arc Reactor */}
          <div className="hud-panel relative flex items-center justify-center overflow-hidden" style={{ gridColumn: '2', gridRow: '2' }}>
            {!chat.chatOpen && (
              <>
                <JarvisCore isListening={isListening} glitchKey={glitchKey} />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                  {quickLinks.map(link => (
                    <div key={link.label}
                      className="text-[0.55rem] tracking-[0.15em] text-hud-dim cursor-pointer py-0.5 px-2 border-l border-transparent hover:border-cyan hover:text-cyan transition-all"
                      onClick={() => window.open(link.url, '_blank')}>
                      {link.label}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Chat overlay */}
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

          {/* RIGHT COLUMN */}
          <div style={{ gridColumn: '3', gridRow: '1 / 3', display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}>
            <SystemMonitorPanel data={data} />
            <WeatherPanel />
            <DatePowerPanel />
            <MediaPlayerPanel />
          </div>

          {/* FOOTER */}
          <div style={{ gridColumn: '1 / 4', gridRow: '3' }}>
            <FooterPanel />
          </div>
        </div>

        <VoiceIndicator isListening={isListening} />
      </div>
    </>
  )
}
