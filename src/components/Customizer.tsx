import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { PATTERNS, COLORS, FABRICS, SIZES, STYLES } from "../constants/data";
import {
  buildWeaveNormalCanvas,
  buildWeaveRoughCanvas,
  paintPattern,
} from "../utils/functions";

// ========== Geometry Builder Functions (unchanged) ==========
function makeGridGeometry(rows, cols, mapFn) {
  const verts = [],
    normals = [],
    uvs = [],
    indices = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const u = i / cols,
        v = j / rows;
      const { x, y, z } = mapFn(u, v);
      verts.push(x, y, z);
      normals.push(0, 0, 1);
      uvs.push(u, v);
    }
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      const b = a + 1;
      const c = a + (cols + 1);
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function drape(u, v, amp = 0.025, freq = 2.5) {
  return (
    Math.sin(u * Math.PI * freq) * Math.cos(v * Math.PI * freq * 0.7) * amp +
    Math.sin(v * Math.PI * 3.1) * 0.012 +
    Math.cos((u - 0.5) * Math.PI * 4) * 0.008 * (1 - v)
  );
}

function sleeveDrape(u, v, dir) {
  return Math.sin(v * Math.PI) * 0.018 * dir + Math.cos(u * Math.PI * 3) * 0.01;
}

function buildTShirt() {
  const R = 28,
    C = 40;
  const bodyGeo = makeGridGeometry(R, C, (u, v) => {
    const x = (u - 0.5) * 2.1;
    const waistPinch = 1 - 0.12 * Math.sin(v * Math.PI);
    const xc = x * waistPinch;
    const y = (0.5 - v) * 2.7;
    const shoulderSlope =
      v < 0.18 ? ((0.5 - Math.abs(u - 0.5)) * 0.3 * (0.18 - v)) / 0.18 : 0;
    const z = drape(u, v) + shoulderSlope * 0.15;
    const chestBulge =
      Math.exp(-((u - 0.5) ** 2 * 8 + (v - 0.32) ** 2 * 6)) * 0.06;
    return { x: xc, y: y + shoulderSlope * 0.4, z: z + chestBulge };
  });
  const backGeo = makeGridGeometry(R, C, (u, v) => {
    const x = (0.5 - u) * 2.1;
    const waistPinch = 1 - 0.1 * Math.sin(v * Math.PI);
    const y = (0.5 - v) * 2.7;
    const z = -drape(u, v) - 0.12;
    return { x: x * waistPinch, y, z };
  });
  const lSleeveGeo = makeGridGeometry(20, 28, (u, v) => {
    const angle = (u - 0.5) * Math.PI * 0.65;
    const len = v;
    const baseX = -1.05 - len * 0.55;
    const baseY = 0.92 - len * 0.3 + sleeveDrape(u, v, -1) * 0.4;
    const r = (0.38 - len * 0.06) * (1 + Math.sin(u * Math.PI) * 0.08);
    return {
      x: baseX + Math.sin(angle) * r * 0.55,
      y: baseY + Math.cos(angle) * r,
      z: drape(u, v, 0.02, 3) + Math.sin(angle) * r * 0.3,
    };
  });
  const rSleeveGeo = makeGridGeometry(20, 28, (u, v) => {
    const angle = (u - 0.5) * Math.PI * 0.65;
    const len = v;
    const baseX = 1.05 + len * 0.55;
    const baseY = 0.92 - len * 0.3 + sleeveDrape(u, v, 1) * 0.4;
    const r = (0.38 - len * 0.06) * (1 + Math.sin(u * Math.PI) * 0.08);
    return {
      x: baseX + Math.sin(angle) * r * 0.55,
      y: baseY + Math.cos(angle) * r,
      z: drape(u, v, 0.02, 3) + Math.sin(angle) * r * 0.3,
    };
  });
  const collarGeo = makeGridGeometry(8, 32, (u, v) => {
    const a = u * Math.PI * 2;
    const rx = 0.28 + Math.cos(a) * 0.28;
    const ry = 0.14 + Math.sin(a) * 0.08;
    const cz = Math.cos(a) * 0.05;
    return { x: Math.cos(a) * rx, y: 1.36 + Math.sin(a) * ry * 0.5, z: cz };
  });
  return [bodyGeo, backGeo, lSleeveGeo, rSleeveGeo, collarGeo];
}

function buildHoodie() {
  const bodyGeo = makeGridGeometry(30, 42, (u, v) => {
    const x = (u - 0.5) * 2.3;
    const waistPinch = 1 - 0.08 * Math.sin(v * Math.PI);
    const y = (0.5 - v) * 2.9;
    const chestBulge =
      Math.exp(-((u - 0.5) ** 2 * 6 + (v - 0.3) ** 2 * 5)) * 0.07;
    const z = drape(u, v, 0.03, 2) + chestBulge;
    return { x: x * waistPinch, y, z };
  });
  const backGeo = makeGridGeometry(30, 42, (u, v) => {
    const x = (0.5 - u) * 2.3;
    return {
      x: x * (1 - 0.08 * Math.sin(v * Math.PI)),
      y: (0.5 - v) * 2.9,
      z: -drape(u, v) - 0.13,
    };
  });
  const lSleeveGeo = makeGridGeometry(22, 30, (u, v) => {
    const angle = (u - 0.5) * Math.PI * 0.7;
    const len = v;
    const r = (0.42 - len * 0.07) * (1 + Math.sin(u * Math.PI) * 0.07);
    return {
      x: -1.15 - len * 0.62 + Math.sin(angle) * r * 0.5,
      y: 0.95 - len * 0.35 + sleeveDrape(u, v, -1) * 0.5 + Math.cos(angle) * r,
      z: drape(u, v, 0.025, 3) + Math.sin(angle) * r * 0.3,
    };
  });
  const rSleeveGeo = makeGridGeometry(22, 30, (u, v) => {
    const angle = (u - 0.5) * Math.PI * 0.7;
    const len = v;
    const r = (0.42 - len * 0.07) * (1 + Math.sin(u * Math.PI) * 0.07);
    return {
      x: 1.15 + len * 0.62 + Math.sin(angle) * r * 0.5,
      y: 0.95 - len * 0.35 + sleeveDrape(u, v, 1) * 0.5 + Math.cos(angle) * r,
      z: drape(u, v, 0.025, 3) + Math.sin(angle) * r * 0.3,
    };
  });
  const hoodGeo = makeGridGeometry(20, 32, (u, v) => {
    const a = u * Math.PI;
    const phi = v * Math.PI * 0.72;
    const rx = 0.38,
      ry = 0.5,
      rz = 0.42;
    return {
      x: Math.sin(phi) * Math.cos(a) * rx,
      y: 1.42 + Math.cos(phi) * ry - 0.1,
      z: Math.sin(phi) * Math.sin(a) * rz - 0.1,
    };
  });
  return [bodyGeo, backGeo, lSleeveGeo, rSleeveGeo, hoodGeo];
}

function buildJacket() {
  const bodyGeo = makeGridGeometry(32, 44, (u, v) => {
    const x = (u - 0.5) * 2.4;
    const waistPinch = 1 - 0.07 * Math.sin(v * Math.PI);
    const shoulderRaise = v < 0.15 ? 0.08 * (1 - v / 0.15) : 0;
    const y = (0.5 - v) * 3.1 + shoulderRaise;
    const chestBulge =
      Math.exp(-((u - 0.5) ** 2 * 5 + (v - 0.28) ** 2 * 4)) * 0.08;
    const z = drape(u, v, 0.02, 2) + chestBulge;
    return { x: x * waistPinch, y, z };
  });
  const backGeo = makeGridGeometry(32, 44, (u, v) => ({
    x: (0.5 - u) * 2.4 * (1 - 0.06 * Math.sin(v * Math.PI)),
    y: (0.5 - v) * 3.1,
    z: -drape(u, v, 0.018, 2) - 0.14,
  }));
  const lSleeveGeo = makeGridGeometry(24, 32, (u, v) => {
    const angle = (u - 0.5) * Math.PI * 0.68;
    const len = v;
    const r = (0.44 - len * 0.08) * (1 + Math.sin(u * Math.PI) * 0.05);
    return {
      x: -1.2 - len * 0.7 + Math.sin(angle) * r * 0.45,
      y: 1.0 - len * 0.4 + Math.cos(angle) * r,
      z: drape(u, v, 0.018, 3) + Math.sin(angle) * r * 0.28,
    };
  });
  const rSleeveGeo = makeGridGeometry(24, 32, (u, v) => {
    const angle = (u - 0.5) * Math.PI * 0.68;
    const len = v;
    const r = (0.44 - len * 0.08) * (1 + Math.sin(u * Math.PI) * 0.05);
    return {
      x: 1.2 + len * 0.7 + Math.sin(angle) * r * 0.45,
      y: 1.0 - len * 0.4 + Math.cos(angle) * r,
      z: drape(u, v, 0.018, 3) + Math.sin(angle) * r * 0.28,
    };
  });
  const lapelGeo = makeGridGeometry(10, 12, (u, v) => {
    const side = u < 0.5 ? -1 : 1;
    const lu = Math.abs(u - 0.5) * 2;
    const x = side * (0.05 + lu * 0.35);
    const y = 1.25 - v * 0.85;
    const z = 0.09 + (1 - lu) * 0.04 + Math.sin(v * Math.PI) * 0.03;
    return { x, y, z };
  });
  return [bodyGeo, backGeo, lSleeveGeo, rSleeveGeo, lapelGeo];
}

function buildGarmentMeshes(style, material) {
  const geos =
    style === "hoodie"
      ? buildHoodie()
      : style === "jacket"
        ? buildJacket()
        : buildTShirt();
  return geos.map((geo) => new THREE.Mesh(geo, material));
}

// ========== 3D Scene Component ==========
function GarmentScene({
  style,
  fabricId,
  baseColorHex,
  accentColorHex,
  patternId,
  patScale,
  patAngle,
  patOpacity,
  autoRotate,
}) {
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  const [patternTex, setPatternTex] = useState(null);
  const [normalTex, setNormalTex] = useState(null);
  const [roughTex, setRoughTex] = useState(null);

  // Create material once
  useEffect(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      roughness: 0.88,
      metalness: 0,
      sheen: 0.3,
      sheenRoughness: 0.8,
      clearcoat: 0,
    });
    materialRef.current = mat;
    return () => mat.dispose();
  }, []);

  // Generate pattern texture (diffuse map)
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    if (!patternId || patternId === "none") {
      ctx.fillStyle = baseColorHex;
      ctx.fillRect(0, 0, 1024, 1024);
    } else {
      paintPattern(
        ctx,
        1024,
        patternId,
        baseColorHex,
        accentColorHex,
        patScale,
        patAngle,
        patOpacity / 100,
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 3);
    setPatternTex(texture);

    return () => texture.dispose();
  }, [patternId, baseColorHex, accentColorHex, patScale, patAngle, patOpacity]);

  // Generate fabric normal & roughness maps
  useEffect(() => {
    const fabric = FABRICS.find((f) => f.id === fabricId);
    if (!fabric) return;

    const tile = fabric.weaveTile ?? 4;
    const weaveStyle =
      fabric.id === "denim" || fabric.id === "herringbone" ? "twill" : "plain";

    const normalCanvas = buildWeaveNormalCanvas(tile, weaveStyle);
    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(18, 18);
    setNormalTex(normalTexture);

    const roughCanvas = buildWeaveRoughCanvas(tile);
    const roughTexture = new THREE.CanvasTexture(roughCanvas);
    roughTexture.wrapS = THREE.RepeatWrapping;
    roughTexture.wrapT = THREE.RepeatWrapping;
    roughTexture.repeat.set(18, 18);
    setRoughTex(roughTexture);

    return () => {
      normalTexture.dispose();
      roughTexture.dispose();
    };
  }, [fabricId]);

  // Update material properties when textures or fabric changes
  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;

    if (patternTex) mat.map = patternTex;
    if (normalTex) mat.normalMap = normalTex;
    if (roughTex) mat.roughnessMap = roughTex;

    const fabric = FABRICS.find((f) => f.id === fabricId);
    if (fabric) {
      mat.roughness = fabric.roughness;
      mat.metalness = fabric.metalness;
      mat.sheen = fabric.sheen;
      mat.sheenRoughness = fabric.sheenRough;
      mat.clearcoat = fabric.clearcoat;
      const scale =
        fabric.id === "denim"
          ? 1.4
          : fabric.id === "wool"
            ? 1.1
            : fabric.id === "silk"
              ? 0.18
              : 0.55;
      mat.normalScale.set(scale, scale);
    }
    mat.sheenColor.set(baseColorHex);
    mat.needsUpdate = true;
  }, [patternTex, normalTex, roughTex, fabricId, baseColorHex]);

  // Rebuild garment mesh group when style changes
  useEffect(() => {
    if (!materialRef.current) return;

    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        if (child.geometry) child.geometry.dispose();
      });
    }

    const grp = new THREE.Group();
    const meshes = buildGarmentMeshes(style, materialRef.current);
    meshes.forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      grp.add(mesh);
    });

    const box = new THREE.Box3().setFromObject(grp);
    const centerY = (box.max.y + box.min.y) / 2;
    grp.position.y = -centerY;

    if (groupRef.current) {
      groupRef.current.children.forEach((child) => grp.add(child));
      groupRef.current.parent?.remove(groupRef.current);
    }
    groupRef.current = grp;
  }, [style, materialRef.current]);

  return (
    <>
      {groupRef.current && <primitive object={groupRef.current} />}

      {/* Lighting */}
      <ambientLight intensity={0.55} color="#fff4e8" />
      <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
      <directionalLight position={[-4, 1, 3]} intensity={1.0} color="#d8e8ff" />
      <directionalLight
        position={[0, -3, -4]}
        intensity={0.6}
        color="#ffe8cc"
      />
      <directionalLight position={[0, 8, -2]} intensity={0.3} />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        enableZoom={false}
        enablePan={false}
        rotateSpeed={1}
      />
    </>
  );
}

// ========== UI Components ==========
const GOLD = "#c9a96e";

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "9px 0",
        fontSize: 10,
        fontWeight: 500,
        background: active ? "rgba(201,169,110,0.1)" : "transparent",
        border: "none",
        borderBottom: `2px solid ${active ? GOLD : "transparent"}`,
        color: active ? GOLD : "#6b6575",
        cursor: "pointer",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function Slider({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 11, color: "#6b6575" }}>{label}</span>
        <span style={{ fontSize: 11, color: "#c2bdb4", fontWeight: 500 }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: GOLD }}
      />
    </div>
  );
}

// ========== Main Component ==========
export default function GarmentCustomizer() {
  const [tab, setTab] = useState("base");
  const [gStyle, setGStyle] = useState("tshirt");
  const [colorId, setColorId] = useState("ivory");
  const [accentId, setAccentId] = useState("midnight");
  const [fabricId, setFabricId] = useState("cotton");
  const [size, setSize] = useState("M");
  const [patternId, setPatternId] = useState("none");
  const [patScale, setPatScale] = useState(1.0);
  const [patAngle, setPatAngle] = useState(0);
  const [patOpacity, setPatOpacity] = useState(85);
  const [colorTarget, setColorTarget] = useState("base");
  const [added, setAdded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const selColor = COLORS.find((c) => c.id === colorId);
  const selAccent = COLORS.find((c) => c.id === accentId);
  const selFabric = FABRICS.find((f) => f.id === fabricId);

  const activePickerId = colorTarget === "base" ? colorId : accentId;
  const setActivePicker = colorTarget === "base" ? setColorId : setAccentId;

  return (
    <div
      style={{
        display: "flex",
        height: "680px",
        background: "#0d0c10",
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "'Inter',system-ui,sans-serif",
        color: "#e8e4dc",
      }}
    >
      {/* 3D Viewport */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background:
            "radial-gradient(ellipse at 48% 38%, #1c1826 0%, #0d0c10 72%)",
        }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 5.8], fov: 40 }}
          style={{ width: "100%", height: "100%", cursor: "grab" }}
        >
          <GarmentScene
            style={gStyle}
            fabricId={fabricId}
            baseColorHex={selColor?.hex ?? "#F5F0E8"}
            accentColorHex={selAccent?.hex ?? "#1a1f2e"}
            patternId={patternId}
            patScale={patScale}
            patAngle={patAngle}
            patOpacity={patOpacity}
            autoRotate={autoRotate}
          />
        </Canvas>

        {/* UI Overlays */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: GOLD,
            }}
          />
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 500,
            }}
          >
            Atelier Studio
          </span>
        </div>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 7,
            padding: "4px 9px",
            color: "#8a8590",
            fontSize: 10,
            cursor: "pointer",
          }}
        >
          ⟳ {autoRotate ? "on" : "off"}
        </button>

        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "#3a3642",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          drag to rotate
        </div>

        {patternId !== "none" && (
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              background: "rgba(201,169,110,0.09)",
              border: "0.5px solid rgba(201,169,110,0.22)",
              borderRadius: 7,
              padding: "4px 10px",
              fontSize: 10,
              color: GOLD,
            }}
          >
            {PATTERNS.find((p) => p.id === patternId)?.label}
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div
        style={{
          width: 258,
          background: "#15131b",
          borderLeft: "0.5px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          }}
        >
          <TabBtn active={tab === "base"} onClick={() => setTab("base")}>
            Base
          </TabBtn>
          <TabBtn active={tab === "pattern"} onClick={() => setTab("pattern")}>
            Pattern
          </TabBtn>
          <TabBtn active={tab === "order"} onClick={() => setTab("order")}>
            Order
          </TabBtn>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {tab === "base" && (
            <>
              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Garment
                </label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setGStyle(s.id)}
                      style={{
                        background:
                          gStyle === s.id
                            ? "rgba(201,169,110,0.1)"
                            : "transparent",
                        border: `0.5px solid ${gStyle === s.id ? GOLD : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 8,
                        padding: "8px 12px",
                        color: gStyle === s.id ? GOLD : "#8a8590",
                        fontSize: 12,
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: gStyle === s.id ? 500 : 400,
                        transition: "all 0.2s",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Base Color
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6,1fr)",
                    gap: 6,
                  }}
                >
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorId(c.id)}
                      title={c.label}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: 6,
                        background: c.hex,
                        border:
                          colorId === c.id
                            ? `2px solid ${GOLD}`
                            : "2px solid transparent",
                        cursor: "pointer",
                        transform:
                          colorId === c.id ? "scale(1.12)" : "scale(1)",
                        transition: "transform 0.15s,border 0.15s",
                      }}
                    />
                  ))}
                </div>
              </section>

              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Fabric
                </label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  {FABRICS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFabricId(f.id)}
                      style={{
                        background:
                          fabricId === f.id
                            ? "rgba(201,169,110,0.08)"
                            : "transparent",
                        border: `0.5px solid ${fabricId === f.id ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 7,
                        padding: "7px 11px",
                        display: "flex",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: fabricId === f.id ? GOLD : "#8a8590",
                          fontWeight: fabricId === f.id ? 500 : 400,
                        }}
                      >
                        {f.label}
                      </span>
                      <span style={{ fontSize: 10, color: "#4a4555" }}>
                        {f.roughness > 0.7
                          ? "matte"
                          : f.roughness < 0.3
                            ? "gloss"
                            : "semi"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Size
                </label>
                <div style={{ display: "flex", gap: 5 }}>
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        flex: 1,
                        padding: "7px 0",
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: 500,
                        background:
                          size === s ? "rgba(201,169,110,0.15)" : "transparent",
                        border: `0.5px solid ${size === s ? GOLD : "rgba(255,255,255,0.08)"}`,
                        color: size === s ? GOLD : "#6b6575",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === "pattern" && (
            <>
              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Pattern
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 6,
                  }}
                >
                  {PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPatternId(p.id)}
                      style={{
                        padding: "9px 4px",
                        borderRadius: 8,
                        fontSize: 10,
                        background:
                          patternId === p.id
                            ? "rgba(201,169,110,0.12)"
                            : "rgba(255,255,255,0.02)",
                        border: `0.5px solid ${patternId === p.id ? GOLD : "rgba(255,255,255,0.08)"}`,
                        color: patternId === p.id ? GOLD : "#8a8590",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: patternId === p.id ? 500 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{p.icon}</span>
                      <span style={{ fontSize: 9, letterSpacing: "0.04em" }}>
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Colors
                </label>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {["base", "accent"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setColorTarget(t)}
                      style={{
                        flex: 1,
                        padding: "7px 0",
                        borderRadius: 7,
                        fontSize: 11,
                        background:
                          colorTarget === t
                            ? "rgba(201,169,110,0.12)"
                            : "transparent",
                        border: `0.5px solid ${colorTarget === t ? GOLD : "rgba(255,255,255,0.08)"}`,
                        color: colorTarget === t ? GOLD : "#6b6575",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background:
                            t === "base" ? selColor?.hex : selAccent?.hex,
                          border: "0.5px solid rgba(255,255,255,0.2)",
                        }}
                      />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6,1fr)",
                    gap: 6,
                  }}
                >
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActivePicker(c.id)}
                      title={c.label}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: 6,
                        background: c.hex,
                        border:
                          activePickerId === c.id
                            ? `2px solid ${GOLD}`
                            : "2px solid transparent",
                        cursor: "pointer",
                        transform:
                          activePickerId === c.id ? "scale(1.12)" : "scale(1)",
                        transition: "transform 0.15s,border 0.15s",
                      }}
                    />
                  ))}
                </div>
              </section>

              {patternId !== "none" && (
                <section>
                  <label
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#6b6575",
                      fontWeight: 500,
                      display: "block",
                      marginBottom: 10,
                    }}
                  >
                    Adjust
                  </label>
                  <Slider
                    label="Scale"
                    value={patScale}
                    min={0.3}
                    max={3}
                    step={0.1}
                    onChange={setPatScale}
                  />
                  <Slider
                    label="Angle"
                    value={patAngle}
                    min={0}
                    max={355}
                    step={5}
                    unit="°"
                    onChange={setPatAngle}
                  />
                  <Slider
                    label="Opacity"
                    value={patOpacity}
                    min={10}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={setPatOpacity}
                  />
                </section>
              )}
            </>
          )}

          {tab === "order" && (
            <>
              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Summary
                </label>
                {[
                  ["Style", STYLES.find((s) => s.id === gStyle)?.label],
                  ["Fabric", selFabric?.label],
                  ["Size", size],
                  ["Base Color", selColor?.label],
                  ["Accent", selAccent?.label],
                  ["Pattern", PATTERNS.find((p) => p.id === patternId)?.label],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "9px 0",
                      borderBottom: "0.5px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#6b6575" }}>{k}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#c2bdb4",
                        fontWeight: 500,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </section>
              <section>
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6b6575",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Color Preview
                </label>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 8,
                      background: selColor?.hex,
                      border: "0.5px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 8,
                      background: selAccent?.hex,
                      border: "0.5px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 10,
                      color: "#4a4555",
                      textAlign: "center",
                    }}
                  >
                    Base
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 10,
                      color: "#4a4555",
                      textAlign: "center",
                    }}
                  >
                    Accent
                  </span>
                </div>
              </section>
            </>
          )}
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => {
              setAdded(true);
              setTimeout(() => setAdded(false), 2200);
            }}
            style={{
              width: "100%",
              background: added ? "rgba(201,169,110,0.16)" : GOLD,
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              color: added ? GOLD : "#0d0c10",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "all 0.3s",
            }}
          >
            {added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
