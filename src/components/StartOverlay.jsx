export default function StartOverlay({ onActivate }) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/92 cursor-pointer transition-opacity duration-700"
      onClick={onActivate}>
      <div className="w-20 h-20 rounded-full border-2 border-cyan mb-6 animate-[ringPulse_2s_infinite_ease-in-out]"
        style={{ boxShadow: '0 0 20px rgba(0,240,255,0.4)' }} />
      <h1 className="font-orbitron text-2xl tracking-[0.25em] text-cyan mb-4"
        style={{ textShadow: '0 0 10px rgba(0,240,255,0.6)' }}>
        SYSTEM STANDBY
      </h1>
      <p className="text-hud-dim text-sm tracking-[0.1em]">Click to activate J.A.R.V.I.S. voice control</p>
    </div>
  )
}
