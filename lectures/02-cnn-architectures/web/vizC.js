/* Lecture 2 — visuals for Part 5 (necks), Part 6 (segmentation), Part 7 (attention and design). */
"use strict";

/* ------------------------------------------------------------ Part 5 */
VIZ.smallObj = host => {
  const svg = V.svg(host, 1400, 430);
  const P = [8, 16, 32].map((s, i) => {
    const g = fadeIn(V.g(svg)), ox = 40 + i * 460, oy = 40, k = 1.25;
    V.rect(g, ox, oy, 256 * k, 256 * k, "", { style: "fill:#eef1f3" });
    V.rect(g, ox + 120 * k, oy + 100 * k, 16 * k, 16 * k, "", { style: "fill:var(--magenta)" });
    for (let t = 0; t <= 256; t += s) { V.line(g, ox + t * k, oy, ox + t * k, oy + 256 * k, { style: "stroke:var(--blue)", "stroke-width": 1, opacity: .5 }); V.line(g, ox, oy + t * k, ox + 256 * k, oy + t * k, { style: "stroke:var(--blue)", "stroke-width": 1, opacity: .5 }); }
    V.text(g, ox + 128 * k, 18, `stride ${s}`, { size: 22, weight: 700 });
    V.text(g, ox + 128 * k, 388, [`the 16-px defect fills 2 × 2 cells`, `fills exactly one cell`, `covers ¼ of a cell: diluted by background`][i], { size: 22, fill: i === 2 ? "var(--red)" : "var(--ink)" });
    return g;
  });
  return { steps: 2, set(s) { P.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.semDetail = host => {
  const svg = V.svg(host, 1400, 420);
  const X = d => 160 + d * 230, Y = s => 370 - s * 300;
  plotAxes(svg, X, Y, 0, 4.2, 0, 1.1, "", "semantic strength");
  V.text(svg, X(2), 402, "spatial detail →  (stride 32 · 16 · 8 · 4)", { size: 22, cls: "muted" });
  const L = [["C5", 0.5, .95], ["C4", 1.5, .7], ["C3", 2.5, .45], ["C2", 3.5, .2]];
  L.forEach(([n, x, y]) => { V.circle(svg, X(x), Y(y), 16, { style: "fill:var(--blue)" }); V.text(svg, X(x) + 30, Y(y), n, { size: 22, weight: 700, anchor: "start" }); });
  const up = fadeIn(V.g(svg));
  L.slice(1).forEach(([n, x, y]) => { V.arrow(up, X(x), Y(y) - 22, X(x), Y(.93) + 22, "green"); V.circle(up, X(x), Y(.95), 16, { style: "fill:var(--green)" }); V.text(up, X(x) + 30, Y(.95), n.replace("C", "P"), { size: 22, weight: 700, anchor: "start", fill: "var(--green)" }); });
  V.text(svg, 1240, 120, "deep maps know “what”,\nshallow maps know “where”", { size: 22 });
  const g2 = fadeIn(V.text(svg, 1240, 280, "a neck gives every level\nboth: strong semantics\nat its own resolution", { size: 22, fill: "var(--green)", weight: 700 }));
  return { steps: 1, set(s) { V.show(up, s >= 1); V.show(g2, s >= 1); } };
};

VIZ.fpn = host => {
  const svg = V.svg(host, 1400, 460);
  // rows: level, centre y, square size, backbone shape
  const L = [["5", 80, 56, "2048 × 20²"], ["4", 205, 86, "1024 × 40²"], ["3", 350, 126, "512 × 80²"]];
  const bx = 150, lat = 330, plus = 545, px = 700, hx = 1010;
  V.text(svg, bx, 16, "backbone", { size: 23, weight: 700 }); V.text(svg, px, 16, "pyramid, 256 channels each", { size: 23, weight: 700 });
  L.forEach(([n, y, sz, sh]) => {
    V.rect(svg, bx - sz / 2, y - sz / 2, sz, sz, "", { style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:2.5" });
    V.text(svg, bx - sz / 2 - 14, y, "C" + n, { size: 23, weight: 700, anchor: "end" });
    V.text(svg, bx + sz / 2 + 8, y + sz / 2 - 6, sh, { size: 20, cls: "muted", anchor: "start" });
  });
  const S = L.map(([n, y, sz], k) => {
    const g = fadeIn(V.g(svg));
    V.arrow(g, bx + sz / 2 + 6, y, lat - 6, y);
    V.box(g, lat, y - 24, 110, 48, "1 × 1", "box", { size: 22 });
    if (k) {
      V.arrow(g, lat + 114, y, plus - 22, y);
      V.circle(g, plus, y, 18, { style: "fill:#fff;stroke:var(--ink);stroke-width:2.5" }); V.text(g, plus, y, "+", { size: 26 });
      const [, py, psz] = L[k - 1];
      V.curveArrow(g, `M${px - psz / 2 - 4},${py + psz / 2 - 4} Q${plus},${py + psz / 2 + 10} ${plus},${y - 24}`, "green");
      V.text(g, plus - 88, (py + y) / 2 + 22, "upsample × 2", { size: 21, fill: "var(--green)", weight: 700 });
      V.arrow(g, plus + 22, y, px - sz / 2 - 6, y);
    } else V.arrow(g, lat + 114, y, px - sz / 2 - 6, y);
    V.rect(g, px - sz / 2, y - sz / 2, sz, sz, "", { style: "fill:var(--green-soft);stroke:var(--green);stroke-width:2.5" });
    V.text(g, px, y, "P" + n, { size: 23, weight: 700, fill: "var(--green)" });
    return g;
  });
  const heads = fadeIn(V.g(svg));
  L.forEach(([, y, sz]) => { V.arrow(heads, px + sz / 2 + 6, y, hx - 6, y); V.box(heads, hx, y - 28, 220, 56, "3 × 3 → head", "box good", { size: 22 }); });
  V.text(heads, hx + 110, 440, "one head, shared by all levels", { size: 21, cls: "muted" });
  const T = ["", "C5 → 1 × 1 → P5: the most semantic map", "P5 upsampled × 2, added to lateral C4 → P4", "same again → P3: fine and semantic", "3 × 3 smoothing, then the shared head on every level"];
  const t = V.text(svg, 450, 445, "", { size: 22, weight: 700, fill: "var(--blue)" });
  return { steps: 4, set(s) { S.forEach((g, i) => V.show(g, i < s)); V.show(heads, s >= 4); V.setText(t, T[s]); } };
};

VIZ.levelAssign = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cats-crowd.jpg", 20, 10, 420, 420);
  const lvl = b => { const s = Math.sqrt((b[2] - b[0]) * (b[3] - b[1])); return s < 150 ? 0 : s < 195 ? 1 : 2; };
  const cols = ["orange", "blue", "magenta"];
  const G = [0, 1, 2].map(() => fadeIn(V.g(ph)));
  Object.values(CATS).forEach(b => boxR(G[lvl(b)], b, cols[lvl(b)], 4));
  const L = [["P3 (stride 8)", "small objects"], ["P4 (stride 16)", "medium objects"], ["P5 (stride 32)", "large objects"]].map(([a, b], i) => {
    const g = fadeIn(V.g(svg));
    V.rect(g, 520, 60 + i * 95, 30, 30, "", { style: `fill:var(--${cols[i]})` });
    V.text(g, 570, 75 + i * 95, `${a}: ${b}`, { size: 22, anchor: "start", weight: 700 });
    return g;
  });
  V.text(svg, 905, 365, "each object is predicted on the level whose cells match its size:\nlevel = 4 + log₂(√($w$ · $h$) / 224)  (FPN paper, rounded and clipped)", { size: 21, cls: "muted" });
  return { steps: 2, set(s) { G.forEach((g, i) => V.show(g, i <= s)); L.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.panBifpn = host => {
  const svg = V.svg(host, 1400, 430);
  const col = (p, x, n) => range(3).map(i => { const c = [x, 340 - i * 120]; V.circle(p, c[0], c[1], 22, { style: `fill:var(--${n})` }); return c; });
  const panel = (x, title, sub) => { const g = fadeIn(V.g(svg)); V.text(g, x + 140, 22, title, { size: 23, weight: 700 }); V.text(g, x + 140, 412, sub, { size: 22, cls: "muted" }); return g; };
  const A = panel(0, "FPN", "top-down only");
  const a0 = col(A, 60, "blue"), a1 = col(A, 230, "green");
  a0.forEach((c, i) => V.arrow(A, c[0] + 26, c[1], a1[i][0] - 28, a1[i][1]));
  [2, 1].forEach(i => V.arrow(A, a1[i][0], a1[i][1] + 26, a1[i - 1][0], a1[i - 1][1] - 28, "green"));
  const B = panel(460, "PANet", "+ a bottom-up path");
  const b0 = col(B, 500, "blue"), b1 = col(B, 650, "green"), b2 = col(B, 800, "orange");
  b0.forEach((c, i) => { V.arrow(B, c[0] + 26, c[1], b1[i][0] - 28, b1[i][1]); V.arrow(B, b1[i][0] + 26, b1[i][1], b2[i][0] - 28, b2[i][1]); });
  [2, 1].forEach(i => V.arrow(B, b1[i][0], b1[i][1] + 26, b1[i - 1][0], b1[i - 1][1] - 28, "green"));
  [0, 1].forEach(i => V.arrow(B, b2[i][0], b2[i][1] - 26, b2[i + 1][0], b2[i + 1][1] + 28, "orange"));
  const C = panel(970, "BiFPN", "weighted ($w$_1 P + $w$_2 Q), repeated ×N");
  const c0 = col(C, 980, "blue"), c1 = col(C, 1110, "green"), c2 = col(C, 1240, "orange");
  c0.forEach((c, i) => { V.arrow(C, c[0] + 26, c[1], c1[i][0] - 28, c1[i][1]); V.arrow(C, c1[i][0] + 26, c1[i][1], c2[i][0] - 28, c2[i][1]); V.curveArrow(C, `M${c[0] + 20},${c[1] - 14} Q${c1[i][0]},${c[1] - 60} ${c2[i][0] - 22},${c2[i][1] - 16}`, "muted"); });
  [2, 1].forEach(i => V.arrow(C, c1[i][0], c1[i][1] + 26, c1[i - 1][0], c1[i - 1][1] - 28, "green"));
  [0, 1].forEach(i => V.arrow(C, c2[i][0], c2[i][1] - 26, c2[i + 1][0], c2[i + 1][1] + 28, "orange"));
  // (weights are named in the subtitle)
  return { steps: 2, set(s) { V.show(A, true); V.show(B, s >= 1); V.show(C, s >= 2); } };
};

/* ------------------------------------------------------------ Part 6 */
VIZ.segTypes = host => {
  const svg = V.svg(host, 1400, 430);
  const P = [["input", "apples2-input.png", ""], ["semantic", "apples2-semantic.png", "one label per pixel:\nall apples are “apple”"], ["instance", "apples2-instance.png", "each apple is a separate\nobject with its own mask"]].map(([t, f, n], i) => {
    const g = fadeIn(V.g(svg)), x = 20 + i * 460;
    V.text(g, x + 160, 20, t, { size: 23, weight: 700 });
    photo(g, f, x, 40, 320, 320);
    V.text(g, x + 160, 398, n, { size: 22, cls: "muted" });
    return g;
  });
  return { steps: 2, set(s) { P.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.segExamples = host => {
  const svg = V.svg(host, 1400, 440);
  const bil = fadeIn(V.g(svg));
  V.text(bil, 700, 22, "steel billet: one thin crack class", { size: 22, weight: 700 });
  photo(bil, "billet-input.png", 100, 50, 1300, 127); photo(bil, "billet-target.png", 100, 200, 1300, 127);
  V.text(bil, 88, 113, "image", { size: 22, anchor: "end" }); V.text(bil, 88, 263, "target", { size: 22, anchor: "end" });
  V.text(bil, 750, 380, "a 1-pixel-wide structure in a 857-pixel-wide image: almost every pixel is background", { size: 22, cls: "muted" });
  const app = [1, 3].map(k => {
    const g = fadeIn(V.g(svg));
    V.text(g, 700, 22, "apples in a tree: input, annotation, network output", { size: 22, weight: 700 });
    ["input", "target", "output"].forEach((n, i) => { photo(g, `apples${k}-${n}.png`, 120 + i * 400, 50, 340, 340); V.text(g, 290 + i * 400, 418, n, { size: 23, weight: 700 }); });
    return g;
  });
  return { steps: 2, set(s) { V.show(bil, s === 0); app.forEach((g, i) => V.show(g, s === i + 1)); } };
};

VIZ.pixelSoftmax = host => {
  const svg = V.svg(host, 1400, 460), n = 6, s = 52;
  const L = [[], [], []]; let seed = 3; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const apple = Math.hypot(r - 2.2, c - 2.4) < 1.9, leaf = !apple && c > 3 && r < 3;
    L[0].push(+(1.2 + rnd() - (apple ? 2.4 : 0) - (leaf ? 1.6 : 0)).toFixed(1));
    L[1].push(+((apple ? 2.6 : -1) + rnd()).toFixed(1));
    L[2].push(+((leaf ? 2.2 : -.8) + rnd()).toFixed(1));
  }
  const names = [["background", "muted"], ["apple", "magenta"], ["leaf", "green"]];
  L.forEach((m, k) => {
    const ox = 10 + k * 340;
    V.text(svg, ox + n * s / 2, 20, `logits: ${names[k][0]}`, { size: 22, weight: 700, fill: `var(--${names[k][1]})` });
    m.forEach((v, i) => { V.rect(svg, ox + (i % n) * s, 42 + Math.floor(i / n) * s, s, s, "", { style: `fill:var(--${names[k][1]});fill-opacity:${Math.max(.05, Math.min(.85, (v + 1.5) / 5))};stroke:#fff` }); V.text(svg, ox + (i % n) * s + s / 2, 42 + Math.floor(i / n) * s + s / 2, v, { size: 20 }); });
  });
  const pix = 14, pr = Math.floor(pix / n), pc = pix % n;
  const hl = fadeIn(V.g(svg));
  L.forEach((m, k) => V.rect(hl, 10 + k * 340 + pc * s, 42 + pr * s, s, s, "", { style: "fill:none;stroke:var(--ink);stroke-width:4" }));
  const z = L.map(m => m[pix]), e = z.map(Math.exp), S = e.reduce((a, b) => a + b);
  V.text(hl, 506, 392, `one pixel: logits (${z.join(", ")}) → softmax → (${e.map(v => (v / S).toFixed(2)).join(", ")})`, { size: 22 });
  const am = fadeIn(V.g(svg));
  V.text(am, 1080 + n * s / 2, 20, "argmax per pixel", { size: 22, weight: 700 });
  for (let i = 0; i < n * n; i++) { const k = [0, 1, 2].reduce((b, q) => L[q][i] > L[b][i] ? q : b, 0); V.rect(am, 1080 + (i % n) * s, 42 + Math.floor(i / n) * s, s, s, "", { style: `fill:var(--${names[k][1]});fill-opacity:.7;stroke:#fff` }); }
  V.text(am, 700, 440, "output tensor $C$ × $H$ × $W$ → softmax over $C$ at every pixel → class map $H$ × $W$", { size: 22, weight: 700, fill: "var(--blue)" });
  return { steps: 2, set(st) { V.show(hl, st >= 1); V.show(am, st >= 2); } };
};

VIZ.coarse = host => {
  const svg = V.svg(host, 1400, 440);
  const P = [["annotation", "apples2-target.png"], ["predicted at stride 32\n(10 × 10), upsampled", "apples2-mask-s32.png"], ["predicted at stride 8\n(41 × 41), upsampled", "apples2-mask-s8.png"]].map(([t, f], i) => {
    const g = fadeIn(V.g(svg)), x = 40 + i * 460;
    photo(g, f, x, 66, 320, 320); V.text(g, x + 160, 28, t, { size: 22, weight: 700 }); return g;
  });
  V.text(svg, 700, 420, "the backbone alone ends at stride 32: far too coarse for object boundaries", { size: 22, cls: "muted" });
  return { steps: 2, set(s) { P.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.upsample = host => {
  const svg = V.svg(host, 1400, 460);
  const draw = (p, ox, oy, M, s, col, fs) => M.forEach((row, r) => row.forEach((v, c) => {
    V.rect(p, ox + c * s, oy + r * s, s, s, "", { style: `fill:var(--${col});fill-opacity:${.1 + .7 * (v - 1) / 3};stroke:#fff;stroke-width:2` });
    V.text(p, ox + c * s + s / 2, oy + r * s + s / 2, v, { size: fs });
  }));
  V.text(svg, 180, 60, "input 2 × 2", { size: 22, weight: 700 }); draw(svg, 110, 90, [[1, 3], [2, 4]], 70, "blue", 24);
  const A = fadeIn(V.g(svg));
  V.text(A, 448, 24, "nearest neighbour", { size: 22, weight: 700 });
  draw(A, 320, 50, [[1, 1, 3, 3], [1, 1, 3, 3], [2, 2, 4, 4], [2, 2, 4, 4]], 64, "blue", 22);
  V.text(A, 448, 338, "blocky, no parameters", { size: 21, cls: "muted" });
  const B = fadeIn(V.g(svg));
  V.text(B, 768, 24, "bilinear", { size: 22, weight: 700 });
  draw(B, 640, 50, [[1, 1.5, 2.5, 3], [1.25, 1.75, 2.75, 3.25], [1.75, 2.25, 3.25, 3.75], [2, 2.5, 3.5, 4]], 64, "blue", 21);
  V.text(B, 768, 338, "smooth, no parameters", { size: 21, cls: "muted" });
  const C = fadeIn(V.g(svg));
  V.text(C, 1124, 24, "transposed conv (3 × 3, stride 2)", { size: 22, weight: 700 });
  const cnt = [1, 1, 2, 1, 2, 1, 1], cs = 44;
  cnt.forEach((a, r) => cnt.forEach((b, c) => { const v = a * b; V.rect(C, 970 + c * cs, 50 + r * cs, cs, cs, "", { style: `fill:var(--magenta);fill-opacity:${v / 5};stroke:#fff` }); V.text(C, 970 + c * cs + cs / 2, 50 + r * cs + cs / 2, v, { size: 22 }); }));
  V.text(C, 1124, 412, "learned, but kernel overlaps differ\n(1, 2, 4 contributions) → checkerboard\nartifacts; resize + conv avoids them", { size: 21, cls: "muted" });
  return { steps: 3, set(s) { V.show(A, s >= 1); V.show(B, s >= 2); V.show(C, s >= 3); } };
};

VIZ.unet = host => {
  const svg = V.svg(host, 1400, 470);
  const CH = [64, 128, 256, 512, 1024], RES = [256, 128, 64, 32, 16];
  const yL = l => 50 + l * 72, xE = l => 165 + l * 112, xD = l => 1160 - l * 112, w = c => 12 + Math.log2(c) * 4;
  const enc = fadeIn(V.g(svg)), dec = fadeIn(V.g(svg)), skip = fadeIn(V.g(svg)), out = fadeIn(V.g(svg));
  const xB = (xE(4) + xD(4)) / 2;           // bottleneck sits between both paths
  const blk = (g, x, y, c, col, n = 2) => { for (let k = 0; k < n; k++) V.rect(g, x + k * (w(c) + 4), y, w(c), 50, "", { style: `fill:var(--${col}-soft);stroke:var(--${col});stroke-width:2` }); };
  CH.forEach((c, l) => {
    if (l === 4) {
      blk(dec, xB - w(c) - 2, yL(4), c, "violet");
      V.text(dec, xB, yL(4) + 72, `bottleneck ${c} × ${RES[4]}²`, { size: 21, cls: "muted" });
      return;
    }
    blk(enc, xE(l) - w(c), yL(l), c, "blue");
    V.text(enc, xE(l) - w(c) - 8, yL(l) + 27, `${c} × ${RES[l]}²`, { size: 21, anchor: "end", cls: "muted" });
    V.arrow(enc, xE(l), yL(l) + 55, l === 3 ? xB - 30 : xE(l + 1) - 10, yL(l + 1) - 4, "red");
    blk(dec, xD(l) - w(c), yL(l), c, "green");
    V.arrow(dec, l === 3 ? xB + 30 : xD(l + 1), yL(l + 1) - 4, xD(l) + 10, yL(l) + 55, "green");
    V.curveArrow(skip, `M${xE(l) + w(c) + 14},${yL(l) + 25} L${xD(l) - w(c) - 12},${yL(l) + 25}`, "muted", { "stroke-dasharray": "8 6" });
  });
  V.text(skip, xB, yL(0) + 2, "copy + concatenate", { size: 21, fill: "var(--muted)", weight: 700 });
  V.box(out, 1245, yL(0) - 8, 155, 66, "1 × 1 conv\n~→ $C$ classes", "box good", { size: 24 });
  V.arrow(out, xD(0) + w(64) + 10, yL(0) + 25, 1239, yL(0) + 25);
  const T = ["", "encoder: resolution ↓, semantics ↑ (often a pretrained backbone)", "decoder: back to full resolution, but boundaries stay blurry", "skips concatenate fine encoder maps: sharp boundaries", "1 × 1 conv gives $C$ logits per pixel at input resolution"];
  const t = V.text(svg, xB, 455, "", { size: 22, weight: 700, fill: "var(--blue)" });
  return { steps: 4, set(s) { V.show(enc, s >= 1); V.show(dec, s >= 2); V.show(skip, s >= 3); V.show(out, s >= 4); V.setText(t, T[s]); } };
};

VIZ.maskrcnn = flow({
  w: 1400, h: 370, nodes: [
    { id: "b", x: 0, y: 125, w: 210, h: 90, label: "backbone + FPN", cls: "blue" },
    { id: "r", x: 270, y: 125, w: 150, h: 90, label: "RPN" },
    { id: "a", x: 480, y: 120, w: 200, h: 100, label: "RoI Align\n~14 × 14", size: 24 },
    { id: "h1", x: 745, y: 15, w: 380, h: 95, label: "box head: class + box offsets", cls: "mut", size: 23 },
    { id: "h2", x: 745, y: 225, w: 380, h: 100, label: "mask head: 4 convs + upsample\n~28 × 28 mask per class", cls: "good", step: 1, size: 24 },
    { id: "o", x: 1180, y: 120, w: 220, h: 100, label: "box + class\n+ mask per object", step: 1, size: 23 }],
  edges: [{ a: "b", b: "r" }, { a: "r", b: "a" }, { a: "a", b: "h1" }, { a: "a", b: "h2", step: 1 }, { a: "h1", b: "o", step: 1 }, { a: "h2", b: "o", step: 1 }],
  texts: [{ x: 700, y: 358, t: "Mask R-CNN = Faster R-CNN + a small mask branch; the mask is pasted back into the box", step: 1, size: 22 }],
});

VIZ.segMetrics = host => {
  const svg = V.svg(host, 1400, 430), s = 26, W = 20, H = 10;
  const gt = new Set([92, 93, 112, 113]);
  const preds = [new Set(), new Set([92, 93, 112, 113, 94, 114]), new Set([93, 113])];
  const T = ["ground truth: 4 of 200 pixels (2 %) are defect", "prediction A: “all background”", "prediction B: over-segments", "prediction C: misses half"];
  const G = V.g(svg);
  const draw = k => {
    G.innerHTML = "";
    for (let i = 0; i < W * H; i++) {
      const g = gt.has(i), p = k ? preds[k - 1].has(i) : false;
      const fill = !k ? (g ? "var(--magenta)" : "#eef1f3") : g && p ? "var(--green)" : g ? "var(--red)" : p ? "var(--orange)" : "#eef1f3";
      V.rect(G, 60 + (i % W) * s, 60 + Math.floor(i / W) * s, s, s, "", { style: `fill:${fill};stroke:#fff` });
    }
  };
  const lbl = V.text(svg, 320, 30, "", { size: 22, weight: 700 });
  const m = V.g(svg);
  V.text(svg, 320, 368, "green = hit, red = missed, orange = false alarm", { size: 21, cls: "muted" });
  const metrics = k => {
    m.innerHTML = ""; if (!k) return;
    const P = preds[k - 1]; let tp = 0; P.forEach(i => tp += gt.has(i));
    const fp = P.size - tp, fn = gt.size - tp, acc = (W * H - fp - fn) / (W * H), io = tp / (tp + fp + fn), dice = 2 * tp / (2 * tp + fp + fn);
    [["pixel accuracy", (acc * 100).toFixed(0) + " %", acc > .97 && io < .3 ? "red" : "ink"], ["IoU", io.toFixed(2), "ink"], ["Dice", dice.toFixed(2), "ink"]].forEach(([n, v, c], i) => {
      V.text(m, 900, 110 + i * 70, n, { size: 22, anchor: "end" }); V.text(m, 930, 110 + i * 70, v, { size: 28, weight: 700, anchor: "start", fill: `var(--${c})` });
    });
    if (k === 1) V.text(m, 1050, 330, "99 % accuracy, zero defects found", { size: 21, fill: "var(--red)", weight: 700 });
  };
  return { steps: 3, set(k) { draw(k); V.setText(lbl, T[k]); metrics(k); } };
};

/* ------------------------------------------------------------ Part 7 */
VIZ.se = host => {
  const svg = V.svg(host, 1400, 440);
  const w = [.9, .2, .7, .1, .55, .35], cols = ["blue", "orange", "magenta", "green", "violet", "red"];
  const slabs = w.map((_, i) => V.rect(svg, 40 + i * 24, 120 - i * 14 + 60, 130, 130, "", { style: `fill:var(--${cols[i]}-soft);stroke:var(--${cols[i]});stroke-width:2;transition:opacity .6s` }));
  V.text(svg, 155, 400, "$C$ × $H$ × $W$ feature map", { size: 22 });
  const sq = fadeIn(V.g(svg));
  V.arrow(sq, 300, 240, 380, 240); V.text(sq, 340, 214, "GAP", { size: 22, weight: 700 });
  w.forEach((_, i) => V.rect(sq, 400, 160 + i * 28, 24, 24, "", { style: `fill:var(--${cols[i]})` }));
  V.text(sq, 420, 365, "squeeze:\n$C$ numbers", { size: 22 });
  const ex = fadeIn(V.g(svg));
  V.arrow(ex, 440, 240, 492, 240);
  V.box(ex, 500, 195, 325, 90, "FC → ReLU → FC → sigmoid\n~small bottleneck MLP", "box blue", { size: 24 });
  V.arrow(ex, 830, 240, 880, 240);
  w.forEach((v, i) => { V.rect(ex, 890, 166 + i * 28, v * 160, 22, "", { style: `fill:var(--${cols[i]})` }); V.text(ex, 900 + v * 160, 177 + i * 28, v.toFixed(2), { size: 21, anchor: "start" }); });
  V.text(ex, 975, 400, "excite: one weight per channel", { size: 22 });
  const sc = fadeIn(V.g(svg));
  V.text(sc, 1260, 150, "scale: multiply each\nchannel by its weight", { size: 22, weight: 700 });
  V.text(sc, 1260, 285, "the network learns\n“which” features matter\nfor this image", { size: 22, cls: "muted" });
  return { steps: 3, set(s) { V.show(sq, s >= 1); V.show(ex, s >= 2); V.show(sc, s >= 3); slabs.forEach((r, i) => r.style.opacity = s >= 3 ? .15 + .85 * w[i] : 1); } };
};

VIZ.spatial = host => {
  const svg = V.svg(host, 1400, 450), n = 8, s = 24;
  const val = (r, c, k) => Math.max(0, Math.min(1, .15 + .8 * Math.exp(-((r - 4.5 + k * .3) ** 2 + (c - 3 + k * .2) ** 2) / 4) + .12 * Math.sin(r * 2 + c * k)));
  const map = (p, ox, oy, f, col) => { for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) V.rect(p, ox + c * s, oy + r * s, s, s, "", { style: `fill:var(--${col});fill-opacity:${f(r, c).toFixed(2)};stroke:#fff` }); };
  [0, 1, 2].forEach(k => map(svg, 30 + k * 18, 150 - k * 16, (r, c) => val(r, c, k), "blue"));
  V.text(svg, 150, 385, "feature map ($C$ channels)", { size: 22 });
  const A = fadeIn(V.g(svg));
  V.arrow(A, 290, 210, 380, 130); V.arrow(A, 290, 240, 380, 330);
  V.text(A, 486, 14, "mean over channels", { size: 22 }); map(A, 390, 30, (r, c) => (val(r, c, 0) + val(r, c, 1) + val(r, c, 2)) / 3, "violet");
  V.text(A, 486, 237, "max over channels", { size: 22 }); map(A, 390, 254, (r, c) => Math.max(val(r, c, 0), val(r, c, 1), val(r, c, 2)), "violet");
  const B = fadeIn(V.g(svg));
  V.arrow(B, 600, 230, 690, 230); V.box(B, 700, 185, 200, 90, "conv 7 × 7\n→ sigmoid", "box blue", { size: 23 });
  V.arrow(B, 905, 230, 975, 230);
  map(B, 985, 134, (r, c) => Math.exp(-((r - 4.5) ** 2 + (c - 3) ** 2) / 5), "magenta"); V.text(B, 1081, 365, "where to look:\none weight per pixel", { size: 22 });
  const C = fadeIn(V.text(svg, 1290, 230, "× feature\nmap", { size: 23, weight: 700 }));
  return { steps: 3, set(st) { V.show(A, st >= 1); V.show(B, st >= 2); V.show(C, st >= 3); } };
};

VIZ.cbam = flow({
  w: 1400, h: 260, nodes: [
    { id: "i", x: 0, y: 75, w: 170, h: 100, label: "features", size: 24 },
    { id: "c", x: 235, y: 65, w: 370, h: 120, label: "channel attention\n~“what”: like SE, with avg + max", cls: "blue", size: 24 },
    { id: "s", x: 670, y: 65, w: 370, h: 120, label: "spatial attention\n~“where”: 7 × 7 conv map", cls: "blue", step: 1, size: 24 },
    { id: "o", x: 1105, y: 75, w: 295, h: 100, label: "refined features", cls: "good", step: 1, size: 24 }],
  edges: [{ a: "i", b: "c" }, { a: "c", b: "s", step: 1 }, { a: "s", b: "o", step: 1 }],
  texts: [{ x: 700, y: 238, t: "CBAM (2018): a few thousand extra parameters, inserted after any conv block", step: 2, size: 22 }],
});

VIZ.selfAtt = host => {
  const svg = V.svg(host, 1400, 430), n = 7, s = 52;
  const panel = (ox, title) => { V.text(svg, ox + n * s / 2, 20, title, { size: 22, weight: 700 }); for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) V.rect(svg, ox + c * s, 40 + r * s, s, s, "cell"); };
  panel(60, "convolution: a 3 × 3 neighbourhood"); panel(640, "self-attention: every position");
  const A = V.g(svg), B = V.g(svg);
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const feat = range(n * n).map(() => [rnd(), rnd()]);
  const draw = (qr, qc) => {
    A.innerHTML = ""; B.innerHTML = "";
    V.rect(A, 60 + (qc - 1) * s, 40 + (qr - 1) * s, 3 * s, 3 * s, "", { style: "fill:var(--blue);fill-opacity:.25;stroke:var(--blue);stroke-width:3" });
    V.rect(A, 60 + qc * s, 40 + qr * s, s, s, "", { style: "fill:var(--blue)" });
    const q = feat[qr * n + qc];
    const sc = feat.map(f => Math.exp(4 * (f[0] * q[0] + f[1] * q[1])));
    const Z = sc.reduce((a, b) => a + b);
    feat.forEach((_, i) => {
      const a = sc[i] / Z * n * n * .35;
      V.line(B, 640 + qc * s + s / 2, 40 + qr * s + s / 2, 640 + (i % n) * s + s / 2, 40 + Math.floor(i / n) * s + s / 2, { style: "stroke:var(--magenta)", "stroke-width": 1 + 3 * a, opacity: Math.min(1, a) });
    });
    V.rect(B, 640 + qc * s, 40 + qr * s, s, s, "", { style: "fill:var(--magenta)" });
  };
  V.text(svg, 1240, 140, "weights depend on\nthe content of both\npositions", { size: 22 });
  V.text(svg, 1240, 305, "cost grows with\n($H$ · $W$)² — why\ntransformers use patches", { size: 22, cls: "muted" });
  const Q = [[3, 3], [1, 5], [5, 1], [4, 4], [2, 2]]; let last = -1;
  const lp = V.loop(t => { const k = Math.floor(t / 1.5) % Q.length; if (k !== last) { last = k; draw(...Q[k]); } });
  draw(3, 3);
  return { start() { last = -1; lp.start(); }, stop: lp.stop };
};

VIZ.decision = flow({
  w: 1400, h: 420, nodes: [
    { id: "o", x: 0, y: 175, w: 210, h: 100, label: "1. what is the\noutput?", cls: "blue" },
    { id: "s", x: 290, y: 175, w: 230, h: 100, label: "2. smallest object\nvs. stride?", step: 1 },
    { id: "b", x: 600, y: 175, w: 220, h: 100, label: "3. latency and\nmemory budget?", step: 2 },
    { id: "m", x: 900, y: 175, w: 220, h: 100, label: "4. pick the\nsimplest model", cls: "good", step: 3 },
    { id: "v", x: 1180, y: 175, w: 220, h: 100, label: "5. validate on\nyour errors", cls: "good", step: 4 }],
  edges: [{ a: "o", b: "s", step: 1 }, { a: "s", b: "b", step: 2 }, { a: "b", b: "m", step: 3 }, { a: "m", b: "v", step: 4 }],
  texts: [{ x: 0, y: 80, t: "label → classification head\nboxes → detector\nmask → U-Net / Mask R-CNN\nsimilarity → embedding", size: 21, anchor: "start" },
  { x: 405, y: 342, t: "small → higher input resolution,\ntiling, or P3 / P2 level", size: 21, step: 1 },
  { x: 710, y: 92, t: "edge device → MobileNet,\nEfficientNet; server → ResNet,\nlarger detectors", size: 21, step: 2 },
  { x: 1010, y: 342, t: "pretrained backbone,\nstandard neck and head", size: 21, step: 3 },
  { x: 1290, y: 355, t: "error catalogue\n(lecture 1) drives\nthe next change", size: 21, step: 4 }],
});

VIZ.readDiagram = host => {
  const svg = V.svg(host, 1400, 440);
  const N = [["input", "3 × 256 × 256"], ["conv 7 × 7, stride 2, 64", "64 × 128 × 128"], ["max-pool 2 × 2", "64 × 64 × 64"], ["conv 3 × 3, stride 2, 128", "128 × 32 × 32"], ["upsample × 2", "128 × 64 × 64"], ["concat with ③", "192 × 64 × 64"], ["conv 1 × 1, 2 classes", "2 × 64 × 64"]];
  const ans = [];
  N.forEach(([op, sh], i) => {
    const x = 20 + i * 196;
    V.box(svg, x, 115, 176, 100, op.replace(", ", ",\n").replace(" with", "\nwith").replace("max-pool ", "max-pool\n").replace("upsample ", "upsample\n"), "box " + (i === 0 ? "mut" : i === 6 ? "good" : ""), { size: 22 });
    if (i) V.arrow(svg, x - 18, 165, x - 4, 165);
    const q = V.text(svg, x + 88, 247, i ? "?" : sh, { size: 21, weight: 700, fill: "var(--muted)" }); q.style.transition = "opacity .3s";
    const a = fadeIn(V.g(svg)); V.rect(a, x + 2, 228, 172, 38, "", { rx: 5, style: "fill:var(--blue-soft)" }); V.text(a, x + 88, 247, sh, { size: 21, weight: 700, fill: "var(--blue)" });
    V.text(svg, x + 88, 92, ["①", "②", "③", "④", "⑤", "⑥", "⑦"][i], { size: 23, cls: "muted" });
    a._q = q; ans.push(a);
  });
  V.curveArrow(svg, "M500,270 Q794,345 1080,272", "muted", { "stroke-dasharray": "7 6" });
  V.text(svg, 794, 333, "skip", { size: 21, cls: "muted" });
  V.text(svg, 700, 385, "for every node write $C$ × $H$ × $W$; for every merge decide: add (shapes equal) or concat (channels sum)", { size: 22 });
  V.text(svg, 700, 425, "the output is 4× smaller than the input: is that acceptable for the smallest object?", { size: 22, fill: "var(--blue)", weight: 700 });
  return { steps: 6, set(s) { ans.forEach((a, i) => { const on = i > 0 && i <= s; V.show(a, on); if (i) V.show(a._q, !on); }); } };
};

VIZ.history = host => {
  const svg = V.svg(host, 1400, 400);
  const Y = [2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020], X = y => 135 + (y - 2012) * 147;
  V.path(svg, `M${X(2012) - 30},200 L${X(2020) + 40},200`, "axis", { "marker-end": "url(#ah-muted)" });
  const E = [[2012, "AlexNet", "deep CNNs win ImageNet"], [2014, "VGG · Inception", "depth, multi-branch"], [2015, "ResNet · U-Net\nFaster R-CNN", "residuals, decoders, RPN"],
  [2016, "YOLO · SSD\nDenseNet", "one-stage detection"], [2017, "FPN · Mask R-CNN\nRetinaNet", "pyramids, focal loss"], [2018, "SE · CBAM\nMobileNetV2", "attention, efficiency"],
  [2019, "EfficientNet", "compound scaling"], [2020, "ViT · DETR", "transformers enter vision"]];
  const G = E.map(([y, n, d], i) => {
    const g = fadeIn(V.g(svg)), up = i % 2 === 0, x = X(y);
    V.circle(g, x, 200, 9, { style: "fill:var(--blue)" }); V.line(g, x, 200, x, up ? 140 : 260, { style: "stroke:var(--blue)" });
    V.text(g, x, up ? 50 : 350, `${y}`, { size: 21, cls: "muted" });
    V.text(g, x, up ? 104 : 296, n, { size: 21, weight: 700 }); V.text(g, x, up ? 20 : 380, d, { size: 20, cls: "muted" });
    return g;
  });
  return { steps: 3, set(s) { const lim = [2, 4, 6, 8][s]; G.forEach((g, i) => V.show(g, i < lim)); } };
};

VIZ.summary2 = flow({
  w: 1405, h: 200, nodes: [
    { id: "a", x: 0, y: 30, w: 340, h: 140, label: "**BACKBONE**\n~depth via residuals,\n~efficiency via separable convs", cls: "blue", size: 24 },
    { id: "b", x: 355, y: 30, w: 340, h: 140, label: "**NECK**\n~multi-scale fusion:\n~FPN, PANet, BiFPN", step: 1, size: 24 },
    { id: "c", x: 710, y: 30, w: 340, h: 140, label: "**HEAD**\n~shapes the output:\n~label, boxes, mask, embedding", step: 2, size: 24 },
    { id: "d", x: 1065, y: 30, w: 340, h: 140, label: "**CHOICE**\n~driven by output, scale,\n~budget, and errors", cls: "good", step: 3, size: 24 }],
});

VIZ.next3d = flow({
  w: 1400, h: 220, nodes: [
    { id: "a", x: 0, y: 55, w: 305, h: 110, label: "CNNs on one image\n~2D outputs (lectures 1–2)", size: 24 },
    { id: "b", x: 365, y: 55, w: 305, h: 110, label: "camera models,\n~multi-view geometry", cls: "blue", size: 24 },
    { id: "c", x: 730, y: 55, w: 305, h: 110, label: "conventional\n~visual SLAM", cls: "blue", size: 24 },
    { id: "d", x: 1095, y: 55, w: 305, h: 110, label: "learned 3D / 4D\n~reconstruction (later)", cls: "good", size: 24 }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }, { a: "c", b: "d" }],
});
