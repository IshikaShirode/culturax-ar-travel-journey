import { useEffect, useRef } from 'react';

export const NeonGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      grid.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={gridRef}
      className="fixed inset-0 pointer-events-none z-0 transition-transform duration-200"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        transform: 'perspective(1000px) rotateX(60deg)',
        transformOrigin: 'center top',
      }}
    />
  );
};
