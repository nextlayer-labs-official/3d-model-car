'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface Props {
  isLoaded: boolean;
}

export default function LoadingScreen({ isLoaded }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  /* Simulate progress until model loads */
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 10 : p));
    }, 150);
    return () => clearInterval(id);
  }, []);

  /* When loaded, complete bar then fade out */
  useEffect(() => {
    if (!isLoaded) return;
    setProgress(100);
    const t = setTimeout(() => {
      if (!overlayRef.current) return;
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => setVisible(false),
      });
    }, 450);
    return () => clearTimeout(t);
  }, [isLoaded]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c9a96e', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 8 }}>
            AutoVision
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Loading Experience
          </p>
        </div>

        {/* Spinner */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <svg
            style={{ animation: 'spin 1.2s linear infinite', width: '100%', height: '100%' }}
            viewBox="0 0 64 64"
            fill="none"
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="32" cy="32" r="28" stroke="#1c1c1c" strokeWidth="3" />
            <path d="M32 4 A28 28 0 0 1 60 32" stroke="#c9a96e" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#c9a96e', fontSize: 11, fontFamily: 'monospace',
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #c9a96e, #e8c88a)',
              borderRadius: 1,
              transition: 'width 0.2s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
