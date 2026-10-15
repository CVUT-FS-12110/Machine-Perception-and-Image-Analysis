"""Stage 2: run real algorithms on the rendered views and write the lecture assets.

Everything is measured against the exact geometry of the synthetic scene.
"""
import glob, os, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
import cv2
import scene

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
L = lambda n: dict(np.load(f"cache/{n}.npz"))
FONT = lambda s: ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", s)
FONTB = lambda s: ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", s)


def turbo(x):
    x = np.clip(x, 0, 1)[..., None]
    c = np.concatenate([
        0.13572138 + x * (4.61539260 + x * (-42.66032258 + x * (132.13108234 + x * (-152.94239396 + x * 59.28637943)))),
        0.09140261 + x * (2.19418839 + x * (4.84296658 + x * (-14.18503333 + x * (4.27729857 + x * 2.82956604)))),
        0.10667330 + x * (12.64194608 + x * (-60.58204836 + x * (110.36276771 + x * (-89.90310912 + x * 27.34824973))))], -1)
    return np.clip(c, 0, 1)


def errmap(x):   # green → yellow → red → dark red
    x = np.clip(x, 0, 1)
    st = np.array([[0.10, 0.60, 0.25], [0.98, 0.85, 0.15], [0.90, 0.25, 0.10], [0.45, 0.02, 0.05]])
    k = np.clip((x * 3).astype(int), 0, 2); f = (x * 3 - k)[..., None]
    return st[k] * (1 - f) + st[k + 1] * f


def to8(a): return (np.clip(a, 0, 1) * 255).astype(np.uint8)


def gray(rgb): return (rgb @ np.array([.299, .587, .114]))[..., None] * np.ones(3)


def with_bar(img, cmap, lo, hi, unit, title, ticks=5, width=None):
    """Append a horizontal colour bar with labels below an image (float RGB in 0..1)."""
    im = Image.fromarray(to8(img)); W, H = im.size
    bh = 64; out = Image.new("RGB", (W, H + bh), "white"); out.paste(im, (0, 0)); d = ImageDraw.Draw(out)
    x0, x1 = int(W * .3), int(W * .82)
    bar = to8(cmap(np.linspace(0, 1, x1 - x0))[None].repeat(14, 0))
    out.paste(Image.fromarray(bar), (x0, H + 10))
    fs = max(15, W // 40)
    for i in range(ticks):
        v = lo + (hi - lo) * i / (ticks - 1); x = x0 + (x1 - x0) * i / (ticks - 1)
        t = f"{round(v, 1):g}"; d.text((x, H + 30), t, fill=(40, 40, 40), font=FONT(fs), anchor="ma")
    d.text((x1 + 12, H + 8), unit, fill=(40, 40, 40), font=FONT(fs))
    d.text((x0 - 14, H + 8), title, fill=(40, 40, 40), font=FONTB(fs), anchor="ra")
    return out


def save(name, img, q=90):
    im = img if isinstance(img, Image.Image) else Image.fromarray(to8(img))
    im.save(f"{OUT}/{name}", quality=q) if name.endswith(".jpg") else im.save(f"{OUT}/{name}")
    print("wrote", name, flush=True)


def backproject(r, depth=None):
    K, R, eye = r["K"], r["R"], r["eye"]; Z = r["depth"] if depth is None else depth
    H, W = Z.shape; u, v = np.meshgrid(np.arange(W) + .5, np.arange(H) + .5)
    xc = np.stack([(u - K[0, 2]) / K[0, 0] * Z, -(v - K[1, 2]) / K[1, 1] * Z, Z], -1)
    return xc @ R + eye


def project(P, r):
    K, R, eye = r["K"], r["R"], r["eye"]
    xc = (P - eye) @ R.T
    u = K[0, 0] * xc[..., 0] / xc[..., 2] + K[0, 2]; v = -K[1, 1] * xc[..., 1] / xc[..., 2] + K[1, 2]
    return u, v, xc[..., 2]


def splat(P, C, r, W, H, size=2, bg=(.12, .13, .15)):
    u, v, z = project(P.reshape(-1, 3), r); C = C.reshape(-1, 3)
    ok = (z > 0.05) & (u >= 0) & (u < W) & (v >= 0) & (v < H)
    u, v, z, C = u[ok], v[ok], z[ok], C[ok]
    img = np.ones((H, W, 3)) * np.array(bg); zb = np.full((H, W), np.inf)
    order = np.argsort(-z)
    for dx in range(size):
        for dy in range(size):
            ui = np.clip((u + dx).astype(int), 0, W - 1); vi = np.clip((v + dy).astype(int), 0, H - 1)
            for idx in [order]:
                img[vi[idx], ui[idx]] = C[idx]; zb[vi[idx], ui[idx]] = z[idx]
    return img


# ------------------------------------------------------------------ photos and ground truth depth
hero = L("hero")
save("hero.jpg", hero["rgb"])
Z = hero["depth"]; zmin, zmax = 0.40, 1.2
save("hero-depth.jpg", with_bar(turbo((Z - zmin) / (zmax - zmin)), turbo, 40, 120, "cm", "depth", ticks=5))

# ------------------------------------------------------------------ sparse "SLAM" features
g8 = to8(gray(hero["rgb"]))[..., 0]
orb = cv2.ORB_create(nfeatures=500, fastThreshold=12)
kp = orb.detect(g8, None)
im = Image.fromarray(to8(hero["rgb"] * .55 + .45 * gray(hero["rgb"]) * .6)); d = ImageDraw.Draw(im)
pts = []
for k in kp:
    x, y = k.pt; z = Z[int(y), int(x)]; pts.append((x, y, z))
    c = tuple(int(255 * v) for v in turbo((z - zmin) / (zmax - zmin)))
    d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=c, outline=(255, 255, 255))
save("slam-sparse.jpg", with_bar(np.asarray(im) / 255, turbo, 40, 120, "cm", "landmark depth", ticks=5))
pts = np.array(pts)
print("ORB points", len(pts))

# ------------------------------------------------------------------ classical stereo (SGBM)
Ls, Rs = L("stereo_left"), L("stereo_right")
save("stereo-left.jpg", Ls["rgb"]); save("stereo-right.jpg", Rs["rgb"])
gl, gr = to8(gray(Ls["rgb"]))[..., 0], to8(gray(Rs["rgb"]))[..., 0]
bs = 7
sg = cv2.StereoSGBM_create(minDisparity=16, numDisparities=112, blockSize=bs, P1=8 * bs * bs, P2=32 * bs * bs,
                           uniquenessRatio=10, speckleWindowSize=80, speckleRange=2, disp12MaxDiff=1, mode=cv2.STEREO_SGBM_MODE_HH)
disp = sg.compute(gl, gr).astype(np.float32) / 16
f, B = Ls["K"][0, 0], 0.06
valid = disp > 16.5
Zs = np.where(valid, f * B / np.maximum(disp, 1e-3), np.nan)
Zg = Ls["depth"]
err = np.abs(Zs - Zg) * 1000                              # mm
hole = np.array([.18, .18, .2])
dep = np.where(valid[..., None], turbo((Zs - zmin) / (zmax - zmin)), hole)
save("sgbm-depth.jpg", with_bar(dep, turbo, 40, 120, "cm", "depth", ticks=5))
base = gray(Ls["rgb"]) * .5
emap = np.where(valid[..., None], errmap(err / 20), hole)
save("sgbm-error.jpg", with_bar(emap, errmap, 0, 20, "mm", "|error|"))
print("SGBM valid %.1f %%, median error %.1f mm, >10 mm: %.1f %%" % (valid.mean() * 100, np.nanmedian(err), np.nanmean(err > 10) * 100))
np.save("cache/sgbm_err_stats.npy", np.array([valid.mean(), np.nanmedian(err)]))

# ------------------------------------------------------------------ monocular network (Depth Anything V2 small)
try:
    from transformers import pipeline
    pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
    pred = np.asarray(pipe(Image.fromarray(to8(Ls["rgb"])))["predicted_depth"], np.float32)
    pred = cv2.resize(pred, (Zg.shape[1], Zg.shape[0]), interpolation=cv2.INTER_CUBIC)
    pn = (pred - pred.min()) / (pred.max() - pred.min())
    save("mono-raw.jpg", with_bar(turbo(1 - pn), turbo, 0, 1, "(no unit)", "relative depth", ticks=3))
    # align inverse depth with sparse ORB points of the left view: 1/Z = s * pred + t
    kpl = orb.detect(gl, None); P = np.array([(k.pt[0], k.pt[1]) for k in kpl]).astype(int)
    zl = Zg[P[:, 1], P[:, 0]]; pr = pred[P[:, 1], P[:, 0]]
    A = np.stack([pr, np.ones_like(pr)], 1); s, t = np.linalg.lstsq(A, 1 / zl, rcond=None)[0]
    Zm = 1 / np.maximum(s * pred + t, 1e-3)
    errm = np.abs(Zm - Zg) * 1000
    save("mono-error.jpg", with_bar(errmap(errm / 60), errmap, 0, 60, "mm", "|error|"))
    save("mono-depth.jpg", with_bar(turbo((Zm - zmin) / (zmax - zmin)), turbo, 40, 120, "cm", "depth", ticks=5))
    print("mono median error %.1f mm" % np.median(errm))
except Exception as e:
    print("mono failed:", e)

# ------------------------------------------------------------------ point cloud from stereo, seen from another view
nov = L("top_view")
P = backproject(Ls, np.nan_to_num(Zs, nan=-1)); C = Ls["rgb"]
ok = valid
img = splat(P[ok], C[ok], nov, 640, 400, size=2)
save("stereo-cloud-novel.jpg", img)

# ------------------------------------------------------------------ training views, coverage, unseen side
tr = [L(os.path.basename(p)[:-4]) for p in sorted(glob.glob("cache/train_*.npz"))]
th = [Image.fromarray(to8(r["rgb"])) for r in tr]
gw, gh = 7, 2; grid = Image.new("RGB", (gw * 324, gh * 204), "white")
for i, im in enumerate(th): grid.paste(im, ((i % gw) * 324 + 2, (i // gw) * 204 + 2))
save("train-grid.jpg", grid)


def coverage_count(view):
    Pv = backproject(view); cnt = np.zeros(view["depth"].shape)
    for r in tr:
        u, v, z = project(Pv, r); H, W = r["depth"].shape
        ins = (u >= 0) & (u < W) & (v >= 0) & (v < H) & (z > 0)
        zz = np.full(z.shape, np.inf); zz[ins] = r["depth"][v[ins].astype(int), u[ins].astype(int)]
        cnt += ins & (np.abs(zz - z) < 0.004 + 0.01 * z)
    return cnt


top = nov
cnt = coverage_count(top)
cov = np.where(cnt[..., None] > 0, errmap(1 - np.minimum(cnt, 8) / 8), np.array([.45, .02, .05]))
blend = top["rgb"] * .45 + cov * .55
save("coverage.jpg", with_bar(blend, lambda x: errmap(1 - x), 0, 8, "views", "seen by", ticks=5))
side = L("novel_side")
cs = coverage_count(side)
Pall = np.concatenate([backproject(r).reshape(-1, 3) for r in tr]); Call = np.concatenate([r["rgb"].reshape(-1, 3) for r in tr])
recon = splat(Pall, Call, side, 640, 400, size=2, bg=(.12, .13, .15))
save("novel-truth.jpg", side["rgb"]); save("novel-known.jpg", recon)

# ------------------------------------------------------------------ TSDF fusion of noisy depth maps
rng = np.random.default_rng(0)
vs = 0.0025; xs = np.arange(-0.30, 0.30, vs); ys = np.arange(-0.004, 0.13, vs); zs = np.arange(-0.27, 0.20, vs)
X, Y, Zv = np.meshgrid(xs, ys, zs, indexing="ij"); Pv = np.stack([X, Y, Zv], -1)
mu = 0.008


def fuse(pose_err=None):
    D = np.zeros(X.shape, np.float32); Wt = np.zeros(X.shape, np.float32)
    for i, r in enumerate(tr):
        r = dict(r)
        Zn = r["depth"] + rng.normal(0, 1, r["depth"].shape) * (0.0008 + 0.003 * r["depth"] ** 2)
        if pose_err and i in pose_err:                       # wrong pose: rotate the camera slightly
            a = np.radians(pose_err[i]); c, s = np.cos(a), np.sin(a)
            r["R"] = (np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], np.float32) @ r["R"].T).T
        u, v, z = project(Pv, r); H, W = r["depth"].shape
        ins = (u >= 0) & (u < W) & (v >= 0) & (v < H) & (z > 0)
        dm = np.full(z.shape, np.nan, np.float32); dm[ins] = Zn[v[ins].astype(int), u[ins].astype(int)]
        sd = dm - z; upd = ins & (sd > -mu)
        sdc = np.clip(sd, -mu, mu) / mu
        D[upd] = (D[upd] * Wt[upd] + sdc[upd]) / (Wt[upd] + 1); Wt[upd] += 1
    D[Wt == 0] = 1.0
    return D, Wt


def raycast(D, view, Wd=640, Hd=400):
    eye, R = view["eye"], view["R"]; K = view["K"] * np.array([[Wd / 640], [Hd / 400], [1]])
    u, v = np.meshgrid(np.arange(Wd) + .5, np.arange(Hd) + .5)
    dc = np.stack([(u - K[0, 2]) / K[0, 0], -(v - K[1, 2]) / K[1, 1], np.ones_like(u)], -1); d = dc @ R; d /= np.linalg.norm(d, axis=-1, keepdims=True)
    o = np.broadcast_to(eye, d.shape)
    t = np.full(u.shape, 0.3); hit = np.zeros(u.shape, bool); prev = np.ones(u.shape)
    idx = lambda p: np.stack([(p[..., 0] - xs[0]) / vs, (p[..., 1] - ys[0]) / vs, (p[..., 2] - zs[0]) / vs])
    for _ in range(700):
        p = o + d * t[..., None]
        val = ndi.map_coordinates(D, idx(p).reshape(3, -1), order=1, cval=1.0).reshape(u.shape)
        newhit = (~hit) & (val < 0) & (prev >= 0)
        hit |= newhit
        prev = np.where(hit, prev, val)
        t = np.where(hit, t, t + 0.0015)
        if t.min() > 1.6: break
    p = o + d * t[..., None]
    e = vs
    gx = [ndi.map_coordinates(D, idx(p + np.array(dd) * e).reshape(3, -1), order=1, cval=1).reshape(u.shape) for dd in ([1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1])]
    n = np.stack([gx[0] - gx[1], gx[2] - gx[3], gx[4] - gx[5]], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-9
    return p, n, hit


def shade(n, hit):
    l = scene.LIGHT; c = .25 + .75 * np.clip(np.sum(n * l, -1), 0, 1)
    return np.where(hit[..., None], c[..., None] * np.array([.82, .84, .87]), np.array([.12, .13, .15]))


for tag, pe in [("", None), ("-poseerr", {3: 4.0, 4: -4.0, 10: 3.5})]:
    D, Wt = fuse(pe)
    p, n, hit = raycast(D, Ls)
    sh = shade(n, hit)
    if not tag: save("tsdf-mesh.jpg", sh)
    e = np.abs(scene.sdf(p.astype(np.float32))) * 1000
    col = np.where(hit[..., None], errmap(e / 4) * (.55 + .45 * sh), np.array([.12, .13, .15]))
    save(f"tsdf-error{tag}.jpg", with_bar(col, errmap, 0, 4, "mm", "error"))
    print("TSDF%s median error %.2f mm" % (tag, np.median(e[hit])))

# ------------------------------------------------------------------ dynamic: still, motion blur, rolling shutter
save("dyn-still.jpg", L("dyn_still")["rgb"])
blur = np.mean([L(f"dyn_blur_{i}")["rgb"] for i in range(8)], 0)
save("dyn-blur.jpg", np.asarray(Image.fromarray(to8(blur)).resize((960, 600), Image.BICUBIC)) / 255)
rs = np.concatenate([L(f"dyn_rs_{b:02d}")["rgb"] for b in range(50)], 0)
save("dyn-rolling.jpg", rs)
print("done")
