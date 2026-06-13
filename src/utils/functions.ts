function shiftColor(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function buildWeaveNormalCanvas(tile = 4, style = "plain") {
  const sz = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, sz, sz);
  const step = sz / tile;
  for (let i = 0; i < tile; i++) {
    for (let j = 0; j < tile; j++) {
      const x = i * step,
        y = j * step;
      if (style === "twill") {
        // diagonal twill bump
        const diag = (i + j) % 2 === 0;
        ctx.fillStyle = diag ? "#9090ff" : "#7070ee";
        ctx.fillRect(x, y, step, step);
      } else {
        // plain weave: alternate warp/weft highlight
        const warp = i % 2 === 0;
        ctx.fillStyle = warp ? "#9898ff" : "#7070ef";
        ctx.fillRect(x, y, step, step);
        // subtle thread ridge along axis
        ctx.fillStyle = warp ? "rgba(180,180,255,0.4)" : "rgba(80,80,200,0.3)";
        const hw = step * 0.25;
        if (warp) ctx.fillRect(x + step * 0.5 - hw / 2, y, hw, step);
        else ctx.fillRect(x, y + step * 0.5 - hw / 2, step, hw);
      }
    }
  }
  return cv;
}

// Roughness/AO canvas — darker at fold edges, lighter at raised threads
function buildWeaveRoughCanvas(tile = 4) {
  const sz = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#aaaaaa";
  ctx.fillRect(0, 0, sz, sz);
  const step = sz / tile;
  for (let i = 0; i < tile; i++)
    for (let j = 0; j < tile; j++) {
      const x = i * step,
        y = j * step;
      // thread crossing = slightly lighter (raised, catches light more)
      ctx.fillStyle = (i + j) % 2 === 0 ? "#c0c0c0" : "#909090";
      ctx.fillRect(x + step * 0.2, y + step * 0.2, step * 0.6, step * 0.6);
    }
  return cv;
}

// Pattern diffuse map
function paintPattern(ctx, sz, pid, base, accent, scale, angle, opacity) {
  ctx.clearRect(0, 0, sz, sz);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, sz, sz);
  if (pid === "none") return;
  ctx.save();
  ctx.globalAlpha = opacity;
  const unit = sz / (10 * scale);
  ctx.translate(sz / 2, sz / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-sz, -sz);
  const D = sz * 2.6;
  ctx.fillStyle = accent;
  ctx.strokeStyle = accent;

  if (pid === "stripes_h") {
    const s = unit * 0.5;
    for (let y = -D; y < D * 2; y += unit) ctx.fillRect(-D, y, D * 3, s);
  } else if (pid === "stripes_v") {
    const s = unit * 0.5;
    for (let x = -D; x < D * 2; x += unit) ctx.fillRect(x, -D, s, D * 3);
  } else if (pid === "stripes_d") {
    ctx.lineWidth = unit * 0.45;
    for (let i = -D * 2; i < D * 3; i += unit) {
      ctx.beginPath();
      ctx.moveTo(i, -D);
      ctx.lineTo(i + D * 2, D);
      ctx.stroke();
    }
  } else if (pid === "checks") {
    for (let x = -D; x < D * 2; x += unit)
      for (let y = -D; y < D * 2; y += unit) {
        const xi = Math.floor((x + D) / unit),
          yi = Math.floor((y + D) / unit);
        if ((xi + yi) % 2 === 0) ctx.fillRect(x, y, unit, unit);
      }
  } else if (pid === "houndstooth") {
    for (let row = -2; row < (D * 2) / unit + 2; row++)
      for (let col = -2; col < (D * 2) / unit + 2; col++) {
        const x = col * unit - D,
          y = row * unit - D;
        ctx.beginPath();
        if ((row + col) % 2 === 0) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + unit * 0.5, y);
          ctx.lineTo(x + unit, y + unit * 0.5);
          ctx.lineTo(x + unit, y + unit);
          ctx.lineTo(x + unit * 0.5, y + unit);
          ctx.lineTo(x, y + unit * 0.5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.moveTo(x + unit * 0.5, y);
          ctx.lineTo(x + unit, y);
          ctx.lineTo(x + unit, y + unit * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y + unit * 0.5);
          ctx.lineTo(x + unit * 0.5, y + unit);
          ctx.lineTo(x, y + unit);
          ctx.closePath();
          ctx.fill();
        }
      }
  } else if (pid === "polka") {
    const r = unit * 0.28;
    for (let x = -D; x < D * 2; x += unit)
      for (let y = -D; y < D * 2; y += unit) {
        ctx.beginPath();
        ctx.arc(x + unit / 2, y + unit / 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
  } else if (pid === "herringbone") {
    ctx.lineWidth = unit * 0.18;
    const hw = unit * 0.5;
    for (let row = -4; row < (D * 2) / hw + 4; row++)
      for (let col = -4; col < (D * 2) / hw + 4; col++) {
        const x = col * hw - D,
          y = row * hw - D;
        ctx.beginPath();
        if ((row + col) % 2 === 0) {
          ctx.moveTo(x, y + hw);
          ctx.lineTo(x + hw, y);
        } else {
          ctx.moveTo(x, y);
          ctx.lineTo(x + hw, y + hw);
        }
        ctx.stroke();
      }
  } else if (pid === "argyle") {
    const dw = unit * 1.2,
      dh = unit * 1.8;
    for (let row = -3; row < (D * 2) / dh + 3; row++)
      for (let col = -3; col < (D * 2) / dw + 3; col++) {
        const cx = col * dw + ((row % 2) * dw) / 2 - D,
          cy = row * dh - D;
        ctx.beginPath();
        ctx.moveTo(cx, cy - dh / 2);
        ctx.lineTo(cx + dw / 2, cy);
        ctx.lineTo(cx, cy + dh / 2);
        ctx.lineTo(cx - dw / 2, cy);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = unit * 0.06;
        ctx.strokeStyle = base;
        ctx.stroke();
        ctx.strokeStyle = accent;
      }
    ctx.lineWidth = unit * 0.08;
    for (let i = -D * 2; i < D * 3; i += unit * 1.2) {
      ctx.beginPath();
      ctx.moveTo(i, -D);
      ctx.lineTo(i + D * 2, D);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, -D);
      ctx.lineTo(i - D * 2, D);
      ctx.stroke();
    }
  } else if (pid === "floral") {
    const petals = 6;
    for (let x = -D; x < D * 2; x += unit)
      for (let y = -D; y < D * 2; y += unit) {
        const cx = x + unit / 2,
          cy = y + unit / 2;
        for (let p = 0; p < petals; p++) {
          const a = (p / petals) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(
            cx + Math.cos(a) * unit * 0.22,
            cy + Math.sin(a) * unit * 0.22,
            unit * 0.14,
            unit * 0.09,
            a,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, unit * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = base;
        ctx.fill();
        ctx.fillStyle = accent;
      }
  } else if (pid === "geometric") {
    ctx.lineWidth = unit * 0.08;
    for (let x = -D; x < D * 2; x += unit)
      for (let y = -D; y < D * 2; y += unit) {
        const cx = x + unit / 2,
          cy = y + unit / 2;
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const a = (s / 6) * Math.PI * 2 - Math.PI / 6;
          s === 0
            ? ctx.moveTo(
                cx + Math.cos(a) * unit * 0.44,
                cy + Math.sin(a) * unit * 0.44,
              )
            : ctx.lineTo(
                cx + Math.cos(a) * unit * 0.44,
                cy + Math.sin(a) * unit * 0.44,
              );
        }
        ctx.closePath();
        ctx.stroke();
      }
  } else if (pid === "camo") {
    const rng = (seed) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const cols = [accent, base, shiftColor(accent, 30), shiftColor(base, -20)];
    let seed = 1;
    for (let i = 0; i < 240; i++) {
      const cx = rng(seed++) * D * 2 - D,
        cy = rng(seed++) * D * 2 - D,
        rx = rng(seed++) * unit * 1.2 + unit * 0.3,
        ry = rng(seed++) * unit * 0.8 + unit * 0.2,
        rot = rng(seed++) * Math.PI;
      ctx.fillStyle = cols[Math.floor(rng(seed++) * cols.length)];
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export {
  buildWeaveNormalCanvas,
  paintPattern,
  shiftColor,
  buildWeaveRoughCanvas,
};
