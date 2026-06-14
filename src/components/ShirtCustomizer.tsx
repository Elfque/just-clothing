import { Canvas } from "@react-three/fiber";
import MainShirt from "./MainShirt";
import { Suspense, useMemo, useRef, useState } from "react";
import { COLORS, PATTERNS } from "../constants/data";
import { generateNormalMapFromTexture, paintPattern } from "../utils/pattern";
import * as THREE from "three";
import Slider from "./Slider";
import CaptureHelper from "./CaptureHelper";
import { bottoms, tops } from "../constants/clothes";
import { MdOutlineFileUpload } from "react-icons/md";

const types = ["base", "pattern", "trouser"];

const ShirtCustomizer = () => {
  const [captureFn, setCaptureFn] = useState<null | (() => any)>(null);
  const [modelType, setModelType] = useState<string>("shirt");
  const [bottomType, setBottomType] = useState<string>("trouser");
  const [color, setColor] = useState(COLORS[8].hex);
  const [patternColor, setPatternColor] = useState(COLORS[4].hex);
  const [roughness, setRoughness] = useState(0.5);
  const [patternId, setPatternId] = useState("none");
  const [patScale, setPatScale] = useState(1);
  const [patAngle, setPatAngle] = useState(0);
  const [patOpacity, setPatOpacity] = useState(100);
  const [colorTarget, setColorTarget] = useState<string>("base");
  const [trouserColor, setTrouserColor] = useState(COLORS[0].hex);

  const [patternTexture, setPatternTexture] = useState(null);
  const [patternNormalMap, setPatternNormalMap] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const patternTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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

  const handleSaveScreenshot = () => {
    if (!captureFn) return;
    const dataURL: any = captureFn();
    const link = document.createElement("a");
    link.download = `custom-garment-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        setPatternTexture(texture);
        setColor("#FFFFFF");
        setUploadedImageUrl(e.target.result);
        generateNormalMapFromTexture(texture, 1.5, (normalTex) => {
          setPatternNormalMap(normalTex);
        });
      };
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-[1fr_25rem]">
      <div className="h-screen relative">
        <Canvas>
          <CaptureHelper onCaptureReady={(fn: any) => setCaptureFn(() => fn)} />
          <Suspense>
            <MainShirt
              modelType={modelType}
              color={color}
              roughness={roughness}
              patternTex={patternTex}
              trouserColor={trouserColor}
              bottomType={bottomType}
              patternTexture={patternTexture}
              patternNormalMap={patternNormalMap}
            />
          </Suspense>
        </Canvas>

        <button
          className="absolute bottom-4 right-4 z-30 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          onClick={handleSaveScreenshot}
        >
          Take Screenshot
        </button>
      </div>

      <div className="h-screen p-6 space-y-6 overflow-auto bg-[#15131b] text-[#e8e4dc] border-l border-white/5 shadow-2xl">
        <section>
          <label className="title-label">Model Type</label>
          <div className="grid grid-cols-2 gap-2">
            {tops.map((item) => (
              <button
                onClick={() => setModelType(item.value)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg cursor-pointer border-2 transition-all duration-150 ${
                  modelType === item.value
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
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs tracking-wider uppercase font-medium">
                  {item.name}
                </span>
              </button>
            ))}

            {bottoms.map((b) => (
              <button
                key={b.value}
                onClick={() => setBottomType(b.value)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg cursor-pointer border-2 transition-all duration-150 ${
                  bottomType === b.value
                    ? "border-brand-gold text-brand-gold font-semibold"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
                style={{
                  background:
                    modelType === b.value
                      ? "rgba(201,169,110,0.12)"
                      : "rgba(255,255,255,0.02)",
                }}
              >
                <span className="text-sm">{b.icon}</span>
                <span className="text-xs tracking-wider uppercase font-medium">
                  {b.name}
                </span>
              </button>
            ))}
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
                onClick={() => {
                  setPatternNormalMap(null);
                  setPatternTexture(null);
                  setUploadedImageUrl(null);
                  setPatternId(p.id);
                }}
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

          <div className="rounded-xl border-2 border-gray-500 flex gap-4 items-center h-36 relative border-dashed overflow-hidden mt-6">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="cursor-pointer absolute w-full h-full z-30 opacity-0"
            />
            <div className="flex justify-center items-center p-4 relative z-20 w-full h-full text-center bg-black/40">
              <div>
                <div className="flex justify-center mb-2">
                  <MdOutlineFileUpload className="text-gray-300 text-2xl" />
                </div>
                <div className="text-xs text-gray-300">
                  Upload a pattern for your outfit
                </div>
              </div>
            </div>
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="pattern preview"
                className="object-cover absolute w-full h-full"
              />
            )}
          </div>
        </section>

        <div className="flex gap-6 mb-6">
          {types.map((t: string) => (
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
                  background:
                    t === "base"
                      ? color
                      : t === "pattern"
                        ? patternColor
                        : trouserColor,
                  border: "0.5px solid rgba(255,255,255,0.2)",
                }}
              />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => {
            const currSet =
              colorTarget === "base"
                ? setColor
                : colorTarget === "pattern"
                  ? setPatternColor
                  : setTrouserColor;
            const currentColor =
              colorTarget === "base"
                ? color
                : colorTarget === "pattern"
                  ? patternColor
                  : trouserColor;
            return (
              <button
                key={c.id}
                onClick={() => currSet(c.hex)}
                title={c.label}
                className={`w-full rounded-md cursor-pointer outline-0 ${currentColor === c.hex ? "border-brand-gold" : "border-transparent"} border-2`}
                style={{
                  aspectRatio: "1",
                  background: c.hex,
                  transform:
                    currentColor === c.hex ? "scale(1.12)" : "scale(1)",
                  transition: "transform 0.15s,border 0.15s",
                }}
              />
            );
          })}
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
      </div>
    </div>
  );
};

export default ShirtCustomizer;
