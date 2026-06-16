'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ScrollSections from '@/components/ScrollSections';
import LoadingScreen from '@/components/LoadingScreen';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

let CarScene: React.ComponentType<{ onLoaded: () => void }> | null = null;

/* Black overlay that fades in/out at S3→S4 and S4→S5 boundaries,
   hiding the moment the camera clips through the car body panels. */
function TransitionVeil() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0 || !ref.current) return;
      const p = window.scrollY / max;

      // Entry veil — peaks at 74% (S3→S4, camera entering car)
      const entry = p < 0.74
        ? Math.max(0, (p - 0.64) / 0.10)
        : Math.max(0, (0.83 - p) / 0.09);

      // Exit veil — peaks at 89% (S4→S5, camera leaving car)
      const exit = p < 0.89
        ? Math.max(0, (p - 0.82) / 0.07)
        : Math.max(0, (0.97 - p) / 0.08);

      ref.current.style.opacity = String(Math.min(0.98, Math.max(entry, exit)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 49,
        background: '#000',
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useScrollAnimation(scrollContainerRef);

  useEffect(() => {
    import('@/components/CarScene').then((mod) => {
      CarScene = mod.default;
      setMounted(true);
    });
  }, []);

  const handleLoaded = useCallback(() => setIsLoaded(true), []);

  return (
    <>
      <LoadingScreen isLoaded={isLoaded} />
      <Navbar />
      {mounted && CarScene && <CarScene onLoaded={handleLoaded} />}
      <TransitionVeil />
      <div ref={scrollContainerRef} style={{ position: 'relative', zIndex: 2 }}>
        <ScrollSections />
      </div>
    </>
  );
}
