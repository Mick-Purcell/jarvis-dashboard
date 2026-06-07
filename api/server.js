import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { searchDuckDuckGo } from './search.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    jarvis: 'J.A.R.V.I.S. AI Backend v2.0',
    llmConfigured: !!process.env.OPENAI_API_KEY || !!process.env.OPENROUTER_API_KEY,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'Missing query parameter "q"' })
  try {
    const results = await searchDuckDuckGo(q)
    res.json({ query: q, results })
  } catch (err) {
    console.error('Search error:', err.message)
    res.status(500).json({ error: 'Search failed', details: err.message })
  }
})

app.post('/api/chat', async (req, res) => {
  const { message, history = [], searchFirst = false } = req.body
  if (!message) return res.status(400).json({ error: 'Missing message' })

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY
  const baseURL = process.env.OPENAI_BASE_URL || process.env.OPENROUTER_BASE_URL || 'https://api.openai.com/v1'
  const model = process.env.LLM_MODEL || 'gpt-4o-mini'

  if (!apiKey) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.write(`data: ${JSON.stringify({ type: 'text', content: 'Sir, I do not have an active AI core configured. Please add an API key via Coolify environment variables (OPENAI_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY).' })}\n\n`)
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    res.end()
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  let searchResults = []
  if (searchFirst) {
    try {
      searchResults = await searchDuckDuckGo(message)
      res.write(`data: ${JSON.stringify({ type: 'search', results: searchResults.slice(0, 5) })}\n\n`)
    } catch (e) {
      console.log('Search skipped:', e.message)
    }
  }

  const systemPrompt = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's personal AI assistant. You are witty, concise, highly intelligent, and speak with a refined British butler tone. You address the user as "sir". Keep responses brief unless asked for detail. Use technical precision when discussing code or systems.\n\n${searchResults.length > 0 ? `The user asked about: "${message}". Here are recent web search results you may reference:\n${searchResults.slice(0, 5).map((r, i) => `${i + 1}. ${r.title}\n${r.snippet}\nURL: ${r.url}`).join('\n\n')}` : ''}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: message }
  ]

  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model, messages, stream: true, temperature: 0.7, max_tokens: 2048
      })
    })

    if (!response.ok) {
      const err = await response.text()
      res.write(`data: ${JSON.stringify({ type: 'error', content: `AI core error: ${err}` })}\n\n`)
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      res.end()
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

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
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            res.write(`data: ${JSON.stringify({ type: 'text', content: delta })}\n\n`)
          }
        } catch {}
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    res.end()
  } catch (err) {
    console.error('LLM error:', err)
    res.write(`data: ${JSON.stringify({ type: 'error', content: `Connection to AI core failed: ${err.message}` })}\n\n`)
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    res.end()
  }
})

const staticPath = process.env.STATIC_PATH || './dist'
app.use(express.static(staticPath))
app.get('*', (_req, res) => {
  res.sendFile(new URL(`${staticPath}/index.html`, import.meta.url).pathname)
})

app.listen(PORT, () => {
  console.log(`J.A.R.V.I.S. backend online on port ${PORT}`)
})
