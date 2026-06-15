'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { getAnimState } from '@/hooks/useScrollAnimation';

/* ─── Spinning diagnostic box ─────────────────────────────────
   Visible immediately — if you see this spinning cube, R3F works.
   It disappears once the car model loads.                        */
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
      <meshNormalMaterial />   {/* rainbow normals — unmistakably visible */}
    </mesh>
  );
}

/* ─── Car model ────────────────────────────────────────────── */
function CarModel({ onReady }: { onReady: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/car.glb');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Scale so the longest axis fills ~5.8 world-units — visually large in the gap
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
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
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      [mesh.material].flat().forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.envMapIntensity = 1.8;
          m.needsUpdate = true;
        }
      });
    });

    onReady();
  }, [scene, onReady]);

  useFrame(() => {
    if (groupRef.current)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, getAnimState().rotationY, 0.055
      );
  });

  return <group ref={groupRef}><primitive object={scene} /></group>;
}

/* ─── Camera rig ────────────────────────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(-1.5, 0.7, 0));
  useFrame(() => {
    const { cameraX, cameraY, cameraZ, targetX, targetY, targetZ } = getAnimState();
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.04);
    look.current.set(
      THREE.MathUtils.lerp(look.current.x, targetX, 0.04),
      THREE.MathUtils.lerp(look.current.y, targetY, 0.04),
      THREE.MathUtils.lerp(look.current.z, targetZ, 0.04),
    );
    camera.lookAt(look.current);
  });
  return null;
}

/* ─── Lights ────────────────────────────────────────────────── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 12, 6]} intensity={2.5} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-12} shadow-camera-right={12}
        shadow-camera-top={12}  shadow-camera-bottom={-12} />
      <directionalLight position={[-6, 4, -4]} intensity={1.0} color="#6699ff" />
      <directionalLight position={[0, 2, -8]}  intensity={0.7} color="#ff9966" />
      <pointLight position={[0, 5, 0]} intensity={1.5} />
    </>
  );
}

/* ─── Inner scene ───────────────────────────────────────────── */
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

      {/* Transparent ground — only the shadow is visible, no background rect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.35} />
      </mesh>

      <CameraRig />
    </>
  );
}

/* ─── Canvas ────────────────────────────────────────────────── */
export default function CarScene({ onLoaded }: { onLoaded: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: 1,           /* above body bg, below UI content (z:2) */
      overflow: 'hidden',
    }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [2.5, 1.3, 6.0], fov: 42, near: 0.1, far: 200 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        onCreated={({ gl, scene: s }) => {
          /* All renderer config here — safe across R3F versions */
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;

              s.background = new THREE.Color('#090909');

          /* Context-loss recovery */
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight, false);
          });
        }}
      >
        <Scene onLoaded={onLoaded} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/car.glb');
