/* Shared drawing helpers built on V (deck.js): flow diagrams, cuboids, sliders, plots. */
"use strict";

/* Generic flow diagram.
   spec = {w, h, nodes:[{id,x,y,w,h,label,cls,step,size}], edges:[{a,b,from,to,color,step,label,d,dash}],
           texts:[{x,y,t,size,cls,step,anchor}]} ; `from`/`to` are sides r,l,t,b. */
function flow(spec) {
  return host => {
    const svg = V.svg(host, spec.w, spec.h);
    const N = {}, staged = [];
    const anchor = (n, side) => ({ r: [n.x + n.w, n.y + n.h / 2], l: [n.x, n.y + n.h / 2], t: [n.x + n.w / 2, n.y], b: [n.x + n.w / 2, n.y + n.h] }[side]);
    const edgesG = V.g(svg);
    (spec.nodes || []).forEach(n => {
      const g = V.box(svg, n.x, n.y, n.w, n.h, n.label, "box " + (n.cls || ""), { size: n.size, weight: n.weight });
      g.classList.add("fade"); N[n.id] = n;
      if (n.step) staged.push([n.step, g]);
    });
    (spec.edges || []).forEach(e => {
      const a = N[e.a], b = N[e.b];
      let d = e.d;
      if (!d) {
        const p = anchor(a, e.from || "r"), q = anchor(b, e.to || "l");
        const gap = 4, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
        d = `M${p[0] + dx / L * gap},${p[1] + dy / L * gap} L${q[0] - dx / L * (gap + 6)},${q[1] - dy / L * (gap + 6)}`;
      }
      const g = V.g(edgesG, { class: "fade" });
      V.curveArrow(g, d, e.color || "blue", e.dash ? { "stroke-dasharray": "8 6" } : {});
      if (e.label) V.text(g, e.lx, e.ly, e.label, { size: e.size || 18, cls: "muted" });
      if (e.step) staged.push([e.step, g]);
    });
    (spec.texts || []).forEach(t => {
      const g = V.text(svg, t.x, t.y, t.t, { size: t.size || 20, cls: t.cls || "muted", anchor: t.anchor, weight: t.weight });
      g.classList.add("fade");
      if (t.step) staged.push([t.step, g]);
    });
    const steps = Math.max(0, ...staged.map(s => s[0]));
    return { steps, set(s) { staged.forEach(([k, g]) => V.show(g, k <= s)); } };
  };
}

const shade = v => `hsl(0,0%,${100 - v}%)`;

const range = n => Array.from({ length: n }, (_, i) => i);

/* Pseudo-3D block: front face (x, y, w, h), depth d drawn up and to the right. */
function cuboid(p, x, y, w, h, d, color, extra = {}) {
  const g = V.g(p, extra), dx = d * .55, dy = -d * .4;
  V.path(g, `M${x + w},${y + h} l${dx},${dy} l0,${-h} l${-dx},${-dy} z`, "", { style: `fill:var(--${color}-mid,var(--${color}-soft));stroke:var(--${color});stroke-width:2;fill-opacity:.9` });
  V.path(g, `M${x},${y} l${dx},${dy} l${w},0 l${-dx},${-dy} z`, "", { style: `fill:var(--${color}-soft);stroke:var(--${color});stroke-width:2` });
  V.rect(g, x, y, w, h, "", { style: `fill:#fff;stroke:var(--${color});stroke-width:2` });
  V.rect(g, x, y, w, h, "", { style: `fill:var(--${color}-soft);stroke:var(--${color});stroke-width:2;fill-opacity:.6` });
  return g;
}

/* Receptive-field tree for valid convolutions; layers = [{K,S}]. */
function rfTree(p, ox, oy, layers, s, opt = {}) {
  const sizes = [1];
  for (let l = layers.length - 1; l >= 0; l--) sizes.unshift((sizes[0] - 1) * layers[l].S + layers[l].K);
  const centers = [range(sizes[0]).map(i => i + .5)];
  layers.forEach((L, l) => centers.push(range(sizes[l + 1]).map(i => {
    const a = centers[l][i * L.S], b = centers[l][i * L.S + L.K - 1]; return (a + b) / 2;
  })));
  const rowY = l => oy - l * opt.dy;
  const G = { edges: [], cells: [] };
  layers.forEach((L, l) => centers[l + 1].forEach((c, i) => {
    for (let k = 0; k < L.K; k++) {
      const e = V.line(p, ox + c * s, rowY(l + 1) + s, ox + centers[l][i * L.S + k] * s, rowY(l), { style: "stroke:var(--blue-mid)", "stroke-width": 2 });
      e.dataset.l = l + 1; e.dataset.i = i; e.dataset.k = i * L.S + k; G.edges.push(e);
    }
  }));
  centers.forEach((cs, l) => cs.forEach((c, i) => {
    const r = V.rect(p, ox + c * s - s / 2 + 2, rowY(l), s - 4, s, "cell"); r.dataset.l = l; r.dataset.i = i;
    r.style.transition = "fill .3s"; G.cells.push(r);
  }));
  G.sizes = sizes; G.rowY = rowY; G.layers = layers;
  // highlight the cone of unit (lTop, iTop); returns the number of input cells it sees
  G.cone = (lTop, iTop) => {
    const sets = range(layers.length + 1).map(() => new Set());
    if (lTop >= 0) {
      sets[lTop].add(iTop);
      for (let l = lTop; l > 0; l--) sets[l].forEach(i => { for (let k = 0; k < layers[l - 1].K; k++) sets[l - 1].add(i * layers[l - 1].S + k); });
    }
    G.cells.forEach(r => { const on = sets[+r.dataset.l].has(+r.dataset.i); r.style.fill = on ? (+r.dataset.l === lTop ? "var(--blue)" : "var(--blue-mid)") : ""; });
    G.edges.forEach(e => { const on = sets[+e.dataset.l].has(+e.dataset.i) && +e.dataset.l <= lTop; e.style.stroke = on ? "var(--blue)" : "var(--rule)"; e.setAttribute("stroke-width", on ? 3 : 1.5); });
    return sets[0].size;
  };
  return G;
}

/* Row of range sliders under a visual; onChange(values) is called on every move. */
function sliders(host, defs, onChange) {
  const c = document.createElement("div"); c.className = "ctrls interactive";
  c.innerHTML = defs.map(d => `<label>${d.label}<input type="range" data-k="${d.k}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.v}"><output>${d.v}</output></label>`).join("");
  host.appendChild(c);
  const vals = Object.fromEntries(defs.map(d => [d.k, +d.v]));
  c.querySelectorAll("input").forEach(inp => inp.oninput = () => { vals[inp.dataset.k] = +inp.value; inp.nextElementSibling.textContent = (+inp.value).toFixed(inp.step < 1 ? (inp.step < .1 ? 2 : 1) : 0); onChange(vals); });
  return { vals, el: c };
}

function plotAxes(p, X, Y, x0, x1, y0, y1, xl, yl) {
  V.path(p, `M${X(x0)},${Y(y0)} L${X(x1)},${Y(y0)} M${X(x0)},${Y(y0)} L${X(x0)},${Y(y1)}`, "axis", { "marker-end": "url(#ah-muted)" });
  if (xl) V.text(p, X(x1) + 12, Y(y0), xl, { size: 20, anchor: "start", cls: "muted" });
  if (yl) V.text(p, X(x0), Y(y1) - 18, yl, { size: 20, cls: "muted" });
}

/* Highlights one table row per step: <div data-viz="rowSteps"><table>…</table></div>. */
VIZ.rowSteps = host => {
  const rows = [...host.querySelectorAll("tbody tr")];
  return { steps: rows.length, set(s) { rows.forEach((r, i) => r.classList.toggle("on", i === s - 1)); } };
};
