export const HoloParticles = () => {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 3,
    scale: 0.5 + Math.random() * 1.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan rounded-full animate-glow"
          style={{
            left: `${particle.left}vw`,
            top: `${particle.top}vh`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            transform: `scale(${particle.scale})`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};
