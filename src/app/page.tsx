'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ScrollSections from '@/components/ScrollSections';
import LoadingScreen from '@/components/LoadingScreen';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// Manual mounted-state guard — more reliable than Next.js dynamic() in v16
let CarScene: React.ComponentType<{ onLoaded: () => void }> | null = null;

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useScrollAnimation(scrollContainerRef);

  useEffect(() => {
    // Import CarScene only on the client, after first paint
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

      {/* 3D canvas — rendered only client-side */}
      {mounted && CarScene && <CarScene onLoaded={handleLoaded} />}

      {/* Scrollable content — transparent so canvas shows through */}
      <div ref={scrollContainerRef} style={{ position: 'relative', zIndex: 2 }}>
        <ScrollSections />
      </div>
    </>
  );
}
