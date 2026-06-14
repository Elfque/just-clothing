//Male base by Артур Мигранов [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/eWGDnQ0jzmH)

import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface MainShirtProps {
  modelType: string;
  color: string;
  roughness: number;
  patternTex: any;
  trouserColor: string;
  bottomType: string;
  patternTexture: any;
  patternNormalMap: any;
}

const MainShirt = ({
  modelType,
  color,
  roughness,
  patternTex,
  trouserColor,
  bottomType,
  patternNormalMap,
  patternTexture,
}: MainShirtProps) => {
  const { scene } = useGLTF("/models/shirt.glb");
  const { scene: tShirtScene } = useGLTF("/models/t-shirt.glb");
  const { scene: trouserScene } = useGLTF("/models/trouser.glb");
  const { scene: shortScene } = useGLTF("/models/short.glb");

  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const clonedTShirtScene = useMemo(() => tShirtScene.clone(), [tShirtScene]);
  const clonedTrouserScene = useMemo(
    () => trouserScene.clone(),
    [trouserScene],
  );
  const clonedShortScene = useMemo(() => shortScene.clone(), [shortScene]);

  const activeScene = modelType === "tshirt" ? clonedTShirtScene : clonedScene;
  const activeBottom =
    bottomType === "short" ? clonedShortScene : clonedTrouserScene;

  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const trouserMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  useEffect(() => {
    if (!activeScene) return;

    if (patternTex) {
      patternTex.repeat.set(4, 3);
      patternTex.needsUpdate = true;
    }

    const material = new THREE.MeshPhysicalMaterial({
      map: patternTexture || patternTex || null,
      normalMap: patternNormalMap,
      side: THREE.DoubleSide,
      roughness: roughness,
      color: new THREE.Color(color),
    });
    materialRef.current = material;

    let meshCount = 0;
    activeScene.traverse((child: any) => {
      if (child.isMesh) {
        meshCount += 1;

        child.frustumCulled = false;
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return () => {
      material.dispose();
    };
  }, [activeScene, patternTex, color, roughness, modelType, patternTexture]);

  useEffect(() => {
    if (!activeBottom) return;

    const material = new THREE.MeshPhysicalMaterial({
      map: null,
      side: THREE.DoubleSide,
      roughness: roughness,
      color: new THREE.Color(trouserColor),
    });
    trouserMaterialRef.current = material;

    activeBottom.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return () => {
      material.dispose();
    };
  }, [activeBottom, trouserColor]);

  return (
    <>
      <color attach="background" args={["#0d0c10"]} />
      <OrbitControls enablePan={false} enableZoom={true} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={4} />

      <group position={[0, 1, 0]} scale={0.9}>
        <primitive
          object={activeScene}
          scale={4.5}
          position={modelType === "tshirt" ? [0.1, 0.7, 0] : [0.1, 0.8, 0]}
        />

        <primitive
          object={activeBottom}
          scale={bottomType === "short" ? 0.06 : 4.5}
          position={
            bottomType === "short" ? [0.1, -1.9, 0.13] : [0.1, -6.2, 0.13]
          }
        />
      </group>
    </>
  );
};

export default MainShirt;

useGLTF.preload("/models/shirt.glb");
useGLTF.preload("/models/t_shirt.glb");
useGLTF.preload("/models/trousers.glb");
