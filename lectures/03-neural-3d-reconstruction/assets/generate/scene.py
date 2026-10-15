"""Small SDF sphere-tracer for lecture 3 illustrations (numpy only).

Scene (metres): wooden table (y = 0), plain white wall (z = 0.45, textureless),
metal flange at the origin, cardboard box, glossy red ball, and a printed
checkerboard mat (repetitive texture). Everything is analytic, so exact depth,
normals and signed distance are available for evaluating reconstructions.
"""
import numpy as np

F = np.float32
LIGHT = np.array([-0.45, 0.85, -0.5], F); LIGHT /= np.linalg.norm(LIGHT)
BOX_C, BOX_H, BOX_A = np.array([-0.2, 0.05, 0.09], F), np.array([0.05, 0.05, 0.05], F), np.radians(25)
BALL_C, BALL_R = np.array([0.19, 0.035, 0.11], F), F(0.035)
MAT = dict(floor=0, wall=1, metal=2, box=3, ball=4)


def _stadium(x, z, half=0.05, r=0.035):
    return np.hypot(np.maximum(np.abs(x) - half, 0), z) - r


def _extrude(d2, y, y0, y1):
    h = (y1 - y0) / 2
    w0, w1 = d2, np.abs(y - (y0 + h)) - h
    return np.hypot(np.maximum(w0, 0), np.maximum(w1, 0)) + np.minimum(np.maximum(w0, w1), 0)


def flange(p, t=0.0):
    """Flange; t rotates it around the vertical axis (used for the dynamic sequence)."""
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    if t:
        c, s = np.cos(t), np.sin(t); x, z = c * x + s * z, -s * x + c * z
    plate = _extrude(_stadium(x, z), y, 0.0, 0.02) - 0.002
    hub = _extrude(np.hypot(x, z) - 0.032, y, 0.0, 0.075) - 0.002
    d = np.minimum(plate, hub)
    bore = np.hypot(x, z) - 0.018
    holes = np.minimum(np.hypot(x - 0.06, z), np.hypot(x + 0.06, z)) - 0.009
    return np.maximum(d, -np.minimum(bore, holes))


def box(p):
    q = p - BOX_C
    c, s = np.cos(BOX_A), np.sin(BOX_A)
    x, z = c * q[..., 0] + s * q[..., 2], -s * q[..., 0] + c * q[..., 2]
    d = np.stack([np.abs(x), np.abs(q[..., 1]), np.abs(z)], -1) - (BOX_H - 0.004)
    return np.linalg.norm(np.maximum(d, 0), axis=-1) + np.minimum(d.max(-1), 0) - 0.004


def scene(p, t=0.0):
    ds = np.stack([p[..., 1], 0.45 - p[..., 2], flange(p, t), box(p), np.linalg.norm(p - BALL_C, axis=-1) - BALL_R], -1)
    return ds.min(-1), ds.argmin(-1)


def sdf(p, t=0.0):
    return scene(p, t)[0]


def _noise(x, y):
    """Cheap value noise for textures."""
    xi, yi = np.floor(x), np.floor(y); xf, yf = x - xi, y - yi
    h = lambda a, b: np.modf(np.sin(a * 127.1 + b * 311.7) * 43758.5453)[0] % 1
    u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
    return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v


def albedo(p, m, n, t=0.0):
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    col = np.zeros(p.shape, F)
    # wooden table with grain
    g = _noise(x * 8, z * 60) * 0.6 + 0.4 * np.sin((x + 0.3 * _noise(x * 3, z * 3)) * 140) ** 2
    wood = np.stack([0.52 + 0.12 * g, 0.34 + 0.08 * g, 0.19 + 0.05 * g], -1)
    mat = (x > 0.06) & (x < 0.3) & (z > -0.24) & (z < -0.08)
    chk = ((np.floor(x / 0.02) + np.floor(z / 0.02)) % 2)[..., None]
    floor = np.where(mat[..., None], 0.08 + 0.82 * chk * np.ones(3, F), wood)
    col = np.where((m == 0)[..., None], floor, col)
    col = np.where((m == 1)[..., None], np.array([0.86, 0.86, 0.84], F), col)
    col = np.where((m == 2)[..., None], np.array([0.62, 0.64, 0.67], F), col)
    # cardboard with printed stripes and tape
    q = p - BOX_C; c, s = np.cos(BOX_A), np.sin(BOX_A); bx, bz = c * q[..., 0] + s * q[..., 2], -s * q[..., 0] + c * q[..., 2]
    card = np.array([0.70, 0.53, 0.33], F) * (0.9 + 0.1 * _noise(bx * 90, q[..., 1] * 90))[..., None]
    tape = (np.abs(bx) < 0.012)[..., None]
    label = ((np.abs(bz + 0.05) < 0.003) & (np.abs(bx) < 0.035) & (q[..., 1] > -0.02) & (np.sin(q[..., 1] * 600) > 0))[..., None]
    card = np.where(tape, np.array([0.80, 0.70, 0.52], F), card)
    card = np.where(label, np.array([0.1, 0.1, 0.12], F), card)
    col = np.where((m == 3)[..., None], card, col)
    col = np.where((m == 4)[..., None], np.array([0.75, 0.08, 0.07], F), col)
    return col


def normal(p, t=0.0):
    e = F(1e-4)
    ex, ey, ez = np.array([e, 0, 0], F), np.array([0, e, 0], F), np.array([0, 0, e], F)
    n = np.stack([sdf(p + ex, t) - sdf(p - ex, t), sdf(p + ey, t) - sdf(p - ey, t), sdf(p + ez, t) - sdf(p - ez, t)], -1)
    return n / (np.linalg.norm(n, axis=-1, keepdims=True) + 1e-9)


def march(o, d, t=0.0, tmax=3.0, steps=220):
    dist = np.zeros(o.shape[:-1], F); act = np.ones_like(dist, bool)
    for _ in range(steps):
        if not act.any():
            break
        p = o[act] + d[act] * dist[act][:, None]
        h = sdf(p, t)
        dist[act] += h * 0.9
        act[act] = (h > 2e-5) & (dist[act] < tmax)
    return dist


def soft_shadow(p, n, t=0.0):
    o = p + n * 2e-3; res = np.ones(p.shape[:-1], F); s = np.full(res.shape, F(0.004)); d = np.broadcast_to(LIGHT, p.shape)
    for _ in range(48):
        h = sdf(o + d * s[:, None], t)
        res = np.minimum(res, 12 * h / s)
        s += np.clip(h, 0.002, 0.05)
    return np.clip(res, 0, 1)


def ao(p, n, t=0.0):
    occ = np.zeros(p.shape[:-1], F)
    for i, h in enumerate([0.006, 0.015, 0.03, 0.05]):
        occ += (h - sdf(p + n * h, t)) / 2 ** i
    return np.clip(1 - 6 * occ, 0, 1)


def env(d):
    """Simple studio environment for reflections."""
    up = np.clip(d[..., 1], -1, 1)[..., None]
    az = np.arctan2(d[..., 0], d[..., 2])[..., None]
    softbox = ((np.sin(az * 3 + 0.7) > 0.75) & (up > 0.15) & (up < 0.75)).astype(F) * 1.1   # studio light panels
    sky = np.array([0.55, 0.57, 0.6], F) * (0.35 + 0.65 * up) + softbox + np.array([1.4, 1.35, 1.25], F) * np.clip(d @ LIGHT, 0, 1)[..., None] ** 40
    ground = np.array([0.35, 0.24, 0.15], F)
    return np.where(up > 0, sky, ground)


def look_at(eye, target):
    eye, target = np.asarray(eye, F), np.asarray(target, F)
    fwd = target - eye; fwd /= np.linalg.norm(fwd)
    right = np.cross(fwd, np.array([0, 1, 0], F)); right /= np.linalg.norm(right)
    up = np.cross(right, fwd)
    return eye, np.stack([right, up, fwd]).astype(F)    # rows: camera x, y, z (z forward)


def rays(eye, R, W, H, f, ss=1, rows=None):
    u = (np.arange(W * ss, dtype=F) + 0.5) / ss - W / 2
    v = (np.arange(H * ss, dtype=F) + 0.5) / ss - H / 2
    if rows is not None:
        v = v[rows[0] * ss:rows[1] * ss]
    uu, vv = np.meshgrid(u, v)
    dc = np.stack([uu / f, -vv / f, np.ones_like(uu)], -1)
    d = dc @ R; d /= np.linalg.norm(d, axis=-1, keepdims=True)
    return np.broadcast_to(eye, d.shape).astype(F), d.astype(F), dc


def render(eye, target, W=640, H=400, fov=48, ss=2, t=0.0, rows=None):
    eye, R = look_at(eye, target)
    f = F(W / 2 / np.tan(np.radians(fov) / 2))
    o, d, dc = rays(eye, R, W, H, f, ss, rows)
    Hf = H
    H = H if rows is None else rows[1] - rows[0]
    o, d = o.reshape(-1, 3), d.reshape(-1, 3)
    dist = march(o, d, t)
    p = o + d * dist[:, None]
    _, m = scene(p, t)
    n = normal(p, t)
    a = albedo(p, m, n, t)
    sh = soft_shadow(p, n, t); oc = ao(p, n, t)
    diff = np.clip(n @ LIGHT, 0, 1) * sh
    v = -d; hlf = LIGHT + v; hlf /= np.linalg.norm(hlf, axis=-1, keepdims=True)
    spec_pow = np.select([m == 2, m == 4, m == 0], [F(60), F(120), F(30)], F(8))
    spec_k = np.select([m == 2, m == 4, m == 0], [F(0.9), F(0.7), F(0.12)], F(0.03))
    spec = spec_k * np.clip(np.sum(n * hlf, -1), 0, 1) ** spec_pow * sh
    refl = d - 2 * np.sum(d * n, -1, keepdims=True) * n
    fres = (0.04 + 0.96 * (1 - np.clip(np.sum(n * v, -1), 0, 1)) ** 5)[:, None]
    metal = (m == 2)[:, None]
    col = a * (0.28 * oc + 0.85 * diff)[:, None]
    col = np.where(metal, a * (0.18 * oc + 0.45 * diff)[:, None] + 0.55 * env(refl) * oc[:, None] * (0.6 + 0.4 * sh[:, None]), col)
    col = col + spec[:, None] + np.where((m == 4)[:, None], 0.35 * fres * env(refl), 0)
    col = col / (1 + col * 0.35)                           # soft tone mapping
    img = np.clip(col, 0, 1) ** (1 / 2.2)
    zc = np.sum((p - eye) * R[2], -1)                      # depth along the optical axis
    img = img.reshape(H, ss, W, ss, 3).mean((1, 3))
    zc = zc.reshape(H * ss, W * ss)[ss // 2::ss, ss // 2::ss]
    m = m.reshape(H * ss, W * ss)[ss // 2::ss, ss // 2::ss]
    n = n.reshape(H * ss, W * ss, 3)[ss // 2::ss, ss // 2::ss]
    K = np.array([[f, 0, W / 2], [0, f, Hf / 2], [0, 0, 1]], F)
    return dict(rgb=img.astype(F), depth=zc.astype(F), mat=m, normal=n.astype(F), K=K, R=R, eye=eye)
