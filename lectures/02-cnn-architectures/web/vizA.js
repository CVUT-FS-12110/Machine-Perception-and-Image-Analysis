/* Lecture 2 — visuals for Part 1 (one network, many tasks) and Part 2 (backbones). */
"use strict";

const IMG = "../assets/";
const NAT = {
  "cats-crowd.jpg": [1024, 1024], "cat-grass.jpg": [273, 348], "cats-window.jpg": [441, 607], "cat-tabby.jpg": [410, 541],
  "apples2-input.png": [331, 331], "apples2-target.png": [331, 331], "apples2-semantic.png": [331, 331], "apples2-instance.png": [331, 331],
  "apples2-mask-s32.png": [331, 331], "apples2-mask-s8.png": [331, 331], "billet-input.png": [857, 84], "billet-target.png": [857, 84],
};
["1", "2", "3"].forEach(k => ["input", "target", "output"].forEach(n => { NAT[`apples${k}-${n}.png`] = [331, 331]; }));
/* Photo placed at (x,y,w,h); returns an inner <svg> whose coordinates are image pixels. */
function photo(p, file, x, y, w, h, vb) {
  const [W, H] = NAT[file];
  const s = V.el("svg", { x, y, width: w, height: h, viewBox: vb || `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid slice" }, p);
  V.el("image", { href: IMG + file, width: W, height: H }, s);
  return s;
}
/* Tensor drawn as a block: channels = length, spatial size = height. */
function tb(p, x, yc, len, h, color, name, shape, o = {}) {
  const g = cuboid(p, x, yc - h / 2 + h * .12, len, h, h * .5, color);
  const cx = x + len / 2 + h * .14;
  if (name) V.text(p, cx, o.ly || 395, name, { size: 20, weight: 700 });
  if (shape) V.text(p, cx, (o.ly || 395) + 27, shape, { size: 18, cls: "muted" });
  g.x2 = x + len + h * .5 * .55; g.cx = cx;
  return g;
}
const fadeIn = e => { e.classList.add("fade"); return e; };
const hbar = (p, x, y, h, color) => V.rect(p, x, y, 0, h, "", { style: `fill:var(--${color});transition:width .9s ease` });
/* Animate a path being drawn (CSS stroke-dashoffset). */
function drawable(path) {
  const L = path.getTotalLength ? path.getTotalLength() : 2000;
  path.style.strokeDasharray = L; path.style.strokeDashoffset = L; path.style.transition = "stroke-dashoffset 1.4s ease";
  return on => { path.style.strokeDashoffset = on ? 0 : L; };
}

/* ------------------------------------------------------------ Part 1 */
VIZ.goals2 = flow({
  w: 1300, h: 200, nodes: [
    { id: "a", x: 0, y: 40, w: 370, h: 120, label: "**READ ARCHITECTURES**\n~as tensors flowing through blocks", cls: "blue" },
    { id: "b", x: 465, y: 40, w: 370, h: 120, label: "**CHOOSE BLOCKS**\n~backbone, neck, head" },
    { id: "c", x: 930, y: 40, w: 370, h: 120, label: "**MATCH THE TASK**\n~output structure, scale, budget", cls: "good" }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }],
});

VIZ.roadmap2 = flow({
  w: 1400, h: 260, nodes: [
    ["1", "**1 One network,**\n**many tasks**", "blue"], ["2", "**2 Backbones**"], ["3", "**3 Heads**"], ["4", "**4 Detection**"],
    ["5", "**5 Multi-scale**\n**necks**"], ["6", "**6 Segmentation**"], ["7", "**7 Attention and**\n**design**", "good"]]
    .map(([id, label, cls], i) => ({ id, x: i * 204, y: 30, w: 176, h: 110, label, cls, size: 20 })),
  edges: ["1", "2", "3", "4", "5", "6"].map(a => ({ a, b: String(+a + 1) })),
  texts: [["backbone, neck,\nhead"], ["VGG, ResNet,\nMobileNet"], ["classification,\nembeddings"], ["boxes, anchors,\nNMS"], ["FPN, PANet,\nBiFPN"], ["U-Net,\nMask R-CNN"], ["SE, CBAM,\nchoosing a model"]]
    .map(([t], i) => ({ x: 88 + i * 204, y: 195, t, size: 18 })),
});

VIZ.recap2 = host => {
  const svg = V.svg(host, 1400, 440);
  const B = [
    tb(svg, 20, 210, 10, 230, "muted", "input", "3 × 224 × 224"),
    tb(svg, 170, 210, 24, 150, "blue", "stage 1–2", "256 × 56 × 56"),
    tb(svg, 340, 210, 38, 100, "blue", "stage 3", "512 × 28 × 28"),
    tb(svg, 520, 210, 60, 66, "blue", "stage 4", "1024 × 14 × 14"),
    tb(svg, 730, 210, 96, 42, "blue", "stage 5", "2048 × 7 × 7")];
  const g = V.g(svg); V.rect(g, 1010, 110, 22, 200, "", { style: "fill:var(--orange-soft);stroke:var(--orange);stroke-width:2" });
  V.text(svg, 1021, 395, "GAP", { size: 20, weight: 700 }); V.text(svg, 1021, 422, "2048", { size: 18, cls: "muted" });
  V.box(svg, 1120, 175, 210, 70, "linear → logits", "box good", { size: 20 });
  [[B[0].x2 + 8, 162], [B[1].x2 + 8, 332], [B[2].x2 + 8, 512], [B[3].x2 + 8, 722], [B[4].x2 + 8, 1002], [1040, 1112]].forEach(([a, b]) => V.arrow(svg, a, 210, b, 210));
  const s1 = fadeIn(V.g(svg));
  V.path(s1, "M160,40 L160,25 L960,25 L960,40", "line", { style: "stroke:var(--blue);stroke-width:3" });
  V.text(s1, 560, 52, "feature extractor: resolution ↓, channels ↑ (strides 4, 8, 16, 32)", { size: 21, fill: "var(--blue)", weight: 700 });
  const s2 = fadeIn(V.g(svg));
  V.path(s2, "M995,355 L995,370 L1335,370 L1335,355", "line", { style: "stroke:var(--green);stroke-width:3" });
  V.text(s2, 1165, 300, "task-specific\npredictor", { size: 20, fill: "var(--green)", weight: 700 });
  return { steps: 2, set(s) { V.show(s1, s >= 1); V.show(s2, s >= 2); } };
};

const CATS = { A: [120, 460, 295, 660], B: [300, 505, 500, 690], C: [535, 570, 730, 770], D: [755, 645, 975, 900], E: [470, 810, 690, 1024], F: [205, 705, 420, 935], G: [0, 580, 150, 770], H: [110, 250, 250, 410], I: [235, 350, 380, 500], J: [840, 300, 1000, 470], K: [860, 485, 1024, 670], L: [605, 435, 760, 600], M: [450, 385, 610, 540], N: [0, 200, 115, 330] };
const boxR = (p, b, color = "blue", w = 4, extra = {}) => V.rect(p, b[0], b[1], b[2] - b[0], b[3] - b[1], "", Object.assign({ fill: "none", stroke: `var(--${color})`, "stroke-width": w, "vector-effect": "non-scaling-stroke" }, extra));

VIZ.tasks2 = host => {
  const svg = V.svg(host, 1400, 420);
  const T = [["CLASSIFICATION", "Is this a cat?", "$C$ class scores"], ["DETECTION", "Where are the cats?", "$N$ × (4 box + 1 score + $C$)\n$N$ varies per image"],
  ["SEGMENTATION", "Which pixels are apple?", "$C$ × $H$ × $W$ logits"], ["REGRESSION", "How many cats?", "one number"]];
  const P = T.map(([t, q, o], i) => {
    const g = fadeIn(V.g(svg)), x = i * 355;
    V.rect(g, x, 0, 320, 410, "cell", { rx: 8 });
    V.text(g, x + 160, 26, t, { size: 21, weight: 700 }); V.text(g, x + 160, 56, q, { size: 19, cls: "muted" });
    V.text(g, x + 160, 360, o, { size: 19, fill: "var(--blue)", weight: 700 });
    g._x = x; return g;
  });
  photo(P[0], "cat-tabby.jpg", 10, 80, 300, 240, "0 60 410 328");
  V.box(P[0], 95, 270, 130, 38, "cat 0.97", "box blue", { size: 19 });
  const det = photo(P[1], "cats-crowd.jpg", 365, 80, 300, 240, "60 420 960 800");
  "ABCDFGLKE".split("").forEach(k => boxR(det, CATS[k], "blue", 2.5));
  photo(P[2], "apples2-semantic.png", 720, 80, 300, 240, "0 30 331 265");
  const cnt = photo(P[3], "cats-crowd.jpg", 1075, 80, 300, 240, "0 0 1024 820");
  V.box(P[3], 1150, 270, 150, 38, "count ≈ 60", "box blue", { size: 19 });
  return { steps: 3, set(s) { P.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.reuse = host => {
  const svg = V.svg(host, 1400, 400);
  const left = V.g(svg);
  V.text(left, 300, 20, "train everything from scratch, per task", { size: 21, weight: 700, fill: "var(--red)" });
  ["classification", "detection", "segmentation"].forEach((t, i) => {
    const y = 60 + i * 110;
    V.box(left, 20, y, 120, 70, "data\n~large", "box bad", { size: 18 });
    V.box(left, 170, y, 230, 70, "backbone", "box", { size: 19 });
    V.box(left, 420, y, 160, 70, t, "box", { size: 18 });
    V.arrow(left, 143, y + 35, 164, y + 35); V.arrow(left, 403, y + 35, 414, y + 35);
  });
  const right = fadeIn(V.g(svg));
  V.text(right, 1050, 20, "reuse one pretrained backbone", { size: 21, weight: 700, fill: "var(--green)" });
  V.box(right, 720, 150, 120, 80, "ImageNet\n~1.3 M images", "box mut", { size: 18 });
  V.box(right, 870, 140, 230, 100, "backbone\n~pretrained once", "box blue");
  V.arrow(right, 843, 190, 864, 190);
  ["classification head", "detection head", "segmentation head"].forEach((t, i) => {
    const y = 60 + i * 110;
    V.box(right, 1160, y, 220, 70, t + "\n~small, task data", "box good", { size: 18 });
    V.arrow(right, 1103, 190, 1154, y + 35);
  });
  V.text(right, 1050, 385, "only the small head must be learned from the (small) task dataset", { size: 19, cls: "muted" });
  return { steps: 1, set(s) { V.show(right, s >= 1); left.style.opacity = s ? .45 : 1; } };
};

VIZ.bnh = flow({
  w: 1400, h: 330, nodes: [
    { id: "i", x: 0, y: 110, w: 150, h: 90, label: "image\n~3 × $H$ × $W$" },
    { id: "b", x: 250, y: 90, w: 260, h: 130, label: "**BACKBONE**\n~generic features\n~usually pretrained", cls: "blue", step: 1 },
    { id: "n", x: 640, y: 90, w: 250, h: 130, label: "**NECK**\n~combines scales\n~(optional)", step: 2 },
    { id: "h", x: 1020, y: 90, w: 230, h: 130, label: "**HEAD**\n~task-specific\n~output", cls: "good", step: 3 }],
  edges: [{ a: "i", b: "b", step: 1 }, { a: "b", b: "n", step: 2, label: "maps C3, C4, C5", lx: 575, ly: 75 },
  { a: "n", b: "h", step: 3, label: "fused maps", lx: 955, ly: 75 }],
  texts: [{ x: 1330, y: 155, t: "logits\nboxes\nmask", step: 3, cls: "", size: 20 },
  { x: 700, y: 300, t: "interfaces between blocks are tensors: their shapes, strides, and meaning", size: 21, step: 4 }],
});

VIZ.strides = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cat-tabby.jpg", 40, 40, 360, 360, "0 70 410 410");
  const grid = V.g(svg);
  const rows = [["C2", "4", "56 × 56", "256"], ["C3", "8", "28 × 28", "512"], ["C4", "16", "14 × 14", "1024"], ["C5", "32", "7 × 7", "2048"]];
  V.text(svg, 900, 30, "ResNet-50 feature maps for a 224 × 224 input", { size: 22, weight: 700 });
  ["level", "stride", "size", "channels"].forEach((h, j) => V.text(svg, 560 + j * 170, 80, h, { size: 20, cls: "muted", weight: 700 }));
  const R = rows.map((r, i) => {
    const g = V.g(svg); g.style.transition = "opacity .3s";
    const bg = V.rect(g, 490, 105 + i * 62, 690, 52, "", { rx: 6, style: "fill:var(--blue-soft);opacity:0;transition:opacity .3s" });
    r.forEach((v, j) => V.text(g, 560 + j * 170, 131 + i * 62, v, { size: 24, weight: j ? null : 700 }));
    g._bg = bg; return g;
  });
  const note = V.text(svg, 835, 400, "", { size: 21 });
  return {
    steps: 3, set(s) {
      const stride = [4, 8, 16, 32][s], n = 224 / stride;
      grid.innerHTML = "";
      for (let k = 1; k < n; k++) {
        const t = 40 + 360 * k / n;
        V.line(grid, t, 40, t, 400, { style: "stroke:#fff", "stroke-width": n > 30 ? .6 : 1.5, opacity: .8 });
        V.line(grid, 40, t, 400, t, { style: "stroke:#fff", "stroke-width": n > 30 ? .6 : 1.5, opacity: .8 });
      }
      V.rect(grid, 40 + 360 * Math.floor(n * .45) / n, 40 + 360 * Math.floor(n * .3) / n, 360 / n, 360 / n, "", { style: "fill:var(--magenta);fill-opacity:.55;stroke:var(--magenta);stroke-width:2" });
      R.forEach((g, i) => { g._bg.style.opacity = i === s ? 1 : 0; g.style.opacity = i === s ? 1 : .45; });
      V.setText(note, `one ${rows[s][0]} cell (magenta) summarizes a ${stride} × ${stride} pixel patch`);
    }
  };
};

/* ------------------------------------------------------------ Part 2 */
const BACKBONES = [
  ["AlexNet", 2012, .71, 61.1, 56.5], ["VGG-16", 2014, 15.5, 138.4, 71.6], ["GoogLeNet", 2014, 1.5, 6.6, 69.8],
  ["ResNet-50", 2015, 4.1, 25.6, 76.1], ["DenseNet-121", 2016, 2.9, 8.0, 74.4], ["MobileNetV2", 2018, .30, 3.5, 71.9], ["EfficientNet-B0", 2019, .39, 5.3, 77.7]];
VIZ.timeline = host => {
  const svg = V.svg(host, 1400, 450);
  const X = g => 140 + (Math.log10(g) + .7) / 2.0 * 1050, Y = a => 400 - (a - 54) / 26 * 360;
  plotAxes(svg, X, Y, .2, 20, 54, 82.5, "GFLOPs (log)", "ImageNet top-1 [%]");
  [.3, 1, 3, 10].forEach(g => V.text(svg, X(g), 425, g, { size: 18, cls: "muted" }));
  [60, 70, 80].forEach(a => { V.text(svg, X(.2) - 15, Y(a), a, { size: 18, cls: "muted", anchor: "end" }); V.line(svg, X(.2), Y(a), X(20), Y(a), { style: "stroke:var(--rule)", "stroke-dasharray": "4 6" }); });
  const groups = [[0], [1, 2], [3], [4], [5], [6]];
  const below = { "DenseNet-121": 1, "MobileNetV2": 1, "AlexNet": 1 };
  const G = BACKBONES.map(([n, yr, gf, p, a]) => {
    const g = fadeIn(V.g(svg)), r = 8 + Math.sqrt(p) * 2.4, b = below[n];
    V.circle(g, X(gf), Y(a), r, { style: `fill:var(--blue);fill-opacity:.25;stroke:var(--blue);stroke-width:2` });
    if (n === "AlexNet") {        // label to the right, away from the axis ticks
      V.text(g, X(gf) + r + 12, Y(a) - 10, n, { size: 20, weight: 700, anchor: "start" });
      V.text(g, X(gf) + r + 12, Y(a) + 12, `${yr} · ${p} M params`, { size: 16, cls: "muted", anchor: "start" });
      return g;
    }
    V.text(g, X(gf), b ? Y(a) + r + 20 : Y(a) - r - 30, n, { size: 20, weight: 700 });
    V.text(g, X(gf), b ? Y(a) + r + 42 : Y(a) - r - 9, `${yr} · ${p} M params`, { size: 16, cls: "muted" });
    return g;
  });
  V.text(svg, 1380, 20, "bubble area ∝ parameters\ntorchvision reference weights", { size: 16, cls: "muted", anchor: "end" });
  return { steps: 5, set(s) { groups.forEach((ix, k) => ix.forEach(i => V.show(G[i], k <= s))); } };
};

VIZ.vgg = host => {
  const svg = V.svg(host, 1400, 450);
  const S = [["input", 3, 224, ""], ["conv ×2", 64, 224, "64"], ["conv ×2", 128, 112, "128"], ["conv ×3", 256, 56, "256"], ["conv ×3", 512, 28, "512"], ["conv ×3", 512, 14, "512"]];
  let x = 10; const blocks = [];
  S.forEach(([n, c, r], i) => {
    const len = i ? 10 + c / 11 : 8, h = 60 + r * .8;
    const g = tb(svg, x, 210, len, h, i ? "blue" : "muted", n, `${c} × ${r}²`);
    blocks.push(g); x = g.x2 + (i < 5 ? 62 : 50);
    if (i) V.text(svg, g.x2 + 30, 210, "pool", { size: 15, cls: "muted" });
    if (i < 5) V.arrow(svg, g.x2 + 6, 225, g.x2 + 54, 225);
  });
  V.text(svg, x + 5, 175, "7 × 7 × 512", { size: 16, cls: "muted" });
  const fc = V.g(svg); fc.style.transition = "opacity .3s";
  [[x + 60, 260, "fc 4096"], [x + 130, 260, "fc 4096"], [x + 200, 120, "fc 1000"]].forEach(([fx, h, n], i) => {
    V.rect(fc, fx, 210 - h / 2, 26, h, "", { style: "fill:var(--orange-soft);stroke:var(--orange);stroke-width:2" });
    V.text(fc, fx + 13, 395, n, { size: 16, weight: 700 });
  });
  V.arrow(svg, x + 10, 210, x + 52, 210);
  const n1 = fadeIn(V.text(svg, 520, 25, "each stage: same 3 × 3 convolutions, then 2 × 2 max pooling → resolution ½, channels × 2", { size: 21, fill: "var(--blue)", weight: 700 }));
  const n2 = fadeIn(V.text(svg, 1220, 70, "three dense layers:\n124 M of 138 M\nparameters", { size: 20, fill: "var(--red)", weight: 700 }));
  return { steps: 2, set(s) { V.show(n1, s >= 1); V.show(n2, s >= 2); fc.style.opacity = s >= 2 ? 1 : .55; } };
};

VIZ.two3x3 = host => {
  const svg = V.svg(host, 1400, 420), s = 62;
  const A = rfTree(svg, 60, 300, [{ K: 3, S: 1 }, { K: 3, S: 1 }], s, { dy: 110 }); A.cone(2, 0);
  V.text(svg, 60 + 2.5 * s, 400, "two 3 × 3 layers: field 5", { size: 22, weight: 700 });
  const right = fadeIn(V.g(svg));
  const B = rfTree(right, 520, 300, [{ K: 5, S: 1 }], s, { dy: 220 }); B.cone(1, 0);
  V.text(right, 520 + 2.5 * s, 400, "one 5 × 5 layer: field 5", { size: 22, weight: 700 });
  const cmp = fadeIn(V.g(svg));
  V.text(cmp, 1150, 60, "same view, different cost", { size: 22, weight: 700 });
  [["weights (C → C)", "2 · 9 $C$² = **18** $C$²", "**25** $C$²"], ["nonlinearities", "**2**", "**1**"]].forEach(([n, a, b], i) => {
    V.text(cmp, 1150, 120 + i * 130, n, { size: 20, cls: "muted" });
    V.box(cmp, 990, 140 + i * 130, 150, 60, a, "box good", { size: 21 }); V.box(cmp, 1170, 140 + i * 130, 150, 60, b, "box", { size: 21 });
  });
  V.text(cmp, 1065, 360, "3 × 3 + 3 × 3", { size: 17, cls: "muted" }); V.text(cmp, 1245, 360, "5 × 5", { size: 17, cls: "muted" });
  return { steps: 2, set(st) { V.show(right, st >= 1); V.show(cmp, st >= 2); } };
};

VIZ.vggParams = host => {
  const svg = V.svg(host, 1400, 360), k = 1050 / 138.4;
  const parts = [["conv layers", 14.7, "blue"], ["fc6: 7·7·512 → 4096", 102.8, "red"], ["fc7: 4096 → 4096", 16.8, "orange"], ["fc8: 4096 → 1000", 4.1, "violet"]];
  let x = 200; const bars = parts.map(([n, v, c], i) => {
    const r = hbar(svg, x, 70, 70, c); r._w = v * k; r._x = x;
    const t = fadeIn(V.text(svg, x + v * k / 2, i % 2 ? 175 : 40, `${n}\n${v} M`, { size: 18, weight: 700, fill: `var(--${c})` }));
    x += v * k; return [r, t];
  });
  V.text(svg, 180, 105, "VGG-16", { size: 22, weight: 700, anchor: "end" });
  const gap = fadeIn(V.g(svg));
  V.text(gap, 180, 285, "GAP head", { size: 22, weight: 700, anchor: "end" });
  V.rect(gap, 200, 250, Math.max(3, 14.7 * k), 70, "", { style: "fill:var(--blue)" });
  V.rect(gap, 200 + 14.7 * k, 250, Math.max(4, .5 * k), 70, "", { style: "fill:var(--green)" });
  V.text(gap, 330 + 14.7 * k, 285, "GAP + linear 512 → 1000: 0.5 M (lecture 1)", { size: 20, anchor: "start", fill: "var(--green)", weight: 700 });
  return {
    steps: 1, start() { bars.forEach(([r]) => { r.setAttribute("width", 0); requestAnimationFrame(() => requestAnimationFrame(() => r.setAttribute("width", r._w))); }); },
    set(s) { bars.forEach(([r, t]) => { r.setAttribute("width", r._w); V.show(t, true); }); V.show(gap, s >= 1); },
    final() { bars.forEach(([r]) => r.setAttribute("width", r._w)); }
  };
};

VIZ.inception = host => {
  const svg = V.svg(host, 1400, 440);
  tb(svg, 20, 220, 40, 150, "muted", "input", "192 × 28 × 28");
  const BR = [["1 × 1", "64", "blue"], ["1 × 1 → 3 × 3", "128", "orange"], ["1 × 1 → 5 × 5", "32", "magenta"], ["3 × 3 pool → 1 × 1", "32", "green"]];
  const br = fadeIn(V.g(svg));
  BR.forEach(([n, c, col], i) => {
    const y = 40 + i * 95;
    V.box(br, 330, y, 300, 70, `${n}\n~→ ${c} channels`, "box", { size: 20 });
    V.rect(br, 330, y, 8, 70, "", { style: `fill:var(--${col})` });
    V.arrow(br, 160, 220, 322, y + 35); V.arrow(br, 635, y + 35, 760, 220);
  });
  const cat = fadeIn(V.g(svg));
  let off = 0;
  [[64, "blue"], [128, "orange"], [32, "magenta"], [32, "green"]].forEach(([c, col]) => {
    V.rect(cat, 780 + off, 140, c * .9, 160, "", { style: `fill:var(--${col}-soft);stroke:var(--${col});stroke-width:2` });
    V.text(cat, 780 + off + c * .45, 220, c, { size: 18, weight: 700 }); off += c * .9 + 2;
  });
  V.text(cat, 900, 395, "concatenate along channels", { size: 20, weight: 700 }); V.text(cat, 900, 422, "256 × 28 × 28", { size: 18, cls: "muted" });
  V.text(cat, 1210, 220, "each branch sees\nthe same input at a\ndifferent scale", { size: 20, cls: "muted" });
  return { steps: 2, set(s) { V.show(br, s >= 1); V.show(cat, s >= 2); } };
};

VIZ.reduce = host => {
  const svg = V.svg(host, 1400, 380), k = 900 / 120.4;
  V.text(svg, 700, 25, "input 192 × 28 × 28 → 32 channels with a 5 × 5 convolution", { size: 21, weight: 700 });
  V.text(svg, 230, 110, "direct 5 × 5", { size: 21, anchor: "end", weight: 700 });
  const d = hbar(svg, 250, 80, 60, "red"); d._w = 120.4 * k;
  const dt = V.text(svg, 260 + 120.4 * k, 110, "120.4 M multiply-adds", { size: 20, anchor: "start", weight: 700 });
  const g = fadeIn(V.g(svg));
  V.text(g, 230, 240, "1 × 1 to 16, then 5 × 5", { size: 21, anchor: "end", weight: 700 });
  const a = hbar(g, 250, 210, 60, "orange"), b = hbar(g, 250 + 2.4 * k, 210, 60, "green");
  a._w = 2.4 * k; b._w = 10.0 * k;
  V.text(g, 270 + 12.4 * k, 240, "2.4 M + 10.0 M = 12.4 M  (≈ 10× cheaper)", { size: 20, anchor: "start", weight: 700 });
  V.text(g, 700, 330, "28·28·25·192·32 = 120.4 M   vs   28·28·192·16 + 28·28·25·16·32 = 12.4 M", { size: 19, cls: "muted" });
  return {
    steps: 1, start() { d.setAttribute("width", 0); requestAnimationFrame(() => requestAnimationFrame(() => d.setAttribute("width", d._w))); },
    set(s) { V.show(g, s >= 1); [a, b].forEach(r => r.setAttribute("width", s >= 1 ? r._w : 0)); }, final() { d.setAttribute("width", d._w); }
  };
};

VIZ.degradation = host => {
  const svg = V.svg(host, 1400, 420);
  const X = t => 140 + t * 95, Y = e => 370 - e * 15;
  plotAxes(svg, X, Y, 0, 10.6, 0, 22, "training iterations", "training error [%]");
  const curve = (f, c, n, ly) => {
    const p = V.path(svg, V.pathFn(f, 0, 10, X, Y, 100), "curve", { style: `stroke:var(--${c})` });
    const t = fadeIn(V.text(svg, X(10) + 15, Y(ly), n, { size: 21, weight: 700, fill: `var(--${c})`, anchor: "start" }));
    const d = drawable(p); return on => { d(on); V.show(t, on); };
  };
  const p20 = curve(t => 4 + 16 * Math.exp(-.45 * t), "blue", "plain, 20 layers", 4.2);
  const p56 = curve(t => 7.5 + 14 * Math.exp(-.3 * t), "red", "plain, 56 layers", 8);
  const r56 = curve(t => 1.5 + 18 * Math.exp(-.5 * t), "green", "ResNet, 56 layers", 1.4);
  const note = fadeIn(V.text(svg, 760, 40, "more layers, higher “training” error: not overfitting, but harder optimization", { size: 21, weight: 700 }));
  V.text(svg, 1230, 410, "schematic, after He et al. 2016 (CIFAR-10)", { size: 16, cls: "muted", anchor: "end" });
  return { steps: 2, set(s) { p20(true); p56(true); V.show(note, s >= 1); r56(s >= 2); }, start() { p20(true); p56(true); } };
};

VIZ.vanishing = host => {
  const svg = V.svg(host, 1400, 420), n = 12;
  V.text(svg, 700, 25, "gradient magnitude reaching each layer (the loss is on the right)", { size: 21, weight: 700 });
  const bars = range(n).map(i => {
    const x = 90 + i * 100;
    V.box(svg, x, 330, 70, 50, `${i + 1}`, "box", { size: 18 });
    const r = V.rect(svg, x + 10, 95, 50, 215, "", { style: "fill:var(--magenta);transform-box:fill-box;transform-origin:bottom;transition:transform .7s ease" });
    r.style.transitionDelay = `${(n - i) * .06}s`;
    return r;
  });
  V.arrow(svg, 1300, 395, 100, 395, "magenta"); V.text(svg, 1340, 395, "loss", { size: 19, weight: 700 });
  const lbl = V.text(svg, 700, 62, "", { size: 20, fill: "var(--blue)" });
  return {
    steps: 1, set(s) {
      bars.forEach((r, i) => { const k = n - 1 - i; r.style.transform = `scaleY(${s ? Math.pow(.98, k) : Math.pow(.7, k)})`; r.style.fill = s ? "var(--green)" : "var(--magenta)"; });
      V.setText(lbl, s ? "residual: the identity path passes the gradient on almost unchanged" : "plain: each layer multiplies by ≈ 0.7 → 0.7¹¹ ≈ 0.02 at layer 1");
    }
  };
};

VIZ.resblock = host => {
  const svg = V.svg(host, 1400, 450);
  const cx = 420;
  V.text(svg, cx, 25, "$x$", { size: 30 });
  V.arrow(svg, cx, 45, cx, 75);
  [["conv 3 × 3 + BN + ReLU", 80], ["conv 3 × 3 + BN", 185]].forEach(([l, y]) => V.box(svg, cx - 170, y, 340, 70, l, "box blue", { size: 20 }));
  V.arrow(svg, cx, 152, cx, 180); V.arrow(svg, cx, 257, cx, 298);
  V.text(svg, cx - 230, 165, "$F$($x$)", { size: 28, anchor: "end", fill: "var(--blue)" });
  V.circle(svg, cx, 320, 20, { style: "fill:#fff;stroke:var(--ink);stroke-width:2.5" }); V.text(svg, cx, 320, "+", { size: 30 });
  V.arrow(svg, cx, 342, cx, 380); V.text(svg, cx, 405, "ReLU → $y$", { size: 24 });
  const id = fadeIn(V.g(svg));
  V.curveArrow(id, `M${cx + 10},55 C${cx + 330},55 ${cx + 330},320 ${cx + 26},320`, "green");
  V.text(id, cx + 290, 180, "identity", { size: 24, fill: "var(--green)", weight: 700 });
  V.text(id, 1030, 120, "$y$ = $F$($x$) + $x$", { size: 38 });
  const n2 = fadeIn(V.text(svg, 1030, 250, "the block only has to learn\nthe correction $F$($x$) = $y$ − $x$\n\nif $F$ → 0, the block is the identity:\nextra depth cannot hurt the start", { size: 22 }));
  return { steps: 2, set(s) { V.show(id, s >= 1); V.show(n2, s >= 2); } };
};

VIZ.projection = host => {
  const svg = V.svg(host, 1400, 420);
  V.box(svg, 40, 160, 220, 90, "$x$\n~64 × 56 × 56");
  V.box(svg, 400, 40, 360, 90, "conv 3 × 3, stride 2, 128\n~+ conv 3 × 3, 128", "box blue", { size: 20 });
  V.text(svg, 580, 150, "$F$($x$): 128 × 28 × 28", { size: 21, fill: "var(--blue)", weight: 700 });
  V.arrow(svg, 265, 190, 393, 90);
  V.circle(svg, 960, 205, 24, { style: "fill:#fff;stroke:var(--ink);stroke-width:2.5" }); V.text(svg, 960, 205, "+", { size: 32 });
  V.arrow(svg, 765, 85, 945, 186);
  const bad = V.g(svg); bad.style.transition = "opacity .4s";
  V.curveArrow(bad, "M265,225 L935,215", "red", { "stroke-dasharray": "9 7" });
  V.text(bad, 600, 255, "identity: 64 × 56 × 56  ≠  128 × 28 × 28  → cannot add", { size: 21, fill: "var(--red)", weight: 700 });
  const good = fadeIn(V.g(svg));
  V.box(good, 400, 290, 360, 90, "conv 1 × 1, stride 2, 128\n~projection shortcut", "box good", { size: 20 });
  V.arrow(good, 265, 230, 393, 330); V.arrow(good, 765, 330, 945, 225);
  V.text(svg, 1170, 205, "→ $y$: 128 × 28 × 28", { size: 24 });
  return { steps: 1, set(s) { bad.style.opacity = s ? 0 : 1; V.show(good, s >= 1); } };
};

VIZ.bottleneck = host => {
  const svg = V.svg(host, 1400, 440);
  const L = [[256, "in"], [64, "1 × 1"], [64, "3 × 3"], [256, "1 × 1"]];
  L.forEach(([c, n], i) => {
    const x = 70 + i * 170, h = c * 1.15;
    V.rect(svg, x, 210 - h / 2, 70, h, "", { rx: 4, style: `fill:var(--${i === 2 ? "orange" : "blue"}-soft);stroke:var(--${i === 2 ? "orange" : "blue"});stroke-width:2.5` });
    V.text(svg, x + 35, 210, c, { size: 22, weight: 700 });
    V.text(svg, x + 35, 395, n, { size: 20, weight: 700 });
    if (i < 3) V.arrow(svg, x + 76, 210, x + 164, 210);
  });
  V.text(svg, 330, 428, "squeeze → expensive 3 × 3 on 64 channels → expand", { size: 18, cls: "muted" });
  V.curveArrow(svg, "M105,60 Q330,-10 580,60", "green");
  const cmp = fadeIn(V.g(svg)), k = 600 / 1179648;
  V.text(cmp, 1050, 60, "weights per block (256 channels)", { size: 21, weight: 700 });
  V.text(cmp, 790, 150, "two 3 × 3", { size: 20, anchor: "start" }); V.rect(cmp, 790, 165, 1179648 * k, 46, "", { style: "fill:var(--red)" });
  V.text(cmp, 790 + 10, 188, "2 · 9 · 256² = 1 179 648", { size: 18, anchor: "start", fill: "#fff", weight: 700 });
  V.text(cmp, 790, 260, "bottleneck", { size: 20, anchor: "start" }); V.rect(cmp, 790, 275, 69632 * k, 46, "", { style: "fill:var(--green)" });
  V.text(cmp, 790 + 69632 * k + 12, 298, "256·64 + 9·64² + 64·256 = 69 632  (17× fewer)", { size: 18, anchor: "start", weight: 700 });
  return { steps: 1, set(s) { V.show(cmp, s >= 1); } };
};

VIZ.resnetFamily = host => {
  const svg = V.svg(host, 1400, 420);
  const D = [["ResNet-18", 1.8, 11.7, 69.8], ["ResNet-34", 3.7, 21.8, 73.3], ["ResNet-50", 4.1, 25.6, 76.1], ["ResNet-101", 7.8, 44.5, 77.4], ["ResNet-152", 11.5, 60.2, 78.3]];
  const X = g => 140 + g * 85, Y = a => 370 - (a - 68) * 30;
  plotAxes(svg, X, Y, 0, 12.6, 68, 79.5, "GFLOPs", "top-1 [%]");
  [70, 74, 78].forEach(a => V.text(svg, X(0) - 12, Y(a), a, { size: 18, cls: "muted", anchor: "end" }));
  [2, 4, 6, 8, 10, 12].forEach(g => V.text(svg, X(g), 392, g, { size: 18, cls: "muted" }));
  const pts = D.map(([n, g, p, a], i) => {
    const e = fadeIn(V.g(svg));
    V.circle(e, X(g), Y(a), 10, { style: `fill:var(--${i < 2 ? "blue" : "magenta"})` });
    V.text(e, X(g) + 16, Y(a) - 16, `${n}  ${a} %`, { size: 19, weight: 700, anchor: "start" });
    V.text(e, X(g) + 16, Y(a) + 10, `${p} M params`, { size: 16, cls: "muted", anchor: "start" });
    return e;
  });
  V.text(svg, 200, 50, "● basic blocks", { size: 19, fill: "var(--blue)", weight: 700, anchor: "start" });
  V.text(svg, 200, 78, "● bottleneck blocks", { size: 19, fill: "var(--magenta)", weight: 700, anchor: "start" });
  const n2 = fadeIn(V.text(svg, 1080, 320, "diminishing returns: 2.8× the compute\nof ResNet-50 buys 2.2 points", { size: 20, fill: "var(--muted)" }));
  return { steps: 5, set(s) { pts.forEach((e, i) => V.show(e, i <= s)); V.show(n2, s >= 5); } };
};

VIZ.addConcat = host => {
  const svg = V.svg(host, 1400, 420);
  const slab = (p, x, y, c, col, lbl) => { V.rect(p, x, y, c, 170, "", { style: `fill:var(--${col}-soft);stroke:var(--${col});stroke-width:2.5` }); V.text(p, x + c / 2, y + 85, lbl, { size: 20, weight: 700 }); };
  slab(svg, 40, 120, 70, "blue", "A"); slab(svg, 140, 120, 70, "orange", "B");
  V.text(svg, 125, 330, "two maps, 64 channels each", { size: 19, cls: "muted" });
  const s = fadeIn(V.g(svg));
  V.arrow(s, 225, 160, 420, 110); V.text(s, 330, 105, "add", { size: 21, weight: 700 });
  V.rect(s, 440, 30, 70, 170, "", { style: "fill:var(--violet-soft);stroke:var(--violet);stroke-width:2.5" });
  V.text(s, 475, 115, "A+B", { size: 19, weight: 700 });
  V.text(s, 800, 115, "64 channels — shapes must match exactly\nused in ResNet, FPN", { size: 21, anchor: "start" });
  const c = fadeIn(V.g(svg));
  V.arrow(c, 225, 250, 420, 300); V.text(c, 330, 300, "concatenate", { size: 21, weight: 700 });
  slab(c, 440, 225, 70, "blue", "A"); slab(c, 512, 225, 70, "orange", "B");
  V.text(c, 800, 310, "128 channels — only $H$ × $W$ must match\nused in Inception, DenseNet, U-Net", { size: 21, anchor: "start" });
  return { steps: 2, set(st) { V.show(s, st >= 1); V.show(c, st >= 2); } };
};

VIZ.dense = host => {
  const svg = V.svg(host, 1400, 440), k = 32;
  const xs = [60, 300, 540, 780, 1020];
  const parts = range(5).map(i => {
    const g = fadeIn(V.g(svg));
    for (let j = 0; j <= i; j++) {
      const c = j ? k : 64;
      const off = j ? 64 * 1.2 + (j - 1) * k * 1.2 : 0;
      V.rect(g, xs[i] + off, 140, c * 1.2, 160, "", { style: `fill:var(--${["blue", "orange", "magenta", "green", "violet"][j]}-soft);stroke:var(--${["blue", "orange", "magenta", "green", "violet"][j]});stroke-width:2` });
    }
    V.text(g, xs[i] + (64 + i * k) * .6, 335, `${64 + i * k} channels`, { size: 19, weight: 700 });
    if (i) { V.text(g, xs[i] - 50, 110, `layer ${i}`, { size: 19, cls: "muted" }); V.arrow(g, xs[i] - 92, 220, xs[i] - 10, 220); V.text(g, xs[i] - 50, 245, `+${k}`, { size: 18, fill: "var(--blue)", weight: 700 }); }
    return g;
  });
  V.text(svg, 700, 30, "each layer sees all previous maps (concatenated) and adds $k$ = 32 new channels", { size: 21, weight: 700 });
  V.text(svg, 700, 400, "features are reused instead of re-learned · cost: many concatenations, high memory traffic", { size: 19, cls: "muted" });
  return { steps: 4, set(s) { parts.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.depthwise = host => {
  const svg = V.svg(host, 1400, 450);
  const cols = ["red", "green", "blue"];
  const stack = (p, x, y, n, sz) => cols.slice(0, n).forEach((c, i) => V.rect(p, x + i * 14, y - i * 12, sz, sz, "", { style: `fill:var(--${c}-soft);stroke:var(--${c});stroke-width:2` }));
  const P1 = V.g(svg);
  V.text(P1, 200, 25, "standard 3 × 3", { size: 22, weight: 700 });
  stack(P1, 60, 110, 3, 90); V.text(P1, 120, 230, "every filter spans\nall input channels", { size: 18, cls: "muted" });
  V.arrow(P1, 200, 150, 270, 150); V.rect(P1, 280, 100, 80, 90, "", { style: "fill:var(--violet-soft);stroke:var(--violet);stroke-width:2" });
  V.text(P1, 320, 230, "× $C$_{out} filters", { size: 18, cls: "muted" });
  const P2 = fadeIn(V.g(svg));
  V.text(P2, 680, 25, "depthwise 3 × 3", { size: 22, weight: 700 });
  cols.forEach((c, i) => {
    V.rect(P2, 520, 60 + i * 60, 50, 50, "", { style: `fill:var(--${c}-soft);stroke:var(--${c});stroke-width:2` });
    V.arrow(P2, 575, 85 + i * 60, 640, 85 + i * 60, "muted");
    V.rect(P2, 650, 65 + i * 60, 40, 40, "", { style: `fill:var(--${c});opacity:.6` });
    V.rect(P2, 710, 60 + i * 60, 50, 50, "", { style: `fill:var(--${c}-soft);stroke:var(--${c});stroke-width:2` });
  });
  V.text(P2, 640, 260, "one filter per channel: spatial only", { size: 18, cls: "muted" });
  const P3 = fadeIn(V.g(svg));
  V.text(P3, 1120, 25, "pointwise 1 × 1", { size: 22, weight: 700 });
  stack(P3, 960, 140, 3, 70); V.arrow(P3, 1080, 150, 1150, 150);
  V.rect(P3, 1160, 110, 70, 80, "", { style: "fill:var(--violet-soft);stroke:var(--violet);stroke-width:2" });
  V.text(P3, 1120, 260, "mixes channels: no spatial view", { size: 18, cls: "muted" });
  const cost = fadeIn(V.g(svg)), k = 700 / 462.4;
  V.text(cost, 290, 330, "standard", { size: 19, anchor: "end" }); V.rect(cost, 300, 310, 462.4 * k, 38, "", { style: "fill:var(--red)" });
  V.text(cost, 310, 329, "462 M", { size: 18, fill: "#fff", anchor: "start", weight: 700 });
  V.text(cost, 290, 390, "separable", { size: 19, anchor: "end" }); V.rect(cost, 300, 370, 3.6 * k, 38, "", { style: "fill:var(--orange)" }); V.rect(cost, 300 + 3.6 * k, 370, 51.4 * k, 38, "", { style: "fill:var(--green)" });
  V.text(cost, 310 + 55 * k, 389, "3.6 M + 51.4 M = 55 M   (8.4× cheaper)", { size: 18, anchor: "start", weight: 700 });
  V.text(cost, 1290, 330, "example: 128 → 128\nchannels, 56 × 56\noutput", { size: 18, cls: "muted" });
  return { steps: 3, set(s) { V.show(P2, s >= 1); V.show(P3, s >= 2); V.show(cost, s >= 3); } };
};

VIZ.inverted = host => {
  const svg = V.svg(host, 1400, 440);
  const L = [[24, "in", "blue"], [144, "1 × 1 expand\n× 6, ReLU6", "blue"], [144, "3 × 3 depthwise\nReLU6", "orange"], [24, "1 × 1 project\nlinear", "blue"]];
  L.forEach(([c, n, col], i) => {
    const x = 90 + i * 210, h = 30 + c * 1.6;
    V.rect(svg, x, 210 - h / 2, 70, h, "", { rx: 4, style: `fill:var(--${col}-soft);stroke:var(--${col});stroke-width:2.5` });
    V.text(svg, x + 35, 210, c, { size: 21, weight: 700 }); V.text(svg, x + 35, 395, n, { size: 18, weight: 700 });
    if (i < 3) V.arrow(svg, x + 76, 210, x + 204, 210);
  });
  V.curveArrow(svg, "M125,140 Q440,40 755,140", "green");
  V.text(svg, 440, 50, "skip connection between the narrow ends", { size: 18, fill: "var(--green)", weight: 700 });
  const n = fadeIn(V.text(svg, 1110, 200, "inverted residual (MobileNetV2):\nnarrow → wide → narrow\n\nthe expensive part is depthwise,\nso the wide middle is cheap\n\nno ReLU after projection:\na narrow layer would lose information", { size: 20 }));
  return { steps: 1, set(s) { V.show(n, s >= 1); } };
};

VIZ.mobileScale = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 300);
  V.text(svg, 700, 25, "MobileNetV2 at width $α$ and input resolution $r$ (reference: $α$ = 1, $r$ = 224: 300 M multiply-adds, 3.5 M parameters)", { size: 20 });
  const rows = [["multiply-adds  ∝ $α$² $r$²", "blue"], ["parameters  ∝ $α$²", "orange"]];
  const R = rows.map(([n, c], i) => {
    V.text(svg, 360, 110 + i * 100, n, { size: 21, anchor: "end" });
    const r = V.rect(svg, 380, 85 + i * 100, 0, 50, "", { style: `fill:var(--${c});transition:width .25s` });
    const t = V.text(svg, 0, 110 + i * 100, "", { size: 21, weight: 700, anchor: "start" });
    return [r, t];
  });
  const upd = v => {
    const flop = 300 * v.a * v.a * (v.r / 224) ** 2, par = 3.5 * v.a * v.a;
    [[flop, 600, " M"], [par, 7, " M"]].forEach(([val, max, u], i) => {
      const w = Math.min(860, val / max * 860); R[i][0].setAttribute("width", w);
      R[i][1].querySelector("text").setAttribute("x", 395 + w); V.setText(R[i][1], val.toFixed(i ? 2 : 0) + u + (i ? " params" : " MACs"));
    });
  };
  const sl = sliders(host, [{ k: "a", label: "width α", min: .25, max: 1.4, step: .05, v: 1 }, { k: "r", label: "resolution r", min: 96, max: 320, step: 32, v: 224 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.compound = host => {
  const svg = V.svg(host, 1400, 430);
  const net = (p, x, layers, w, img) => {
    V.rect(p, x + 90 - img / 2, 330 - img, img, img, "", { style: "fill:#dfe6ec;stroke:var(--muted)" });
    for (let i = 0; i < layers; i++) V.rect(p, x + 90 - w / 2, 300 - img - 14 - i * 26, w, 20, "", { rx: 3, style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:1.5" });
  };
  const S = [["baseline", 6, 70, 50], ["wider", 6, 130, 50], ["deeper", 9, 70, 50], ["higher resolution", 6, 70, 80], ["compound", 8, 110, 70]];
  const G = S.map(([n, l, w, img], i) => { const g = fadeIn(V.g(svg)); net(g, 20 + i * 275, l, w, img); V.text(g, 110 + i * 275, 370, n, { size: 21, weight: 700, fill: i === 4 ? "var(--green)" : null }); return g; });
  const f = fadeIn(V.text(svg, 700, 415, "EfficientNet: depth ∝ 1.2^φ, width ∝ 1.1^φ, resolution ∝ 1.15^φ for a chosen φ", { size: 19, cls: "muted" }));
  return { steps: 2, set(s) { G.forEach((g, i) => V.show(g, i < 4 ? s >= 0 && (i === 0 || s >= 1) : s >= 2)); V.show(f, s >= 2); } };
};

VIZ.transfer2x2 = host => {
  const svg = V.svg(host, 1400, 420);
  V.text(svg, 560, 22, "domain similar to pretraining", { size: 20, weight: 700 }); V.text(svg, 1000, 22, "domain different", { size: 20, weight: 700 });
  V.text(svg, 300, 130, "small dataset", { size: 20, weight: 700, anchor: "end" }); V.text(svg, 300, 310, "large dataset", { size: 20, weight: 700, anchor: "end" });
  const C = [[340, 50, "freeze the backbone,\ntrain only the head", "good"], [780, 50, "fine-tune the upper stages;\nstrong augmentation", "box"],
  [340, 230, "fine-tune everything\nwith a small learning rate", "box"], [780, 230, "fine-tune everything;\nconsider domain pretraining", "blue"]];
  const G = C.map(([x, y, t, c]) => fadeIn(V.box(svg, x, y, 420, 150, t, "box " + c, { size: 21 })));
  V.text(svg, 700, 405, "early layers transfer best (edges, textures); late layers are most task-specific", { size: 19, cls: "muted" });
  return { steps: 3, set(s) { G.forEach((g, i) => V.show(g, i <= s)); } };
};
