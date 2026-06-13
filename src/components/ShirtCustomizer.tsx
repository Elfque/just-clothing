import { Canvas } from "@react-three/fiber";
import MainShirt from "./MainShirt";
import { useMemo, useState } from "react";
import { COLORS, PATTERNS } from "../constants/data";
import { paintPattern } from "../utils/pattern";
import * as THREE from "three";
import Slider from "./Slider";

const ShirtCustomizer = () => {
  const [modelType, setModelType] = useState<"shirt" | "tshirt">("shirt");
  const [color, setColor] = useState(COLORS[8].hex);
  const [patternColor, setPatternColor] = useState(COLORS[4].hex);
  const [roughness, setRoughness] = useState(0.5);
  const [patternId, setPatternId] = useState("none");
  const [patScale, setPatScale] = useState(1);
  const [patAngle, setPatAngle] = useState(0);
  const [patOpacity, setPatOpacity] = useState(100);
  const [colorTarget, setColorTarget] = useState<"base" | "pattern">("base");
  const [trouserColor, setTrouserColor] = useState(COLORS[0].hex);

  const patternTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!patternId || patternId === "none") {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1024, 1024);
    } else {
      paintPattern(
        ctx,
        1024,
        patternId,
        color,
        patternColor,
        patScale,
        patAngle,
        patOpacity / 100,
      );
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 3);
    return texture;
  }, [patternId, color, patternColor, patScale, patAngle, patOpacity]);

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-4">
      <div className="h-screen bg-[#0d0c10] col-span-3">
        <Canvas>
          <MainShirt
            modelType={modelType}
            color={color}
            roughness={roughness}
            patternTex={patternTex}
            trouserColor={trouserColor}
          />
        </Canvas>
      </div>

      <div className="h-screen p-6 space-y-6 overflow-auto bg-[#15131b] text-[#e8e4dc] border-l border-white/5 shadow-2xl">
        <section>
          <label className="title-label">Model Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setModelType("shirt")}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg cursor-pointer border-2 transition-all duration-150 ${
                modelType === "shirt"
                  ? "border-brand-gold text-brand-gold font-semibold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
              style={{
                background:
                  modelType === "shirt"
                    ? "rgba(201,169,110,0.12)"
                    : "rgba(255,255,255,0.02)",
              }}
            >
              <span className="text-sm">👔</span>
              <span className="text-xs tracking-wider uppercase font-medium">
                Shirt
              </span>
            </button>
            <button
              onClick={() => setModelType("tshirt")}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg cursor-pointer border-2 transition-all duration-150 ${
                modelType === "tshirt"
                  ? "border-brand-gold text-brand-gold font-semibold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
              style={{
                background:
                  modelType === "tshirt"
                    ? "rgba(201,169,110,0.12)"
                    : "rgba(255,255,255,0.02)",
              }}
            >
              <span className="text-sm">👕</span>
              <span className="text-xs tracking-wider uppercase font-medium">
                T-Shirt
              </span>
            </button>
          </div>
        </section>

        <section>
          <Slider
            label="Material Roughness"
            value={roughness}
            min={0}
            max={1}
            step={0.01}
            onChange={setRoughness}
          />
        </section>

        <section>
          <label className="title-label">Pattern</label>
          <div className="grid grid-cols-4 gap-2">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPatternId(p.id)}
                className={`flex flex-col items-center gap-4 rounded-md cursor-pointer p-2 border-2 transition-all duration-150 ${patternId === p.id ? "border-brand-gold text-brand-gold font-bold" : "border-transparent text-gray-400 font-normal"}`}
                style={{
                  background:
                    patternId === p.id
                      ? "rgba(201,169,110,0.12)"
                      : "rgba(255,255,255,0.02)",
                }}
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-[10px] tracking-0.04em">{p.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex gap-6 mb-6">
          {["base", "pattern"].map((t: "base" | "pattern") => (
            <button
              key={t}
              onClick={() => setColorTarget(t)}
              className={`flex-1 p-2 gap-1.5 items-center justify-center flex rounded-md cursor-pointer outline-0 ${colorTarget === t ? "border-brand-gold text-brand-gold font-bold" : "font-normal border-transparent text-gray-400"} border-2`}
              style={{
                background:
                  colorTarget === t ? "rgba(201,169,110,0.12)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: t === "base" ? color : patternColor,
                  border: "0.5px solid rgba(255,255,255,0.2)",
                }}
              />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                colorTarget === "base"
                  ? setColor(c.hex)
                  : setPatternColor(c.hex)
              }
              title={c.label}
              className={`w-full rounded-md cursor-pointer outline-0 ${color === c.hex ? "border-brand-gold" : "border-transparent"} border-2`}
              style={{
                aspectRatio: "1",
                background: c.hex,
                transform: color === c.id ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.15s,border 0.15s",
              }}
            />
          ))}
        </div>

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

        <section>
          <label className="title-label">Trouser Color</label>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setTrouserColor(c.hex)}
                title={c.label}
                className={`w-full rounded-md cursor-pointer outline-0 ${trouserColor === c.hex ? "border-brand-gold" : "border-transparent"} border-2`}
                style={{
                  aspectRatio: "1",
                  background: c.hex,
                  transform:
                    trouserColor === c.hex ? "scale(1.12)" : "scale(1)",
                  transition: "transform 0.15s,border 0.15s",
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShirtCustomizer;
