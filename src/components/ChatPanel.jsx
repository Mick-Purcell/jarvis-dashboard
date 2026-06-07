import { useState, useRef, useEffect } from 'react'

function markdownToHtml(text) {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n/g, '<br/>')
}

export default function ChatPanel({ messages, isTyping, isSearching, chatOpen, setChatOpen, onSend, onClear, voiceListening, onVoiceToggle }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isTyping])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const searchFirst = input.startsWith('?')
    onSend(searchFirst ? input.slice(1).trim() : input, { searchFirst })
    setInput('')
  }

  return (
    <div className={`absolute inset-0 z-50 flex flex-col transition-all duration-500 ${chatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-hud-dim text-sm mt-20">
            <p className="font-orbitron text-cyan text-lg mb-2">J.A.R.V.I.S. AI Interface</p>
            <p>Type a message or use voice commands</p>
            <p className="text-xs mt-2 opacity-60">Prefix with ? to search the web first</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[85%] px-3 py-2 rounded text-[0.8rem] ${
              msg.role === 'user'
                ? 'bg-cyan/10 border border-cyan/20 text-white'
                : 'bg-black/40 border border-cyan/10 text-hud-dim'
            }`}>
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content || '') }} />
              ) : (
                <span>{msg.content}</span>
              )}
              {msg.searchResults && msg.searchResults.length > 0 && (
                <div className="mt-2 pt-2 border-t border-cyan/10">
                  <div className="text-[0.6rem] text-cyan uppercase tracking-wider mb-1">Search Results</div>
                  {msg.searchResults.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer"
                      className="block text-[0.65rem] text-blue-hud hover:underline mb-1 truncate">
                      {r.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isSearching && (
          <div className="text-left mb-3">
            <div className="inline-block px-3 py-2 rounded bg-black/40 border border-amber/20 text-amber text-[0.75rem]">
              Searching the web...
            </div>
          </div>
        )}
        {isTyping && (
          <div className="text-left mb-3">
            <div className="inline-block px-3 py-2 rounded bg-black/40 border border-cyan/10 text-cyan text-[0.75rem]">
              <span className="animate-pulse">J.A.R.V.I.S. is typing</span>
              <span className="inline-block w-1 h-1 bg-cyan rounded-full ml-1 animate-bounce" />
              <span className="inline-block w-1 h-1 bg-cyan rounded-full ml-0.5 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="inline-block w-1 h-1 bg-cyan rounded-full ml-0.5 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-cyan/10 bg-black/60 backdrop-blur flex gap-2">
        <button type="button" onClick={onVoiceToggle}
          className={`px-2 rounded border text-[0.7rem] transition-all ${voiceListening ? 'border-amber text-amber bg-amber/10' : 'border-cyan/20 text-hud-dim hover:border-cyan'}`}>
          {voiceListening ? '●' : '○'}
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask J.A.R.V.I.S. anything... (? to search)"
          className="flex-1 bg-black/40 border border-cyan/15 rounded px-3 py-1.5 text-[0.8rem] text-white placeholder:text-hud-dim/50 focus:outline-none focus:border-cyan/40"
        />
        <button type="submit" className="px-3 py-1.5 bg-cyan/10 border border-cyan/30 rounded text-cyan text-[0.75rem] hover:bg-cyan/20 transition-all">
          Send
        </button>
        <button type="button" onClick={onClear} className="px-2 py-1.5 border border-cyan/15 rounded text-hud-dim text-[0.7rem] hover:border-cyan/30 transition-all">
          Clear
        </button>
        <button type="button" onClick={() => setChatOpen(false)} className="px-2 py-1.5 border border-cyan/15 rounded text-hud-dim text-[0.7rem] hover:border-cyan/30 transition-all">
          ✕
        </button>
      </form>
    </div>
  )
}
