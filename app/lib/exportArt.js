function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function ensureFonts() {
  if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // ignore font-load races; canvas falls back to system fonts
    }
  }
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx, sy, sw, sh;
  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = w + " ";
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  return lines;
}

function measureCtx() {
  return document.createElement("canvas").getContext("2d");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function sampleColors(img, points) {
  const size = 300;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  drawImageCover(ctx, img, 0, 0, size, size);
  return points.map(([px, py]) => {
    const x = Math.min(size - 1, Math.max(0, Math.round(px * size)));
    const y = Math.min(size - 1, Math.max(0, Math.round(py * size)));
    const d = ctx.getImageData(x, y, 1, 1).data;
    return `#${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  });
}

export async function renderPoster({ imageSrc, name, book, quote }) {
  await ensureFonts();
  const img = await loadImage(imageSrc);

  const W = 1600;
  const margin = 60;
  const imgW = W - margin * 2;
  const imgH = Math.round(imgW * 1.1);

  const mctx = measureCtx();
  mctx.font = "italic 30px Fraunces, serif";
  const quoteText = quote ? `"${quote}"` : "";
  const quoteLines = quote ? wrapLines(mctx, quoteText, imgW - 140) : [];
  const quoteLineHeight = 40;

  const nameY = margin + imgH + 100;
  const bookY = nameY + 48;
  const quoteStartY = bookY + 62;
  const lastTextY = quote ? quoteStartY + (quoteLines.length - 1) * quoteLineHeight : bookY;
  const H = Math.round(lastTextY + 70 + margin);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f1e7cf";
  ctx.fillRect(0, 0, W, H);

  drawImageCover(ctx, img, margin, margin, imgW, imgH);

  const grad = ctx.createLinearGradient(0, margin + imgH - 260, 0, margin + imgH);
  grad.addColorStop(0, "rgba(20,14,10,0)");
  grad.addColorStop(1, "rgba(20,14,10,0.5)");
  ctx.fillStyle = grad;
  ctx.fillRect(margin, margin + imgH - 260, imgW, 260);

  ctx.strokeStyle = "rgba(36,30,23,0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, imgW, imgH);

  ctx.textAlign = "center";
  ctx.fillStyle = "#241e17";
  ctx.font = "600 62px Fraunces, serif";
  ctx.fillText(name, W / 2, nameY);

  ctx.font = "600 24px Inter, sans-serif";
  ctx.fillStyle = "#7d1f30";
  ctx.fillText(book.toUpperCase(), W / 2, bookY);

  if (quote) {
    ctx.font = "italic 30px Fraunces, serif";
    ctx.fillStyle = "#3a3226";
    quoteLines.forEach((l, i) => ctx.fillText(l, W / 2, quoteStartY + i * quoteLineHeight));
  }

  return canvas;
}

export async function renderWallpaper({ imageSrc, name, book }, variant = "phone") {
  await ensureFonts();
  const sizes = { phone: [1170, 2532], desktop: [1920, 1080] };
  const [w, h] = sizes[variant] || sizes.phone;
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  drawImageCover(ctx, img, 0, 0, w, h);

  const gh = h * 0.22;
  const grad = ctx.createLinearGradient(0, h - gh, 0, h);
  grad.addColorStop(0, "rgba(10,8,6,0)");
  grad.addColorStop(1, "rgba(10,8,6,0.65)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - gh, w, gh);

  const align = variant === "desktop" ? "right" : "center";
  const tx = variant === "desktop" ? w - 60 : w / 2;
  ctx.textAlign = align;
  ctx.fillStyle = "#f1e7cf";
  ctx.font = `600 ${Math.round(w * 0.032)}px Fraunces, serif`;
  ctx.fillText(name, tx, h - gh * 0.42);
  ctx.font = `500 ${Math.round(w * 0.016)}px Inter, sans-serif`;
  ctx.fillStyle = "#cda444";
  ctx.fillText(book.toUpperCase(), tx, h - gh * 0.42 + Math.round(w * 0.028));

  return canvas;
}

export async function renderPrint({ imageSrc, name, book, quote }) {
  await ensureFonts();
  const img = await loadImage(imageSrc);

  const W = 3000;
  const mat = 180;
  const imgW = W - mat * 2;
  const imgH = Math.round(imgW * 1.1);

  const mctx = measureCtx();
  mctx.font = "italic 36px Fraunces, serif";
  const quoteText = quote ? `"${quote}"` : "";
  const quoteLines = quote ? wrapLines(mctx, quoteText, imgW - 220) : [];
  const quoteLineHeight = 50;

  const nameY = mat + imgH + 140;
  const bookY = nameY + 66;
  const quoteStartY = bookY + 84;
  const lastTextY = quote ? quoteStartY + (quoteLines.length - 1) * quoteLineHeight : bookY;
  const H = Math.round(lastTextY + 90 + mat);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#faf6ec";
  ctx.fillRect(0, 0, W, H);

  drawImageCover(ctx, img, mat, mat, imgW, imgH);

  ctx.strokeStyle = "rgba(36,30,23,0.25)";
  ctx.lineWidth = 3;
  ctx.strokeRect(mat, mat, imgW, imgH);

  ctx.textAlign = "center";
  ctx.fillStyle = "#241e17";
  ctx.font = "600 92px Fraunces, serif";
  ctx.fillText(name, W / 2, nameY);

  ctx.font = "600 32px Inter, sans-serif";
  ctx.fillStyle = "#7d1f30";
  ctx.fillText(book.toUpperCase(), W / 2, bookY);

  if (quote) {
    ctx.font = "italic 36px Fraunces, serif";
    ctx.fillStyle = "#3a3226";
    quoteLines.forEach((l, i) => ctx.fillText(l, W / 2, quoteStartY + i * quoteLineHeight));
  }

  ctx.font = "500 22px Inter, sans-serif";
  ctx.fillStyle = "#9c8452";
  ctx.textAlign = "right";
  ctx.fillText("300 DPI · print-ready", W - mat, H - mat / 3);

  return canvas;
}

export async function renderBookTokCard({ imageSrc, name, book, quote, era, styleLabel }) {
  await ensureFonts();
  const img = await loadImage(imageSrc);
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  drawImageCover(ctx, img, 0, 0, W, H);

  const topGrad = ctx.createLinearGradient(0, 0, 0, 340);
  topGrad.addColorStop(0, "rgba(10,8,10,0.55)");
  topGrad.addColorStop(1, "rgba(10,8,10,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 340);

  const bottomGrad = ctx.createLinearGradient(0, H - 640, 0, H);
  bottomGrad.addColorStop(0, "rgba(8,6,8,0)");
  bottomGrad.addColorStop(1, "rgba(8,6,8,0.86)");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H - 640, W, 640);

  ctx.textAlign = "left";
  ctx.font = "600 26px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(`\u{1F4D6} ${book.toUpperCase()}`, 48, 90);

  const tags = [era, styleLabel].filter(Boolean);
  let tagX = 48;
  const tagY = H - 480;
  ctx.font = "600 22px Inter, sans-serif";
  tags.forEach((t) => {
    const label = t.toUpperCase();
    const padding = 20;
    const textW = ctx.measureText(label).width;
    const pillW = textW + padding * 2;
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    roundRect(ctx, tagX, tagY - 34, pillW, 48, 24);
    ctx.fill();
    ctx.fillStyle = "#f1e7cf";
    ctx.fillText(label, tagX + padding, tagY);
    tagX += pillW + 12;
  });

  ctx.fillStyle = "#f8f2e2";
  ctx.font = "600 84px Fraunces, serif";
  ctx.fillText(name, 48, H - 360);

  if (quote) {
    ctx.font = "italic 32px Fraunces, serif";
    ctx.fillStyle = "rgba(248,242,226,0.9)";
    const mctx = measureCtx();
    mctx.font = ctx.font;
    const lines = wrapLines(mctx, `"${quote}"`, W - 96);
    lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 48, H - 280 + i * 42));
  }

  ctx.textAlign = "right";
  ctx.font = "600 24px Inter, sans-serif";
  ctx.fillStyle = "rgba(205,164,68,0.85)";
  ctx.fillText("INKLING", W - 40, H - 48);

  return canvas;
}

export async function renderAestheticBoard({ mainImageSrc, sceneImages = [], name, book, quote, era, styleLabel }) {
  await ensureFonts();
  const mainImg = await loadImage(mainImageSrc);
  const extraImgs = await Promise.all(sceneImages.slice(0, 3).map(loadImage));

  const W = 1600;
  const H = 2000;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#efe6d2";
  ctx.fillRect(0, 0, W, H);

  const margin = 56;
  ctx.textAlign = "left";
  ctx.fillStyle = "#241e17";
  ctx.font = "600 46px Fraunces, serif";
  ctx.fillText(name, margin, 100);
  ctx.font = "600 20px Inter, sans-serif";
  ctx.fillStyle = "#7d1f30";
  ctx.fillText(`${book.toUpperCase()} · AESTHETIC BOARD`, margin, 138);

  const gridTop = 180;
  const gridBottom = H - 280;
  const gridH = gridBottom - gridTop;
  const heroW = Math.round((W - margin * 2) * 0.62);
  const sideW = W - margin * 2 - heroW - 24;
  const sideX = margin + heroW + 24;

  drawImageCover(ctx, mainImg, margin, gridTop, heroW, gridH);

  let cy = gridTop;
  if (extraImgs.length === 0) {
    const fallbackCount = 3;
    const fh = Math.floor((gridH - (fallbackCount - 1) * 20) / fallbackCount);
    for (let i = 0; i < fallbackCount; i++) {
      drawImageCover(ctx, mainImg, sideX, cy, sideW, fh);
      cy += fh + 20;
    }
  } else {
    const cellH = Math.floor((gridH - (extraImgs.length - 1) * 20) / extraImgs.length);
    extraImgs.forEach((im) => {
      drawImageCover(ctx, im, sideX, cy, sideW, cellH);
      cy += cellH + 20;
    });
  }

  const colors = sampleColors(mainImg, [
    [0.2, 0.25], [0.5, 0.2], [0.8, 0.35], [0.35, 0.7], [0.7, 0.75],
  ]);
  const swatchY = gridBottom + 30;
  const swatchSize = 46;
  let sx = margin;
  colors.forEach((hex) => {
    ctx.fillStyle = hex;
    roundRect(ctx, sx, swatchY, swatchSize, swatchSize, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(36,30,23,0.15)";
    ctx.stroke();
    sx += swatchSize + 10;
  });

  const tags = [era, styleLabel].filter(Boolean);
  let tagX = sx + 30;
  ctx.textAlign = "left";
  tags.forEach((t) => {
    const label = t.toUpperCase();
    ctx.font = "600 18px Inter, sans-serif";
    const textW = ctx.measureText(label).width;
    const pillW = textW + 28;
    ctx.fillStyle = "rgba(125,31,48,0.1)";
    roundRect(ctx, tagX, swatchY, pillW, swatchSize, swatchSize / 2);
    ctx.fill();
    ctx.fillStyle = "#7d1f30";
    ctx.fillText(label, tagX + 14, swatchY + swatchSize / 2 + 6);
    tagX += pillW + 10;
  });

  if (quote) {
    ctx.textAlign = "center";
    ctx.font = "italic 26px Fraunces, serif";
    ctx.fillStyle = "#3a3226";
    const mctx = measureCtx();
    mctx.font = ctx.font;
    const lines = wrapLines(mctx, `"${quote}"`, W - margin * 2);
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, swatchY + 110 + i * 34));
  }

  return canvas;
}

export async function renderPitchDeck({ imageSrc, name, book, blurb, bio, quote, era }) {
  await ensureFonts();
  const img = await loadImage(imageSrc);
  const W = 1920;
  const H = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f6efdd";
  ctx.fillRect(0, 0, W, H);

  const imgW = Math.round(W * 0.42);
  drawImageCover(ctx, img, 0, 0, imgW, H);

  const textX = imgW + 80;
  const textW = W - imgW - 160;
  const mctx = measureCtx();

  ctx.textAlign = "left";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.fillStyle = "#7d1f30";
  ctx.fillText(book.toUpperCase(), textX, 110);

  ctx.font = "600 72px Fraunces, serif";
  ctx.fillStyle = "#241e17";
  ctx.fillText(name, textX, 190);

  if (era) {
    ctx.font = "italic 22px Fraunces, serif";
    ctx.fillStyle = "#6b5f4d";
    ctx.fillText(era, textX, 228);
  }

  let ty = 300;

  if (blurb) {
    ctx.font = "italic 30px Fraunces, serif";
    ctx.fillStyle = "#3a3226";
    mctx.font = ctx.font;
    const lines = wrapLines(mctx, blurb, textW);
    lines.forEach((l, i) => ctx.fillText(l, textX, ty + i * 40));
    ty += lines.length * 40 + 40;
  }

  ctx.font = "600 16px Inter, sans-serif";
  ctx.fillStyle = "#9c8452";
  ctx.fillText("ABOUT THE CHARACTER", textX, ty);
  ty += 34;

  if (bio) {
    ctx.font = "20px Inter, sans-serif";
    ctx.fillStyle = "#3a3226";
    mctx.font = ctx.font;
    const lines = wrapLines(mctx, bio, textW);
    lines.forEach((l, i) => ctx.fillText(l, textX, ty + i * 30));
    ty += lines.length * 30 + 44;
  }

  if (quote) {
    ctx.strokeStyle = "rgba(125,31,48,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(textX, ty - 20);
    ctx.lineTo(textX, ty + 60);
    ctx.stroke();

    ctx.font = "italic 24px Fraunces, serif";
    ctx.fillStyle = "#4a3f2f";
    mctx.font = ctx.font;
    const lines = wrapLines(mctx, `"${quote}"`, textW - 30);
    lines.forEach((l, i) => ctx.fillText(l, textX + 26, ty + i * 32));
  }

  ctx.font = "500 16px Inter, sans-serif";
  ctx.fillStyle = "#9c8452";
  ctx.fillText("Character concept art — generated with Inkling", textX, H - 50);

  return canvas;
}

export function downloadDataUri(dataUri, filename) {
  const a = document.createElement("a");
  a.href = dataUri;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}
