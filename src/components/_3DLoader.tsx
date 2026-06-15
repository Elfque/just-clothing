import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const LoaderModel = ({ progress }: { progress: number }) => {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const lightRef = useRef<THREE.Light | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
      // Emissive intensity grows with progress
      if (meshRef.current.material) {
        const intensity = 0.4 + (progress / 100) * 0.8;
        (
          meshRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = intensity;
      }
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.rotation.x = Math.sin(t * 0.7) * 0.2;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.8 + Math.sin(t * 3) * 0.3;
    }
  });

  return (
    <group>
      {/* Central glowing knot */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <torusKnotGeometry args={[1.2, 0.32, 200, 32, 3, 4]} />
        <meshStandardMaterial
          color="#3a86ff"
          emissive="#1a44aa"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Accent ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.45, 0.05, 128, 200]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#0066aa"
          emissiveIntensity={0.6}
          metalness={0.9}
        />
      </mesh>

      {/* Floating particles (sparkles) */}
      <Sparkles
        count={400}
        scale={[3, 3, 3]}
        size={0.08}
        speed={0.4}
        color="#88aaff"
      />

      {/* Moving colored light */}
      <pointLight
        ref={lightRef}
        position={[2, 1, 2]}
        color="#ff66cc"
        intensity={0.8}
      />
      <pointLight position={[-1.5, 1.2, -2]} color="#44aaff" intensity={0.6} />
    </group>
  );
};

const _3DLoader = () => {
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    let interval;
    let progress = 0;
    interval = setInterval(() => {
      progress += Math.random() * 8 + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setLoadProgress(progress);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate={false}
        enableZoom
        enablePan={false}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 3]} intensity={1.2} castShadow />
      <pointLight position={[-2, 1, 3]} intensity={0.6} color="#ffaa66" />
      <Environment preset="night" background={false} />
      <LoaderModel progress={loadProgress} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
    </>
  );
};

export default _3DLoader;
