function buildWeaveNormalCanvas(tile: number = 4, style: string = "plain") {
  const sz = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
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

function buildWeaveRoughCanvas(tile = 4) {
  const sz = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(0, 0, sz, sz);
    const step = sz / tile;
    for (let i = 0; i < tile; i++)
      for (let j = 0; j < tile; j++) {
        const x = i * step,
          y = j * step;

        ctx.fillStyle = (i + j) % 2 === 0 ? "#c0c0c0" : "#909090";
        ctx.fillRect(x + step * 0.2, y + step * 0.2, step * 0.6, step * 0.6);
      }
  }
  return cv;
}

export { buildWeaveNormalCanvas, buildWeaveRoughCanvas };
