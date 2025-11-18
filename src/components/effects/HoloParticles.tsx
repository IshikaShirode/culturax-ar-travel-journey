export const HoloParticles = () => {
  const auroraLayers = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    hue: 180 + i * 15,
    duration: 18 + i * 4,
    delay: i * 2,
    blur: 160 - i * 15,
    scale: 1 + i * 0.15,
    opacity: 0.17 + i * 0.05,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsla(215,45%,12%,0.6)] via-[hsla(212,45%,7%,0.9)] to-[hsla(212,45%,5%,1)]" />
      {auroraLayers.map((layer) => (
        <div
          key={layer.id}
          className="aurora-layer"
          style={{
            background: `radial-gradient(circle at ${30 + layer.id * 10}% ${
              40 + layer.id * 5
            }%, hsla(${layer.hue}, 85%, 60%, ${layer.opacity}) 0%, transparent 55%)`,
            animationDuration: `${layer.duration}s`,
            animationDelay: `-${layer.delay}s`,
            filter: `blur(${layer.blur}px)`,
            transform: `scale(${layer.scale})`,
          }}
        />
      ))}
    </div>
  );
};
