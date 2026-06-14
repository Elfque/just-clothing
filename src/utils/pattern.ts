import * as THREE from "three";

// Helper: shift color (lighten/darken)
function shiftColor(hex: string, percent: number) {
  // Simple implementation: lighten/darken by percent (negative for darker)
  const c = parseInt(hex.slice(1), 16);
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;
  const newR = Math.min(255, Math.max(0, r + (r * percent) / 100));
  const newG = Math.min(255, Math.max(0, g + (g * percent) / 100));
  const newB = Math.min(255, Math.max(0, b + (b * percent) / 100));
  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, "0")}`;
}

export function paintPattern(
  ctx: CanvasRenderingContext2D,
  sz: number,
  pid: string,
  base: string,
  accent: string,
  scale: number,
  angle: number,
  opacity: number,
) {
  ctx.clearRect(0, 0, sz, sz);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, sz, sz);
  if (pid === "none") return;

  ctx.save();
  ctx.globalAlpha = opacity;

  // For patterns that benefit from a subtle gradient background
  const hasGradient =
    pid === "paisley" || pid === "damask" || pid === "moroccan";
  if (hasGradient) {
    const grad = ctx.createLinearGradient(0, 0, sz, sz);
    grad.addColorStop(0, base);
    grad.addColorStop(1, shiftColor(base, -8));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, sz, sz);
  }

  const unit = sz / (12 * scale); // slightly smaller unit for more detail
  ctx.translate(sz / 2, sz / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-sz, -sz);
  const D = sz * 2.6;
  ctx.fillStyle = accent;
  ctx.strokeStyle = accent;
  ctx.lineWidth = unit * 0.1;

  // ---- BEAUTIFUL PATTERNS ----

  if (pid === "paisley") {
    // Elegant paisley motif with teardrops and swirls
    const step = unit * 1.8;
    for (let x = -D; x < D * 2; x += step) {
      for (let y = -D; y < D * 2; y += step) {
        const cx = x + step / 2;
        const cy = y + step / 2;
        // Main teardrop
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          step * 0.35,
          step * 0.6,
          Math.PI / 4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        // Tail swirl
        ctx.beginPath();
        ctx.ellipse(
          cx - step * 0.2,
          cy + step * 0.2,
          step * 0.2,
          step * 0.35,
          -Math.PI / 5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = shiftColor(accent, -15);
        ctx.beginPath();
        ctx.ellipse(
          cx + step * 0.05,
          cy - step * 0.05,
          step * 0.12,
          step * 0.2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = accent;
        // Dot accent
        ctx.beginPath();
        ctx.arc(
          cx - step * 0.28,
          cy + step * 0.33,
          step * 0.06,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = shiftColor(base, 15);
        ctx.fill();
        ctx.fillStyle = accent;
      }
    }
  } else if (pid === "damask") {
    // Ornate damask / arabesque pattern
    const step = unit * 2.2;
    for (let x = -D; x < D * 2; x += step) {
      for (let y = -D; y < D * 2; y += step) {
        const cx = x + step / 2;
        const cy = y + step / 2;
        // Central flower
        for (let i = 0; i < 8; i++) {
          const angleRad = (i / 8) * Math.PI * 2;
          const px = cx + Math.cos(angleRad) * step * 0.32;
          const py = cy + Math.sin(angleRad) * step * 0.32;
          ctx.beginPath();
          ctx.ellipse(
            px,
            py,
            step * 0.12,
            step * 0.22,
            angleRad,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, step * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = shiftColor(accent, 20);
        ctx.fill();
        ctx.fillStyle = accent;
        // Corner swirls
        const corners = [
          [-0.45, -0.45],
          [0.45, -0.45],
          [-0.45, 0.45],
          [0.45, 0.45],
        ];
        corners.forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.ellipse(
            cx + dx * step,
            cy + dy * step,
            step * 0.15,
            step * 0.25,
            Math.PI / 4,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });
      }
    }
  } else if (pid === "tartan" || pid === "plaid") {
    // Classic tartan with overlapping stripes of varying widths
    const stripeWidths = [unit * 0.5, unit * 0.25, unit * 0.15];
    const colors = [accent, shiftColor(accent, -20), shiftColor(accent, 20)];
    // Horizontal stripes
    for (let i = 0; i < 3; i++) {
      const step = unit * 2.2;
      ctx.fillStyle = colors[i];
      for (let y = -D; y < D * 2; y += step) {
        ctx.fillRect(-D, y, D * 3, stripeWidths[i]);
      }
    }
    // Vertical stripes
    for (let i = 0; i < 3; i++) {
      const step = unit * 2.2;
      ctx.fillStyle = colors[i];
      for (let x = -D; x < D * 2; x += step) {
        ctx.fillRect(x, -D, stripeWidths[i], D * 3);
      }
    }
    // Fine cross lines
    ctx.fillStyle = shiftColor(base, -15);
    ctx.lineWidth = unit * 0.04;
    for (let i = -D; i < D * 2; i += unit * 0.6) {
      ctx.beginPath();
      ctx.moveTo(i, -D);
      ctx.lineTo(i, D);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-D, i);
      ctx.lineTo(D, i);
      ctx.stroke();
    }
  } else if (pid === "chevron") {
    // Zigzag chevron stripes
    const zigHeight = unit * 1.2;
    const zigWidth = unit * 1.5;
    for (let y = -D; y < D * 2; y += zigHeight) {
      ctx.beginPath();
      let startX = -D;
      let goingRight = true;
      for (let x = startX; x < D * 2; x += zigWidth) {
        const nextX = x + zigWidth;
        ctx.moveTo(x, y);
        if (goingRight) {
          ctx.lineTo(x + zigWidth / 2, y + zigHeight);
          ctx.lineTo(nextX, y);
        } else {
          ctx.lineTo(x + zigWidth / 2, y - zigHeight);
          ctx.lineTo(nextX, y);
        }
        goingRight = !goingRight;
      }
      ctx.fill();
      ctx.fillStyle = shiftColor(accent, -15);
      // Add a subtle line in middle
      ctx.beginPath();
      for (let x = startX; x < D * 2; x += zigWidth) {
        ctx.moveTo(x + zigWidth / 2, y + zigHeight / 2);
        ctx.lineTo(x + zigWidth * 1.5, y + zigHeight / 2);
      }
      ctx.lineWidth = unit * 0.06;
      ctx.strokeStyle = base;
      ctx.stroke();
      ctx.fillStyle = accent;
    }
  } else if (pid === "hexagon") {
    // Honeycomb hexagon pattern
    const hexW = unit * 0.9;
    const hexH = hexW * Math.sqrt(3);
    for (let row = -4; row < (D * 2) / hexH + 4; row++) {
      const offsetX = (row % 2) * hexW * 0.75;
      for (let col = -4; col < (D * 2) / hexW + 4; col++) {
        const cx = col * hexW * 1.5 + offsetX - D;
        const cy = row * hexH - D;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angleRad = (i / 6) * Math.PI * 2;
          const x = cx + hexW * 0.55 * Math.cos(angleRad);
          const y = cy + hexH * 0.55 * Math.sin(angleRad);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = shiftColor(accent, -10);
        ctx.beginPath();
        ctx.arc(cx, cy, hexW * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accent;
      }
    }
  } else if (pid === "quatrefoil") {
    // Elegant four-leaf motif
    const step = unit * 2;
    for (let x = -D; x < D * 2; x += step) {
      for (let y = -D; y < D * 2; y += step) {
        const cx = x + step / 2;
        const cy = y + step / 2;
        for (let i = 0; i < 4; i++) {
          const angleRad = (i / 4) * Math.PI * 2;
          const px = cx + Math.cos(angleRad) * step * 0.35;
          const py = cy + Math.sin(angleRad) * step * 0.35;
          ctx.beginPath();
          ctx.ellipse(
            px,
            py,
            step * 0.22,
            step * 0.32,
            angleRad,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, step * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = shiftColor(base, -10);
        ctx.fill();
        ctx.fillStyle = accent;
        // small dots
        for (let i = 0; i < 4; i++) {
          const angleRad = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const px = cx + Math.cos(angleRad) * step * 0.52;
          const py = cy + Math.sin(angleRad) * step * 0.52;
          ctx.beginPath();
          ctx.arc(px, py, step * 0.06, 0, Math.PI * 2);
          ctx.fillStyle = shiftColor(accent, 20);
          ctx.fill();
          ctx.fillStyle = accent;
        }
      }
    }
  } else if (pid === "moroccan") {
    // Moroccan geometric tile (zellige)
    const tileW = unit * 1.4;
    const tileH = tileW * 0.866;
    for (let row = -4; row < (D * 2) / tileH + 4; row++) {
      const offsetX = (row % 2) * tileW * 0.5;
      for (let col = -4; col < (D * 2) / tileW + 4; col++) {
        const cx = col * tileW + offsetX - D;
        const cy = row * tileH - D;
        // Star shape
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const angleRad = (i / 12) * Math.PI * 2;
          const r = tileW * 0.45 * (i % 2 === 0 ? 1 : 0.5);
          const x = cx + r * Math.cos(angleRad);
          const y = cy + r * Math.sin(angleRad);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = shiftColor(accent, -12);
        ctx.beginPath();
        ctx.arc(cx, cy, tileW * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accent;
      }
    }
  } else if (pid === "leopard") {
    // Spots with darker border
    const spots = 180;
    ctx.fillStyle = accent;
    for (let i = 0; i < spots; i++) {
      const x = Math.random() * D * 2 - D;
      const y = Math.random() * D * 2 - D;
      const radX = unit * (0.3 + Math.random() * 0.4);
      const radY = unit * (0.2 + Math.random() * 0.3);
      const rot = Math.random() * Math.PI;
      ctx.beginPath();
      ctx.ellipse(x, y, radX, radY, rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = shiftColor(accent, -20);
      ctx.beginPath();
      ctx.ellipse(
        x - radX * 0.2,
        y - radY * 0.1,
        radX * 0.4,
        radY * 0.4,
        rot,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = accent;
    }
  } else if (pid === "zebra") {
    // Curved organic stripes
    ctx.lineWidth = unit * 0.35;
    for (let i = -D; i < D * 2; i += unit * 1.2) {
      ctx.beginPath();
      for (let t = -D; t <= D; t += 5) {
        const x = i + Math.sin(t * 0.08) * unit * 0.8;
        const y = t;
        if (t === -D) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.lineWidth = unit * 0.2;
    for (let i = -D + unit * 0.6; i < D * 2; i += unit * 1.2) {
      ctx.beginPath();
      for (let t = -D; t <= D; t += 5) {
        const x = i + Math.sin(t * 0.08 + 1.2) * unit * 0.6;
        const y = t;
        if (t === -D) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = shiftColor(base, -20);
      ctx.stroke();
      ctx.strokeStyle = accent;
    }
  } else if (pid === "wave") {
    // Flowing water waves
    ctx.lineWidth = unit * 0.15;
    for (let i = -D; i < D * 2; i += unit * 0.7) {
      ctx.beginPath();
      for (let t = -D; t <= D; t += 4) {
        const x = i + Math.sin(t * 0.12) * unit * 0.5;
        const y = t + Math.cos(i * 0.1) * unit * 0.3;
        if (t === -D) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.lineWidth = unit * 0.08;
    for (let i = -D + unit * 0.35; i < D * 2; i += unit * 0.7) {
      ctx.beginPath();
      for (let t = -D; t <= D; t += 4) {
        const x = i + Math.sin(t * 0.12 + 1.5) * unit * 0.4;
        const y = t + Math.cos(i * 0.1 + 1.5) * unit * 0.25;
        if (t === -D) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = shiftColor(base, -15);
      ctx.stroke();
      ctx.strokeStyle = accent;
    }
  } else if (pid === "houndstooth") {
    // Classic houndstooth, enhanced with sharper angles and finer details
    const block = unit * 0.8;
    for (let row = -D; row < D * 2; row += block) {
      for (let col = -D; col < D * 2; col += block) {
        const x = col,
          y = row;
        ctx.beginPath();
        if ((Math.floor(row / block) + Math.floor(col / block)) % 2 === 0) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + block * 0.5, y);
          ctx.lineTo(x + block, y + block * 0.5);
          ctx.lineTo(x + block, y + block);
          ctx.lineTo(x + block * 0.5, y + block);
          ctx.lineTo(x, y + block * 0.5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.moveTo(x + block * 0.5, y);
          ctx.lineTo(x + block, y);
          ctx.lineTo(x + block, y + block * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y + block * 0.5);
          ctx.lineTo(x + block * 0.5, y + block);
          ctx.lineTo(x, y + block);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  } else if (pid === "floral") {
    // More intricate floral with layered petals
    const step = unit * 2.2;
    for (let x = -D; x < D * 2; x += step) {
      for (let y = -D; y < D * 2; y += step) {
        const cx = x + step / 2;
        const cy = y + step / 2;
        for (let i = 0; i < 8; i++) {
          const angleRad = (i / 8) * Math.PI * 2;
          const px = cx + Math.cos(angleRad) * step * 0.28;
          const py = cy + Math.sin(angleRad) * step * 0.28;
          ctx.beginPath();
          ctx.ellipse(
            px,
            py,
            step * 0.12,
            step * 0.22,
            angleRad,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.fillStyle = shiftColor(base, -10);
        ctx.beginPath();
        ctx.arc(cx, cy, step * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accent;
        // outer dots
        for (let i = 0; i < 8; i++) {
          const angleRad = (i / 8) * Math.PI * 2;
          const px = cx + Math.cos(angleRad) * step * 0.48;
          const py = cy + Math.sin(angleRad) * step * 0.48;
          ctx.beginPath();
          ctx.arc(px, py, step * 0.05, 0, Math.PI * 2);
          ctx.fillStyle = shiftColor(accent, 20);
          ctx.fill();
          ctx.fillStyle = accent;
        }
      }
    }
  } else if (pid === "herringbone") {
    // Elegant V-weave
    const hw = unit * 0.9;
    ctx.lineWidth = unit * 0.12;
    for (let row = -D; row < D * 2; row += hw) {
      for (let col = -D; col < D * 2; col += hw) {
        const x = col,
          y = row;
        ctx.beginPath();
        if ((Math.floor(row / hw) + Math.floor(col / hw)) % 2 === 0) {
          ctx.moveTo(x, y + hw);
          ctx.lineTo(x + hw, y);
        } else {
          ctx.moveTo(x, y);
          ctx.lineTo(x + hw, y + hw);
        }
        ctx.stroke();
      }
    }
  } else if (pid === "stripes_h") {
    const s = unit * 0.6;
    for (let y = -D; y < D * 2; y += unit) ctx.fillRect(-D, y, D * 3, s);
  } else if (pid === "stripes_v") {
    const s = unit * 0.6;
    for (let x = -D; x < D * 2; x += unit) ctx.fillRect(x, -D, s, D * 3);
  } else if (pid === "stripes_d") {
    ctx.lineWidth = unit * 0.5;
    for (let i = -D * 2; i < D * 3; i += unit) {
      ctx.beginPath();
      ctx.moveTo(i, -D);
      ctx.lineTo(i + D * 2, D);
      ctx.stroke();
    }
  } else if (pid === "checks") {
    const cell = unit;
    for (let x = -D; x < D * 2; x += cell) {
      for (let y = -D; y < D * 2; y += cell) {
        if ((Math.floor(x / cell) + Math.floor(y / cell)) % 2 === 0) {
          ctx.fillRect(x, y, cell, cell);
        }
      }
    }
  } else if (pid === "polka") {
    const r = unit * 0.3;
    for (let x = -D; x < D * 2; x += unit) {
      for (let y = -D; y < D * 2; y += unit) {
        ctx.beginPath();
        ctx.arc(x + unit / 2, y + unit / 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pid === "argyle") {
    const dw = unit * 1.5,
      dh = unit * 1.8;
    for (let row = -D; row < D * 2; row += dh) {
      const offset = ((Math.floor(row / dh) % 2) * dw) / 2;
      for (let col = -D; col < D * 2; col += dw) {
        const cx = col + offset,
          cy = row;
        ctx.beginPath();
        ctx.moveTo(cx, cy - dh / 2);
        ctx.lineTo(cx + dw / 2, cy);
        ctx.lineTo(cx, cy + dh / 2);
        ctx.lineTo(cx - dw / 2, cy);
        ctx.closePath();
        ctx.fill();
      }
    }
  } else if (pid === "geometric") {
    ctx.lineWidth = unit * 0.12;
    for (let x = -D; x < D * 2; x += unit) {
      for (let y = -D; y < D * 2; y += unit) {
        const cx = x + unit / 2,
          cy = y + unit / 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
          const px = cx + Math.cos(angle) * unit * 0.45;
          const py = cy + Math.sin(angle) * unit * 0.45;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (pid === "camo") {
    // Improved camo with more varied blobs
    const rng = (seed: any) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const colors = [
      accent,
      shiftColor(accent, -25),
      shiftColor(base, -15),
      shiftColor(base, 10),
    ];
    let seed = 1;
    for (let i = 0; i < 300; i++) {
      const cx = rng(seed++) * D * 2 - D;
      const cy = rng(seed++) * D * 2 - D;
      const rx = rng(seed++) * unit * 1.5 + unit * 0.4;
      const ry = rng(seed++) * unit * 1.0 + unit * 0.3;
      const rot = rng(seed++) * Math.PI;
      ctx.fillStyle = colors[Math.floor(rng(seed++) * colors.length)];
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// export function generateNormalMapFromTexture(
//   texture: THREE.Texture,
//   onComplete: (texture: THREE.Texture) => void,
// ) {
//   const img = texture.image as HTMLImageElement;
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//   canvas.width = img.width;
//   canvas.height = img.height;
//   ctx.drawImage(img, 0, 0);
//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   const data = imageData.data;

//   // Convert to grayscale first
//   const grayscale = new Array(canvas.width * canvas.height);
//   for (let i = 0; i < data.length; i += 4) {
//     const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
//     grayscale[i / 4] = gray / 255; // 0..1
//   }

//   // Sobel operator
//   const width = canvas.width;
//   const height = canvas.height;
//   const normalMapData = new Uint8Array(width * height * 4);

//   for (let y = 1; y < height - 1; y++) {
//     for (let x = 1; x < width - 1; x++) {
//       const idx = y * width + x;
//       const gx =
//         -grayscale[idx - width - 1] +
//         grayscale[idx - width + 1] +
//         -2 * grayscale[idx - 1] +
//         2 * grayscale[idx + 1] +
//         -grayscale[idx + width - 1] +
//         grayscale[idx + width + 1];
//       const gy =
//         -grayscale[idx - width - 1] -
//         2 * grayscale[idx - width] -
//         grayscale[idx - width + 1] +
//         grayscale[idx + width - 1] +
//         2 * grayscale[idx + width] +
//         grayscale[idx + width + 1];
//       const gz = 1.0;
//       let len = Math.hypot(gx, gy, gz);
//       if (len === 0) len = 1;
//       const nx = gx / len;
//       const ny = gy / len;
//       const nz = gz / len;
//       // Convert from [-1,1] to [0,255]
//       normalMapData[idx * 4 + 0] = Math.floor((nx + 1) * 0.5 * 255);
//       normalMapData[idx * 4 + 1] = Math.floor((ny + 1) * 0.5 * 255);
//       normalMapData[idx * 4 + 2] = Math.floor((nz + 1) * 0.5 * 255);
//       normalMapData[idx * 4 + 3] = 255;
//     }
//   }

//   const normalCanvas = document.createElement("canvas");
//   normalCanvas.width = width;
//   normalCanvas.height = height;
//   const normalCtx = normalCanvas.getContext("2d");
//   const normalImageData = new ImageData(normalMapData as any, width, height);
//   normalCtx.putImageData(normalImageData, 0, 0);

//   const normalTexture = new THREE.CanvasTexture(normalCanvas);
//   normalTexture.needsUpdate = true;
//   onComplete(normalTexture);
// }

export function generateNormalMapFromTexture(
  texture: THREE.Texture,
  strength = 1.5,
  onComplete: (e: THREE.Texture | null) => void,
) {
  const img = texture.image as HTMLImageElement;
  if (!img) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  if (!ctx) return;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const width = canvas.width;
  const height = canvas.height;
  const grayscale = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grayscale[i / 4] = gray / 255;
  }

  const normalData = new Uint8ClampedArray(width * height * 4);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -grayscale[idx - width - 1] +
        grayscale[idx - width + 1] +
        -2 * grayscale[idx - 1] +
        2 * grayscale[idx + 1] +
        -grayscale[idx + width - 1] +
        grayscale[idx + width + 1];
      const gy =
        -grayscale[idx - width - 1] -
        2 * grayscale[idx - width] -
        grayscale[idx - width + 1] +
        grayscale[idx + width - 1] +
        2 * grayscale[idx + width] +
        grayscale[idx + width + 1];
      const gz = 1.0;
      let len = Math.hypot(gx * strength, gy * strength, gz);
      if (len === 0) len = 1;
      const nx = (gx * strength) / len;
      const ny = (gy * strength) / len;
      const nz = gz / len;
      normalData[idx * 4] = Math.floor((nx + 1) * 0.5 * 255);
      normalData[idx * 4 + 1] = Math.floor((ny + 1) * 0.5 * 255);
      normalData[idx * 4 + 2] = Math.floor((nz + 1) * 0.5 * 255);
      normalData[idx * 4 + 3] = 255;
    }
  }

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = width;
  normalCanvas.height = height;
  const normalCtx = normalCanvas.getContext("2d");
  const normalImageData = new ImageData(normalData, width, height);
  if (!normalCtx) return;
  normalCtx.putImageData(normalImageData, 0, 0);
  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  normalTexture.needsUpdate = true;
  onComplete(normalTexture);
}
