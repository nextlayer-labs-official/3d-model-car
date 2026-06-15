'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const NAV_LINKS = ['Home', 'Features', 'Performance', 'Gallery', 'Contact'];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: 'power3.out' }
    );

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (idx: number) => {
    const sectionHeight = window.innerHeight;
    window.scrollTo({ top: idx * sectionHeight, behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      {/* ── Main nav bar ──────────────────────────────────── */}
      <nav
        ref={navRef}
        style={{ opacity: 0 }}
        className="glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full border"
            style={{ width: 32, height: 32, borderColor: 'rgba(201,169,110,0.5)' }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a96e' }} />
          </div>
          <span style={{ color: '#fff', fontWeight: 300, letterSpacing: '0.22em', fontSize: 13, textTransform: 'uppercase' }}>
            AutoVision
          </span>
        </div>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link, i) => (
            <li key={link}>
              <button
                onClick={() => scrollTo(i)}
                style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.25s',
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#c9a96e')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)')}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA + burger */}
        <div className="flex items-center gap-4">
          <button
            className="hidden md:block"
            style={{
              padding: '8px 20px',
              border: '1px solid rgba(201,169,110,0.5)',
              color: '#c9a96e',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              background: 'none',
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = '#c9a96e';
              el.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = 'none';
              el.style.color = '#c9a96e';
            }}
          >
            Book Now
          </button>

          {/* Burger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1 border-0 bg-transparent cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: 20,
                  height: 1,
                  background: '#fff',
                  transition: 'all 0.3s',
                  transformOrigin: 'center',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translateY(4px)' : i === 2 ? 'rotate(-45deg) translateY(-4px)' : 'scaleX(0)'
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ───────────────────────────────────── */}
      <div
        className="glass fixed inset-0 z-40 md:hidden flex flex-col items-center justify-center gap-8"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.4s',
        }}
      >
        {NAV_LINKS.map((link, i) => (
          <button
            key={link}
            onClick={() => scrollTo(i)}
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 22,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 300,
              transition: 'color 0.25s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#c9a96e')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)')}
          >
            {link}
          </button>
        ))}
      </div>

      {/* ── Right-side scroll progress ────────────────────── */}
      <div
        className="hidden md:flex"
        style={{
          position: 'fixed',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ width: 1, height: 96, background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden', borderRadius: 1 }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${scrollPct}%`,
              background: '#c9a96e',
              transition: 'height 0.1s',
            }}
          />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '0.15em', fontFamily: 'monospace', writingMode: 'vertical-rl', marginTop: 6 }}>
          {Math.round(scrollPct)}%
        </span>
      </div>

      {/* ── Left-side social icons ────────────────────────── */}
      <div
        className="hidden md:flex"
        style={{
          position: 'fixed',
          left: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {['IG', 'TW', 'YT'].map((s) => (
          <button
            key={s}
            style={{
              color: 'rgba(255,255,255,0.2)',
              fontSize: 9,
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.25s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#c9a96e')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.2)')}
          >
            {s}
          </button>
        ))}
        <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.1)', marginTop: 4 }} />
      </div>
    </>
  );
}
