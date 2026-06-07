export default function ParticleField({ particles }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
