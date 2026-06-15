'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ── Gradients — only on the TEXT side, fade to transparent toward the car gap ── */
const G = {
  left:   'linear-gradient(90deg,  rgba(9,9,9,0.92) 0%, rgba(9,9,9,0.6) 42%, rgba(9,9,9,0.15) 62%, transparent 80%)',
  right:  'linear-gradient(270deg, rgba(9,9,9,0.92) 0%, rgba(9,9,9,0.6) 42%, rgba(9,9,9,0.15) 62%, transparent 80%)',
  bottom: 'linear-gradient(0deg,   rgba(9,9,9,0.88) 0%, rgba(9,9,9,0.5) 45%, transparent 75%)',
};

/* ── Shared label style ───────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  color: '#c9a96e',
  fontSize: 10,
  letterSpacing: '0.38em',
  textTransform: 'uppercase',
  marginBottom: 16,
};

/* ── Spec card ────────────────────────────────────────────────── */
function SpecCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="spec-card glass rounded-xl p-4 flex flex-col gap-1"
      style={{ opacity: 0, transform: 'translateY(20px)' }}>
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 300, color: '#fff' }}>{value}</span>
        <span style={{ color: '#c9a96e', fontSize: 12 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ── Floating card ────────────────────────────────────────────── */
function FloatCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="float-card glass rounded-xl p-5"
      style={{ opacity: 0, transform: 'translateX(28px)', maxWidth: 260 }}>
      <div style={{ width: 20, height: 1, background: '#c9a96e', marginBottom: 10 }} />
      <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>{title}</h4>
      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

/* ── Heading helper ───────────────────────────────────────────── */
function SectionHeading({ line1, accent, className, style }: {
  line1: string; accent: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2 className={className} style={{
      fontSize: 'clamp(2.2rem, 5vw, 4rem)',
      fontWeight: 200, color: '#fff', lineHeight: 1.05,
      marginBottom: 18, ...style,
    }}>
      {line1}<br />
      <span className="text-gradient" style={{ fontWeight: 300 }}>{accent}</span>
    </h2>
  );
}

/* ── Body copy helper ─────────────────────────────────────────── */
const bodyStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.42)',
  fontSize: 15,
  lineHeight: 1.85,
  marginBottom: 28,
};

/* ════════════════════════════════════════════════════════════════ */
export default function ScrollSections() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {

      /* S1 — hero entrance */
      gsap.fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.hero-title',   { opacity: 0, y: 60, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, delay: 0.35, ease: 'power3.out' });
      gsap.fromTo('.hero-sub',     { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.7,  ease: 'power3.out' });
      gsap.fromTo('.hero-cta',     { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, delay: 1.0,  ease: 'power3.out' });

      /* S2 — from left */
      ScrollTrigger.create({ trigger: '#s2', start: 'top 65%', onEnter: () => {
        gsap.to('.s2-tag',   { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' });
        gsap.to('.s2-h',     { opacity: 1, x: 0, duration: 0.75, delay: 0.12, ease: 'power3.out' });
        gsap.to('.s2-body',  { opacity: 1, x: 0, duration: 0.7,  delay: 0.24, ease: 'power3.out' });
        gsap.to('.s2-line',  { scaleX: 1,         duration: 0.55, delay: 0.38, ease: 'power2.out' });
        gsap.to('.s2-stat',  { opacity: 1, y: 0, stagger: 0.09, duration: 0.55, delay: 0.46, ease: 'power3.out' });
      }});

      /* S3 — from right */
      ScrollTrigger.create({ trigger: '#s3', start: 'top 65%', onEnter: () => {
        gsap.to('.s3-badge', { opacity: 1, scale: 1,   duration: 0.45, ease: 'back.out(1.7)' });
        gsap.to('.s3-h',     { opacity: 1, x: 0,       duration: 0.75, delay: 0.14, ease: 'power3.out' });
        gsap.to('.s3-body',  { opacity: 1, x: 0,       duration: 0.7,  delay: 0.26, ease: 'power3.out' });
        gsap.to('.spec-card',{ opacity: 1, y: 0, stagger: 0.1, duration: 0.6, delay: 0.4, ease: 'power3.out' });
      }});

      /* S4 — from left */
      ScrollTrigger.create({ trigger: '#s4', start: 'top 65%', onEnter: () => {
        gsap.to('.s4-label', { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
        gsap.to('.s4-h',     { opacity: 1, y: 0, duration: 0.75, delay: 0.14, ease: 'power3.out' });
        gsap.to('.s4-body',  { opacity: 1, y: 0, duration: 0.7,  delay: 0.26, ease: 'power3.out' });
        gsap.to('.float-card',{ opacity: 1, x: 0, stagger: 0.13, duration: 0.65, delay: 0.4, ease: 'power3.out' });
      }});

      /* S5 — scale up */
      ScrollTrigger.create({ trigger: '#s5', start: 'top 65%', onEnter: () => {
        gsap.to('.s5-eye',  { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
        gsap.to('.s5-h',    { opacity: 1, y: 0, duration: 0.85, delay: 0.12, ease: 'power3.out' });
        gsap.to('.s5-sub',  { opacity: 1, y: 0, duration: 0.7,  delay: 0.25, ease: 'power3.out' });
        gsap.to('.s5-div',  { scaleX: 1,         duration: 0.7,  delay: 0.35, ease: 'power2.out' });
        gsap.to('.s5-btn',  { opacity: 1, y: 0, stagger: 0.14,  duration: 0.65, delay: 0.46, ease: 'back.out(1.4)' });
      }});

    }, root);

    return () => ctx.revert();
  }, []);

  /* ── Shared section wrapper ──────────────────────────────────── */
  const sectionBase: React.CSSProperties = {
    position: 'relative',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    overflow: 'hidden',
  };

  return (
    <div ref={root}>

      {/* ══════════════════════════════════════════════════════════
          S1 · HERO
          Layout: text block bottom-left  |  car gap right 55 %
          ══════════════════════════════════════════════════════════ */}
      <section id="s1" style={{ ...sectionBase, alignItems: 'flex-end', paddingBottom: '7vh' }}>
        {/* gradient covers left 60 %, fades to transparent on right */}
        <div style={{ position: 'absolute', inset: 0, background: G.left, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', width: '45%', minWidth: 280, paddingLeft: 'clamp(1.5rem,6vw,4rem)' }}>
          <p className="hero-eyebrow" style={{ ...labelStyle, opacity: 0 }}>2025 Edition</p>

          <h1 className="hero-title" style={{
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 200, color: '#fff', lineHeight: 0.92,
            letterSpacing: '-0.02em', marginBottom: 20, opacity: 0,
          }}>
            The Future of<br />
            <span className="text-gradient" style={{ fontWeight: 300 }}>Performance</span>
          </h1>

          <p className="hero-sub" style={{ color: 'rgba(255,255,255,0.48)', fontSize: 'clamp(0.9rem,1.6vw,1.1rem)', fontWeight: 300, marginBottom: 36, opacity: 0 }}>
            Engineered for those who demand excellence.
          </p>

          <div className="hero-cta" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, opacity: 0 }}>
            <Btn primary>Explore Vehicle</Btn>
            <Btn>Watch Film</Btn>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S2 · AERODYNAMIC DESIGN
          Layout: car gap left 55 %  |  text right 45 %
          ══════════════════════════════════════════════════════════ */}
      <section id="s2" style={sectionBase}>
        {/* gradient covers right 60 %, fades left toward car gap */}
        <div style={{ position: 'absolute', inset: 0, background: G.right, pointerEvents: 'none' }} />

        {/* Push text to the right */}
        <div style={{ position: 'relative', marginLeft: 'auto', width: '42%', minWidth: 260, paddingRight: 'clamp(1.5rem,6vw,4rem)' }}>
          <span className="s2-tag" style={{ ...labelStyle, display: 'inline-block', opacity: 0, transform: 'translateX(-30px)' }}>
            01 — Design
          </span>

          <SectionHeading line1="Aerodynamic" accent="Design"
            className="s2-h" style={{ opacity: 0, transform: 'translateX(-36px)' }} />

          <p className="s2-body" style={{ ...bodyStyle, opacity: 0, transform: 'translateX(-28px)' }}>
            Every curve sculpted to perfection. A drag coefficient of 0.22 Cd — the most
            aerodynamically efficient vehicle in its class.
          </p>

          <div className="s2-line" style={{ height: 1, background: 'rgba(201,169,110,0.3)', marginBottom: 24, transformOrigin: 'left', transform: 'scaleX(0)' }} />

          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[['0.22','Drag Cd'],['4.8 s','0–100 km/h'],['320','Top km/h']].map(([v,l]) => (
              <div key={l} className="s2-stat" style={{ opacity: 0, transform: 'translateY(14px)' }}>
                <div style={{ fontSize: 24, fontWeight: 300, color: '#fff' }}>{v}</div>
                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S3 · ADVANCED SAFETY
          Layout: text left 45 %  |  car gap right 55 %
          ══════════════════════════════════════════════════════════ */}
      <section id="s3" style={sectionBase}>
        <div style={{ position: 'absolute', inset: 0, background: G.left, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', width: '45%', minWidth: 280, paddingLeft: 'clamp(1.5rem,6vw,4rem)' }}>
          <div className="s3-badge" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 13px', borderRadius: 99, marginBottom: 20,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            opacity: 0, transform: 'scale(0.88)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
            <span style={{ color: '#4ade80', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' }}>5-Star Safety</span>
          </div>

          <SectionHeading line1="Advanced" accent="Safety Systems"
            className="s3-h" style={{ opacity: 0, transform: 'translateX(30px)' }} />

          <p className="s3-body" style={{ ...bodyStyle, opacity: 0, transform: 'translateX(24px)' }}>
            360° sensor fusion with predictive AI — real-time hazard detection that
            responds faster than the human eye can perceive.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SpecCard label="Sensors"        value="32"  unit="units" />
            <SpecCard label="Response"       value="0.1" unit="ms"    />
            <SpecCard label="Range"          value="250" unit="m"     />
            <SpecCard label="Resolution"     value="8K"  unit="HDR"   />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S4 · LUXURY INTERIOR
          Layout: car gap left 55 %  |  text right 45 %
          ══════════════════════════════════════════════════════════ */}
      <section id="s4" style={sectionBase}>
        <div style={{ position: 'absolute', inset: 0, background: G.right, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', marginLeft: 'auto', width: '42%', minWidth: 260, paddingRight: 'clamp(1.5rem,6vw,4rem)' }}>
          <p className="s4-label" style={{ ...labelStyle, opacity: 0, transform: 'translateY(12px)' }}>
            03 — Interior
          </p>

          <SectionHeading line1="Luxury Interior" accent="Experience"
            className="s4-h" style={{ opacity: 0, transform: 'translateY(22px)' }} />

          <p className="s4-body" style={{ ...bodyStyle, opacity: 0, transform: 'translateY(16px)' }}>
            Hand-stitched Nappa leather. 64-zone ambient lighting. A 16-speaker
            Meridian sound system that transforms every journey.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FloatCard title="Nappa Leather Interior"   desc="16 colour options, hand-stitched with precision by master craftsmen" />
            <FloatCard title="64-Zone Ambient Lighting" desc="Adaptive colour temperature that matches your mood and time of day" />
            <FloatCard title="AI Climate Control"       desc="Predictive four-zone climate pre-conditions the cabin before you arrive" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S5 · FINAL CTA
          Layout: text centred at bottom  |  car fills the view
          ══════════════════════════════════════════════════════════ */}
      <section id="s5" style={{ ...sectionBase, alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center', paddingBottom: '8vh' }}>
        {/* bottom fade only */}
        <div style={{ position: 'absolute', inset: 0, background: G.bottom, pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <p className="s5-eye" style={{ ...labelStyle, opacity: 0, transform: 'translateY(12px)' }}>
            Begin Your Journey
          </p>

          <h2 className="s5-h" style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 200, color: '#fff', lineHeight: 0.92,
            letterSpacing: '-0.02em', marginBottom: 18, opacity: 0, transform: 'translateY(28px)',
          }}>
            Own the<br />
            <span className="text-gradient" style={{ fontWeight: 300 }}>Road Ahead</span>
          </h2>

          <p className="s5-sub" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, fontWeight: 300, marginBottom: 14, opacity: 0, transform: 'translateY(18px)' }}>
            Available for order. Deliveries begin Q2 2025.
          </p>

          <div className="s5-div" style={{ width: 64, height: 1, background: 'rgba(201,169,110,0.4)', margin: '0 auto 30px', transformOrigin: 'center', transform: 'scaleX(0)' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <button className="s5-btn" style={{ ...btnStyle(true),  opacity: 0, transform: 'translateY(18px)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e8c88a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#c9a96e')}>
              Book a Test Drive
            </button>
            <button className="s5-btn" style={{ ...btnStyle(false), opacity: 0, transform: 'translateY(18px)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.6)'; e.currentTarget.style.color = '#c9a96e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#fff'; }}>
              Download Brochure
            </button>
          </div>
        </div>

        <p style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          © 2025 AutoVision — Redefining Automotive Excellence
        </p>
      </section>

    </div>
  );
}

/* ── Button helpers ───────────────────────────────────────────── */
function btnStyle(primary: boolean): React.CSSProperties {
  return primary
    ? { padding: '13px 36px', background: '#c9a96e', color: '#000', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 2, transition: 'background 0.3s', minWidth: 200 }
    : { padding: '13px 36px', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, transition: 'border-color 0.3s, color 0.3s', minWidth: 200 };
}

function Btn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      style={btnStyle(!!primary)}
      onMouseEnter={(e) => {
        if (primary) e.currentTarget.style.background = '#e8c88a';
        else { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }
      }}
      onMouseLeave={(e) => {
        if (primary) e.currentTarget.style.background = '#c9a96e';
        else { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }
      }}
    >
      {children}
    </button>
  );
}
