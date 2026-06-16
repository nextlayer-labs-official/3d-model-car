'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { getAnimState } from '@/hooks/useScrollAnimation';

/* ─── Section alpha helper ──────────────────────────────────────
   sp = rotationY / (PI/2) → 0 to 4 across all sections
   fade width = 0.18 on each edge                                */
function sectionAlpha(sp: number, enter: number, exit: number): number {
  const fw = 0.18;
  if (sp < enter - fw) return 0;
  if (sp < enter)      return (sp - (enter - fw)) / fw;
  if (sp < exit)       return 1;
  if (sp < exit + fw)  return 1 - (sp - exit) / fw;
  return 0;
}

/* ─── Aerodynamics: CFD-style streamlines around car ───────────
   20 particles on an ellipse around the car's cross-section,
   scrolling front→back along Z with additive glow              */
const STREAMS = Array.from({ length: 20 }, (_, i) => {
  const a = (i / 20) * Math.PI * 2;
  return {
    x:     Math.sin(a) * 2.0,
    y:     Math.max(0.12, 0.62 + Math.cos(a) * 0.82),
    len:   0.65 + (i % 4) * 0.22,
    phase: (i / 20) * 4.5,
  };
});

function AeroStreamlines() {
  const gRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = gRef.current;
    if (!g) return;
    const sp = getAnimState().rotationY / (Math.PI / 2);
    const alpha = sectionAlpha(sp, 0.45, 1.85);
    g.visible = alpha > 0.005;
    if (!g.visible) return;
    const t = clock.getElapsedTime();
    g.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.z = ((t * 2.4 + STREAMS[i].phase) % 8) - 5;
      const distFade = Math.max(0, 1 - Math.abs(mesh.position.z + 0.5) / 4.5);
      (mesh.material as THREE.MeshBasicMaterial).opacity = alpha * distFade * 0.6;
    });
  });
  return (
    <group ref={gRef} visible={false}>
      {STREAMS.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0]}>
          <boxGeometry args={[0.016, 0.007, s.len]} />
          <meshBasicMaterial color="#33bbff" transparent opacity={0}
            depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Safety: radar rings + sensor dots ────────────────────────
   3 staggered expanding rings pulse outward from the car like a
   radar sweep; 4 green point lights mark the sensor positions  */
const RING_PHASES  = [0, 0.85, 1.7];
const SENSOR_POS: [number, number, number][] = [
  [0, 0.6, 2.8], [2.8, 0.6, 0], [0, 0.6, -2.8], [-2.8, 0.6, 0],
];

function SafetyEffect() {
  const ringGrp   = useRef<THREE.Group>(null);
  const sensorGrp = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const sp    = getAnimState().rotationY / (Math.PI / 2);
    const alpha = sectionAlpha(sp, 1.4, 2.85);
    const t     = clock.getElapsedTime() * 0.7;

    if (ringGrp.current) {
      ringGrp.current.visible = alpha > 0.005;
      ringGrp.current.children.forEach((ring, i) => {
        const cycle = ((t + RING_PHASES[i]) % 2.4) / 2.4;
        ring.scale.setScalar(0.18 + cycle * 7);
        ((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
          alpha * (1 - cycle) * 0.55;
      });
    }

    if (sensorGrp.current) {
      sensorGrp.current.visible = alpha > 0.005;
      const pulse = 0.6 + 0.4 * Math.sin(clock.getElapsedTime() * 2.5);
      sensorGrp.current.children.forEach(dot => {
        ((dot as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
          alpha * pulse * 0.9;
      });
    }
  });

  return (
    <>
      {/* Expanding ground rings */}
      <group ref={ringGrp} visible={false}>
        {RING_PHASES.map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[0.86, 1.0, 64]} />
            <meshBasicMaterial color="#00ee77" transparent opacity={0}
              depthWrite={false} blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Sensor position dots */}
      <group ref={sensorGrp} visible={false}>
        {SENSOR_POS.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#00ee77" transparent opacity={0}
              depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/* ─── Interior: warm cabin lighting ────────────────────────────
   Dedicated ambient + 6 point lights flood the cabin when the
   camera enters. High intensity, low decay, large distance so
   every surface inside is well-lit.                             */
function InteriorLights() {
  const ambRef = useRef<THREE.AmbientLight>(null);
  const l1 = useRef<THREE.PointLight>(null); // overhead centre
  const l2 = useRef<THREE.PointLight>(null); // dashboard (front = −X at 270°)
  const l3 = useRef<THREE.PointLight>(null); // centre console
  const l4 = useRef<THREE.PointLight>(null); // rear seats
  const l5 = useRef<THREE.PointLight>(null); // driver side door
  const l6 = useRef<THREE.PointLight>(null); // passenger side door
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const sp    = getAnimState().rotationY / (Math.PI / 2);
    const alpha = sectionAlpha(sp, 2.45, 3.85);
    const pulse = 0.92 + 0.08 * Math.sin(clock.getElapsedTime() * 1.4);

    if (ambRef.current) ambRef.current.intensity = alpha * 4.0;
    if (l1.current)     l1.current.intensity     = alpha * 30;
    if (l2.current)     l2.current.intensity     = alpha * 25 * pulse;
    if (l3.current)     l3.current.intensity     = alpha * 20;
    if (l4.current)     l4.current.intensity     = alpha * 18;
    if (l5.current)     l5.current.intensity     = alpha * 15;
    if (l6.current)     l6.current.intensity     = alpha * 15;

    if (glowRef.current) {
      glowRef.current.visible = alpha > 0.005;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        alpha * pulse * 0.22;
    }
  });

  return (
    <>
      {/* Dedicated interior ambient — doesn't affect the exterior */}
      <ambientLight ref={ambRef} color="#fff6e8" intensity={0} />

      {/* Overhead sunroof — floods entire cabin evenly */}
      <pointLight ref={l1} position={[0,    1.8,  0   ]} color="#fff8f0" intensity={0} distance={22} decay={1} />
      {/* Centre console — between front seats, lights up seat fabric */}
      <pointLight ref={l2} position={[-0.2, 0.35, 0   ]} color="#ffe0a0" intensity={0} distance={10} decay={1} />
      {/* Rear seat fill — illuminates rear seats & footwell */}
      <pointLight ref={l3} position={[1.4,  0.8,  0   ]} color="#fff0cc" intensity={0} distance={10} decay={1} />
      {/* A-pillar / windshield corner — rims the dashboard */}
      <pointLight ref={l4} position={[-1.8, 1.0,  0.5 ]} color="#ffcc66" intensity={0} distance={8}  decay={1} />
      {/* Driver door ambient */}
      <pointLight ref={l5} position={[0,    0.6, -0.9 ]} color="#ffbb55" intensity={0} distance={7}  decay={1} />
      {/* Passenger door ambient */}
      <pointLight ref={l6} position={[0,    0.6,  0.9 ]} color="#ffbb55" intensity={0} distance={7}  decay={1} />

      {/* Luxury floor glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} visible={false}>
        <ringGeometry args={[0.8, 2.5, 64]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0}
          depthWrite={false} blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

/* ─── Spinning diagnostic box ─────────────────────────────────── */
function DiagBox({ hide }: { hide: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 1.2;
      ref.current.rotation.x = clock.getElapsedTime() * 0.4;
    }
  });
  if (hide) return null;
  return (
    <mesh ref={ref} position={[0, 1.5, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshNormalMaterial />
    </mesh>
  );
}

/* ─── Car model ─────────────────────────────────────────────── */
function CarModel({ onReady }: { onReady: () => void }) {
  const groupRef   = useRef<THREE.Group>(null);
  const { scene }  = useGLTF('/car.glb');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const box    = new THREE.Box3().setFromObject(scene);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const s = 5.8 / maxDim;
      scene.scale.setScalar(s);
      scene.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    }

    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      [mesh.material].flat().forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.envMapIntensity = 1.8;
          m.needsUpdate     = true;
        }
      });
    });

    onReady();
  }, [scene, onReady]);

  useFrame(() => {
    if (groupRef.current)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, getAnimState().rotationY, 0.12,
      );
  });

  return <group ref={groupRef}><primitive object={scene} /></group>;
}

/* ─── Camera rig ─────────────────────────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(-1.5, 0.7, 0));
  useFrame(() => {
    const { cameraX, cameraY, cameraZ, targetX, targetY, targetZ } = getAnimState();
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX, 0.12);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY, 0.12);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.12);
    look.current.set(
      THREE.MathUtils.lerp(look.current.x, targetX, 0.12),
      THREE.MathUtils.lerp(look.current.y, targetY, 0.12),
      THREE.MathUtils.lerp(look.current.z, targetZ, 0.12),
    );
    camera.lookAt(look.current);

    /* Widen FOV when camera is inside the cabin for a natural interior feel */
    const sp = getAnimState().rotationY / (Math.PI / 2);
    const interiorAlpha = sectionAlpha(sp, 2.45, 3.85);
    const targetFov = 42 + interiorAlpha * 53; // 42° exterior → 95° interior
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
      (camera as THREE.PerspectiveCamera).fov, targetFov, 0.04,
    );
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });
  return null;
}

/* ─── Lights ─────────────────────────────────────────────────── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 12, 6]} intensity={2.5} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-12} shadow-camera-right={12}
        shadow-camera-top={12}   shadow-camera-bottom={-12} />
      <directionalLight position={[-6, 4, -4]} intensity={1.0} color="#6699ff" />
      <directionalLight position={[0, 2, -8]}  intensity={0.7} color="#ff9966" />
      <pointLight position={[0, 5, 0]} intensity={1.5} />
    </>
  );
}

/* ─── Inner scene ────────────────────────────────────────────── */
function Scene({ onLoaded }: { onLoaded: () => void }) {
  const [carReady, setCarReady] = useState(false);
  return (
    <>
      <Lights />
      <Environment preset="city" background={false} />
      <DiagBox hide={carReady} />
      <Suspense fallback={null}>
        <CarModel onReady={() => { setCarReady(true); onLoaded(); }} />
      </Suspense>

      {/* Section-specific visual effects */}
      <AeroStreamlines />
      <SafetyEffect />
      <InteriorLights />

      {/* Transparent shadow ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.35} />
      </mesh>

      <CameraRig />
    </>
  );
}

/* ─── Canvas ─────────────────────────────────────────────────── */
export default function CarScene({ onLoaded }: { onLoaded: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: 1, overflow: 'hidden',
    }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [2.5, 1.3, 6.0], fov: 42, near: 0.1, far: 200 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        onCreated={({ gl, scene: s }) => {
          gl.toneMapping         = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace    = THREE.SRGBColorSpace;
          gl.shadowMap.enabled   = true;
          gl.shadowMap.type      = THREE.PCFShadowMap;
          s.background           = new THREE.Color('#090909');
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
          gl.domElement.addEventListener('webglcontextrestored', () =>
            gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight, false));
        }}
      >
        <Scene onLoaded={onLoaded} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/car.glb');
