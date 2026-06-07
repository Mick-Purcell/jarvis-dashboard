import * as cheerio from 'cheerio'

export async function searchDuckDuckGo(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  })
  if (!res.ok) throw new Error(`DuckDuckGo returned ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)
  const results = []
  $('.result').each((_, el) => {
    const titleEl = $(el).find('.result__a')
    const snippetEl = $(el).find('.result__snippet')
    const urlEl = $(el).find('.result__url')
    const title = titleEl.text().trim()
    const snippet = snippetEl.text().trim()
    const resultUrl = titleEl.attr('href') || urlEl.text().trim()
    if (title && resultUrl) {
      results.push({ title, snippet, url: resultUrl })
    }
  })
  return results.slice(0, 10)
}
