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

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, searchFirst })
      })

      if (!res.ok) throw new Error('AI core unreachable')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      let assistantId = Date.now() + 1

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', searchResults: [] }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.trim() || !line.startsWith('data: ')) continue
          const json = line.slice(6)
          if (json === '[DONE]') continue
          try {
            const parsed = JSON.parse(json)
            if (parsed.type === 'text') {
              assistantText += parsed.content
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantText } : m))
            } else if (parsed.type === 'search') {
              setIsSearching(false)
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, searchResults: parsed.results } : m))
            } else if (parsed.type === 'error') {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: parsed.content } : m))
            } else if (parsed.type === 'done') {
              setIsTyping(false)
            }
          } catch {}
        }
      }
      setIsTyping(false)
      setIsSearching(false)
    } catch (err) {
      setIsTyping(false)
      setIsSearching(false)
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `Sir, I encountered an error: ${err.message}` }])
    }
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setChatOpen(false)
  }, [])

  return { messages, isTyping, isSearching, chatOpen, setChatOpen, sendMessage, clearChat }
}
