export default function VoiceIndicator({ isListening }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-cyan/20">
      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isListening ? 'bg-cyan animate-[dotPulse_1.2s_infinite]' : 'bg-amber'}`}
        style={{ boxShadow: isListening ? '0 0 8px #00f0ff' : '0 0 6px #ff8c00' }} />
      <span className="text-[0.6rem] uppercase tracking-[0.1em] text-hud-dim">
        {isListening ? 'Listening' : 'Standby'}
      </span>
    </div>
  )
}
