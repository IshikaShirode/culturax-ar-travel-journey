import { useEffect, useRef } from 'react';

interface FogLayerProps {
  layer?: number;
}

export const FogLayer = ({ layer = 1 }: FogLayerProps) => {
  const fogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fog = fogRef.current;
    if (!fog) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let scrollY = 0;
    let animationFrameId: number;

    const strength = layer === 1 ? 20 : 40;

    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouseX = (e.clientX - w / 2) / (w / 2);
      mouseY = (e.clientY - h / 2) / (h / 2);
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const animate = () => {
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;

      const moveX = currentX * strength;
      const moveY = currentY * strength + scrollY * 0.1;

      fog.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [layer]);

  return (
    <div
      ref={fogRef}
      className="fixed inset-0 pointer-events-none z-0 transition-transform"
      style={{
        background: layer === 1 
          ? 'radial-gradient(circle at 30% 50%, rgba(45, 212, 191, 0.15) 0%, transparent 50%)'
          : 'radial-gradient(circle at 70% 60%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        filter: 'blur(80px)',
      }}
    />
  );
};
