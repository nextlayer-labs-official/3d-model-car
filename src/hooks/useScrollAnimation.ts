import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface CarAnimationState {
  rotationY: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

/*  Camera design principles
    ─────────────────────────
    • Y  1.1–1.4  →  bonnet/hood level — like real automotive photography
    • Z  5.5–6.5  →  close enough that the car fills its gap
    • X  ±2–3     →  strong lateral offset for dramatic 3/4 angles
    • targetX     →  offset look-at to push car into the open side of each section
      negative targetX  →  camera looks left  →  car slides RIGHT  (S1, S3)
      positive targetX  →  camera looks right →  car slides LEFT   (S2, S4)   */
const animState: CarAnimationState = {
  rotationY: 0,
  cameraX:   2.5,   // camera offset right for front-left 3/4 angle
  cameraY:   1.3,   // hood level
  cameraZ:   6.0,
  targetX:  -1.5,   // look left → car sits in right gap  (S1 layout)
  targetY:   0.7,
  targetZ:   0,
};

export function getAnimState(): CarAnimationState { return animState; }

export function useScrollAnimation(containerRef: RefObject<HTMLDivElement | null>) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end:   'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      tlRef.current = tl;

      /* ── S1 → S2  (0° → 90°)
         Text moves to RIGHT side → car needs to be in LEFT gap
         Camera swings to driver's side (negative X), low & close          */
      tl.to(animState, {
        rotationY: Math.PI / 2,
        cameraX:  -2.8,   // camera hard left for a dynamic passenger-side angle
        cameraY:   1.1,   // drop low — wheel-arch level
        cameraZ:   5.8,
        targetX:   1.8,   // look right → car in LEFT gap
        targetY:   0.6,
        targetZ:   0,
        ease: 'none', duration: 1,
      });

      /* ── S2 → S3  (90° → 180°)
         Text back to LEFT → car in RIGHT gap — reveal rear of car
         Camera arcs to right side, slightly higher for a rear-3/4 look      */
      tl.to(animState, {
        rotationY: Math.PI,
        cameraX:   2.8,
        cameraY:   1.4,
        cameraZ:   6.2,
        targetX:  -1.6,   // look left → car in RIGHT gap
        targetY:   0.7,
        targetZ:   0,
        ease: 'none', duration: 1,
      });

      /* ── S3 → S4  (180° → 270°)
         At 270° rotation: front (dashboard/windshield) = world −X, rear = +X.
         Camera at the dashboard end, looking backward toward rear seats.
         This reveals the full cabin: steering wheel, front seats, rear seats.  */
      tl.to(animState, {
        rotationY: Math.PI * 1.5,
        cameraX:  -1.6,   // dashboard / front of cabin (front = −X at 270°)
        cameraY:   1.05,  // slightly above seat level — eye height
        cameraZ:   0.15,  // tiny passenger-side offset for natural composition
        targetX:   2.0,   // look toward rear seats
        targetY:   0.45,  // aim at seat cushion / floor level
        targetZ:   0,
        ease: 'none', duration: 1,
      });

      /* ── S4 → S5  (270° → 360°)
         Camera bursts out through the windshield / front glass and pulls back
         for a wide cinematic CTA reveal of the full car                     */
      tl.to(animState, {
        rotationY: Math.PI * 2,
        cameraX:   0,
        cameraY:   2.8,
        cameraZ:   8.0,   // sweeps out from inside → far back
        targetX:   0,
        targetY:   0.5,
        targetZ:   0,
        ease: 'none', duration: 1,
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [containerRef]);

  return tlRef;
}
