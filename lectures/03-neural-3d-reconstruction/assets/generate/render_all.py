"""Stage 1: render every view once and cache it (npz)."""
import os, sys, time, numpy as np
import scene

OUT = "cache"; os.makedirs(OUT, exist_ok=True)
T = np.array([0, 0.03, 0.02], np.float32)


def orbit(az, el, r=0.58, target=T):
    a, e = np.radians(az), np.radians(el)
    return target + r * np.array([np.sin(a) * np.cos(e), np.sin(e), -np.cos(a) * np.cos(e)], np.float32)


def save(name, **kw):
    np.savez_compressed(f"{OUT}/{name}.npz", **kw)


def job(name, eye, target=T, **kw):
    if os.path.exists(f"{OUT}/{name}.npz"):
        return
    t0 = time.time(); r = scene.render(eye, target, **kw); save(name, **r)
    print(name, f"{time.time() - t0:.0f}s", flush=True)


HERO = np.array([-0.32, 0.30, -0.50], np.float32)
which = sys.argv[1] if len(sys.argv) > 1 else "all"
if which in ("all", "hero"):
    job("hero", HERO, W=960, H=600, ss=2)
if which in ("all", "stereo"):
    eye, R = scene.look_at(HERO, T)
    job("stereo_left", HERO, W=640, H=400, ss=2)
    job("stereo_right", HERO + R[0] * 0.06, T + R[0] * 0.06, W=640, H=400, ss=2)
if which in ("all", "train"):
    k = 0
    for el in (24, 42):
        for az in np.linspace(-95, 25, 7):
            job(f"train_{k:02d}", orbit(az, el), W=320, H=200, ss=1); k += 1
if which in ("all", "novel"):
    job("novel_side", orbit(105, 22), W=640, H=400, ss=2)
    job("top_view", orbit(35, 58), W=640, H=400, ss=2)
if which in ("all", "dyn"):
    eye, tg = np.array([-0.13, 0.16, -0.24], np.float32), np.array([0, 0.03, 0], np.float32)
    job("dyn_still", eye, tg, W=480, H=300, ss=2, t=0.0)
    for i, t in enumerate(np.linspace(0, 0.5, 8)):           # motion blur: average of sub-frames
        job(f"dyn_blur_{i}", eye, tg, W=480, H=300, ss=1, t=float(t))
    bands = 50                                               # rolling shutter: each band at a later time
    for b in range(bands):
        r0, r1 = b * 6, (b + 1) * 6
        job(f"dyn_rs_{b:02d}", eye, tg, W=480, H=300, ss=2, t=float(0.9 * b / bands), rows=(r0, r1))
print("done", flush=True)
