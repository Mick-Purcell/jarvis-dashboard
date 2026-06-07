import { useState, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const abortRef = useRef(null)

  const sendMessage = useCallback(async (text, { searchFirst = false, voice = false } = {}) => {
    if (!text.trim()) return

    const userMsg = { id: Date.now(), role: 'user', content: text, voice }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    setIsSearching(searchFirst)
    setChatOpen(true)

    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }))

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, searchFirst })
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let searchResults = null
      const assistantId = Date.now() + 1

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', searchResults: null }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        for (const line of chunk.split('\n')) {
          if (!line.trim() || !line.startsWith('data: ')) continue
          const json = line.slice(6)
          try {
            const parsed = JSON.parse(json)
            if (parsed.type === 'text') {
              assistantContent += parsed.content
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ))
            } else if (parsed.type === 'search') {
              searchResults = parsed.results
              setIsSearching(false)
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, searchResults } : m
              ))
            } else if (parsed.type === 'error') {
              assistantContent += parsed.content
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent, error: true } : m
              ))
            } else if (parsed.type === 'done') {
              setIsTyping(false)
            }
          } catch {}
        }
      }
    } catch (err) {
      setIsTyping(false)
      setIsSearching(false)
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: `Connection failed: ${err.message}`,
        error: true
      }])
    }
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setChatOpen(false)
  }, [])

  return { messages, isTyping, isSearching, chatOpen, setChatOpen, sendMessage, clearChat }
}
