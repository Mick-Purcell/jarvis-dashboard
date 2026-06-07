export default function ResponseBubble({ text, visible }) {
  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] bg-[rgba(0,20,40,0.9)] border border-cyan px-5 py-2.5 rounded text-sm text-cyan whitespace-nowrap pointer-events-none transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ textShadow: '0 0 6px rgba(0,240,255,0.6)' }}
    >
      {text}
    </div>
  )
}
