import { useState, useRef, useEffect } from 'react'

function markdownToHtml(text) {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n/g, '<br>')
}

export default function ChatPanel({ messages, isTyping, isSearching, chatOpen, setChatOpen, onSend, onClear, voiceListening, onVoiceToggle }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return
    onSend(input, { searchFirst: input.startsWith('?') })
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!chatOpen && messages.length === 0) {
    return (
      <div className="absolute bottom-16 sm:bottom-5 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 w-[90vw] sm:w-auto max-w-lg">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 bg-[rgba(0,20,40,0.85)] border border-cyan/30 rounded px-3 py-2.5 sm:py-2 backdrop-blur-md"
          style={{ boxShadow: '0 0 20px rgba(0,240,255,0.1), inset 0 0 20px rgba(0,240,255,0.03)' }}>
          <span className="text-cyan text-[0.7rem] font-orbitron mr-1 hidden sm:inline">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask J.A.R.V.I.S. anything..."
            className="flex-1 bg-transparent border-none outline-none text-white text-[0.85rem] sm:text-[0.8rem] font-rajdhani placeholder:text-hud-dim/50 min-w-0"
          />
          <button type="submit" disabled={isTyping} className="text-cyan text-[0.75rem] sm:text-[0.7rem] hover:text-white transition-colors cursor-pointer disabled:opacity-30 font-orbitron px-2 py-1 sm:px-0">
            SEND
          </button>
        </form>
        <button
          onClick={onVoiceToggle}
          className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center text-[0.85rem] sm:text-[0.7rem] transition-all cursor-pointer flex-shrink-0 ${voiceListening ? 'border-amber bg-amber/10 text-amber animate-[voicePulse_1s_infinite]' : 'border-cyan/30 text-cyan hover:border-cyan hover:bg-cyan/5'}`}>
          {voiceListening ? '●' : '🎤'}
        </button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-[250] flex flex-col bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) setChatOpen(false) }}>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        onClick={e => e.stopPropagation()}>

        {messages.length === 0 && (
          <div className="text-center text-hud-dim text-[0.75rem] mt-10 opacity-50">
            J.A.R.V.I.S. is standing by. Type or speak your request, sir.
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}>
              {/* Label */}
              <div className={`text-[0.55rem] uppercase tracking-[0.15em] mb-1 ${msg.role === 'user' ? 'text-right text-amber' : 'text-cyan'}`}>
                {msg.role === 'user' ? 'You' : 'J.A.R.V.I.S.'}
              </div>

              {/* Bubble */}
              <div className={`relative rounded p-3 text-[0.8rem] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber/5 border border-amber/20 text-white'
                  : msg.error
                    ? 'bg-red-900/10 border border-red-500/20 text-red-200'
                    : 'bg-[rgba(0,30,60,0.7)] border border-cyan/15 text-white'
              }`}
                style={msg.role !== 'user' && !msg.error ? { boxShadow: 'inset 0 0 20px rgba(0,240,255,0.03)' } : {}}>
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }} />

                {/* Search results */}
                {msg.searchResults && msg.searchResults.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cyan/10">
                    <div className="text-[0.55rem] uppercase tracking-[0.12em] text-cyan mb-2">Web Search Results</div>
                    <div className="space-y-2">
                      {msg.searchResults.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="block bg-white/[0.02] border border-cyan/8 rounded p-2 hover:border-cyan/25 hover:bg-cyan/3 transition-all cursor-pointer">
                          <div className="text-[0.7rem] text-cyan font-medium truncate">{r.title}</div>
                          <div className="text-[0.6rem] text-hud-dim mt-0.5 line-clamp-2">{r.snippet}</div>
                          <div className="text-[0.5rem] text-hud-dim/50 mt-0.5 truncate">{r.url}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Corner accents */}
                {msg.role !== 'user' && !msg.error && (
                  <>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/40" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan/40" />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="mr-8">
              <div className="text-[0.55rem] uppercase tracking-[0.15em] mb-1 text-cyan">J.A.R.V.I.S.</div>
              <div className="bg-[rgba(0,30,60,0.7)] border border-cyan/15 rounded p-3 flex items-center gap-1.5">
                {isSearching && <span className="text-[0.6rem] text-hud-dim mr-2">Searching web...</span>}
                <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-[dotPulse_1.2s_infinite]" />
                <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-[dotPulse_1.2s_infinite_0.2s]" />
                <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-[dotPulse_1.2s_infinite_0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 pb-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 bg-[rgba(0,20,40,0.85)] border border-cyan/30 rounded px-3 py-2 sm:py-2 backdrop-blur-md"
            style={{ boxShadow: '0 0 20px rgba(0,240,255,0.1), inset 0 0 20px rgba(0,240,255,0.03)' }}>
            <span className="text-cyan text-[0.7rem] font-orbitron mr-1 hidden sm:inline">❯</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask J.A.R.V.I.S. anything..."
              className="flex-1 bg-transparent border-none outline-none text-white text-[0.85rem] sm:text-[0.8rem] font-rajdhani placeholder:text-hud-dim/50 min-w-0"
              autoFocus
            />
            <button type="submit" disabled={isTyping} className="text-cyan text-[0.75rem] sm:text-[0.7rem] hover:text-white transition-colors cursor-pointer disabled:opacity-30 font-orbitron px-2 py-1 sm:px-0">
              SEND
            </button>
          </form>
          <button
            onClick={onVoiceToggle}
            className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center text-[0.85rem] sm:text-[0.7rem] transition-all cursor-pointer ${voiceListening ? 'border-amber bg-amber/10 text-amber animate-[voicePulse_1s_infinite]' : 'border-cyan/30 text-cyan hover:border-cyan hover:bg-cyan/5'}`}>
            {voiceListening ? '●' : '🎤'}
          </button>
          <button onClick={onClear} className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-cyan/20 text-hud-dim hover:border-cyan hover:text-cyan transition-all cursor-pointer text-[0.7rem] sm:text-[0.65rem]">
            CLR
          </button>
        </div>
      </div>
    </div>
  )
}
