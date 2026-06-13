import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface MainShirtProps {
  modelType: "shirt" | "tshirt";
  color: string;
  roughness: number;
  patternTex: any;
  trouserColor: string;
}

const MainShirt = ({
  modelType,
  color,
  roughness,
  patternTex,
  trouserColor,
}: MainShirtProps) => {
  const { scene } = useGLTF("/models/shirt.glb");
  const { scene: tShirtScene } = useGLTF("/models/t_shirt.glb");
  const { scene: trouserScene } = useGLTF("/models/trousers.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const clonedTShirtScene = useMemo(() => tShirtScene.clone(), [tShirtScene]);
  const clonedTrouserScene = useMemo(
    () => trouserScene.clone(),
    [trouserScene],
  );

  const activeScene = modelType === "tshirt" ? clonedTShirtScene : clonedScene;
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const trouserMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  useEffect(() => {
    if (!activeScene) return;

    if (modelType === "tshirt") {
      patternTex.repeat.set(4 / 500, 3 / 500);
    } else {
      patternTex.repeat.set(4, 3);
    }
    patternTex.needsUpdate = true;

    const material = new THREE.MeshPhysicalMaterial({
      map: patternTex,
      side: THREE.DoubleSide,
      roughness: roughness,
      sheenColor: new THREE.Color(color),
    });
    materialRef.current = material;

    activeScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return () => {
      material.dispose();
    };
  }, [activeScene, patternTex, color, roughness, modelType]);

  useEffect(() => {
    if (!clonedTrouserScene) return;

    const material = new THREE.MeshPhysicalMaterial({
      map: null,
      side: THREE.DoubleSide,
      roughness: roughness,
      color: new THREE.Color(trouserColor),
    });
    trouserMaterialRef.current = material;

    clonedTrouserScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return () => {
      material.dispose();
    };
  }, [clonedTrouserScene, trouserColor]);

  return (
    <>
      <color attach="background" args={["#0d0c10"]} />
      <OrbitControls enablePan={false} enableZoom={false} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={4} />

      <group position={[0, 1, 0]} scale={0.9}>
        <primitive
          object={activeScene}
          scale={4}
          rotation-x={modelType === "tshirt" ? 0.2 : 0}
          rotation-y={modelType === "tshirt" ? 0.3 : 0}
          position={modelType === "tshirt" ? [0.1, -5, -0.4] : [0, -5, 0]}
        />
        <primitive
          object={clonedTrouserScene}
          scale={3.4}
          position={[0, -4.6, 0.13]}
        />
      </group>
    </>
  );
};

export default MainShirt;
