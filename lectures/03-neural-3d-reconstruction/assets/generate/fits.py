"""Stage 3: two small, real optimizations (CPU, PyTorch).

1. Fit an image with N 2D Gaussians (the 2D analogue of Gaussian splatting).
2. Fit an image with an MLP on raw (x, y) versus Fourier features (positional encoding).
"""
import sys, numpy as np, torch
from PIL import Image, ImageDraw

OUT = sys.argv[1]; torch.manual_seed(0)
hero = np.load("cache/hero.npz")["rgb"]
W, H = 192, 120
tgt = torch.tensor(np.asarray(Image.fromarray((hero * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)) / 255, dtype=torch.float32)
ys, xs = torch.meshgrid(torch.arange(H) + .5, torch.arange(W) + .5, indexing="ij")
pix = torch.stack([xs, ys], -1).reshape(-1, 2)


def render_g(p, N):
    mu = p["mu"]; s = torch.exp(p["ls"]); th = p["th"]
    c, si = torch.cos(th), torch.sin(th)
    # inverse covariance of R S S^T R^T
    a = c * c / s[:, 0] ** 2 + si * si / s[:, 1] ** 2; b = c * si * (1 / s[:, 0] ** 2 - 1 / s[:, 1] ** 2); d = si * si / s[:, 0] ** 2 + c * c / s[:, 1] ** 2
    out = torch.zeros(pix.shape[0], 3)
    for k in range(0, N, 250):
        dx = pix[:, None, 0] - mu[None, k:k + 250, 0]; dy = pix[:, None, 1] - mu[None, k:k + 250, 1]
        w = torch.exp(-.5 * (a[k:k + 250] * dx * dx + 2 * b[k:k + 250] * dx * dy + d[k:k + 250] * dy * dy)) * torch.sigmoid(p["op"][k:k + 250])
        out = out + w @ torch.sigmoid(p["col"][k:k + 250])
    return out.reshape(H, W, 3)


def fit_gauss(N, iters=500):
    idx = torch.randint(0, H * W, (N,))
    p = {"mu": pix[idx].clone(), "ls": torch.full((N, 2), float(np.log(max(1.5, 0.6 * np.sqrt(W * H / N))))), "th": torch.rand(N) * 3.14,
         "col": torch.logit(tgt.reshape(-1, 3)[idx].clamp(.02, .98)), "op": torch.full((N,), -1.0)}
    for v in p.values(): v.requires_grad_(True)
    opt = torch.optim.Adam(p.values(), lr=0.04)
    for it in range(iters):
        img = render_g(p, N); loss = ((img - tgt) ** 2).mean()
        opt.zero_grad(); loss.backward(); opt.step()
    with torch.no_grad():
        img = render_g(p, N).clamp(0, 1)
    psnr = -10 * np.log10(float(((img - tgt) ** 2).mean()))
    print(f"gauss N={N} PSNR {psnr:.1f} dB", flush=True)
    return img.numpy(), {k: v.detach().numpy() for k, v in p.items()}, psnr


def up(a, s=(576, 360)): return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).resize(s, Image.BICUBIC)


Image.fromarray((tgt.numpy() * 255).astype(np.uint8)).resize((576, 360), Image.BICUBIC).save(f"{OUT}/gauss-target.jpg", quality=90)
for N in (30, 200, 1200):
    img, p, ps = fit_gauss(N)
    up(img).save(f"{OUT}/gauss-fit-{N}.jpg", quality=90)
    if N == 200:     # show the primitives themselves
        im = up(tgt.numpy() * .35 + .65); dr = ImageDraw.Draw(im, "RGBA"); k = 576 / W
        for (mx, my), (l1, l2), th, col, op in zip(p["mu"], np.exp(p["ls"]), p["th"], 1 / (1 + np.exp(-p["col"])), 1 / (1 + np.exp(-p["op"]))):
            pts = [(mx * k + 1.5 * k * (l1 * np.cos(th) * np.cos(a) - l2 * np.sin(th) * np.sin(a)), my * k + 1.5 * k * (l1 * np.sin(th) * np.cos(a) + l2 * np.cos(th) * np.sin(a))) for a in np.linspace(0, 2 * np.pi, 28)]
            c = tuple(int(255 * v) for v in col)
            dr.polygon(pts, fill=c + (int(110 * op),), outline=(194, 24, 122, 200))
        im.save(f"{OUT}/gauss-ellipses.jpg", quality=90)
    open(f"{OUT}/gauss-psnr-{N}.txt", "w").write(f"{ps:.1f}")

# ---------------------------------------------------------------- positional encoding
W2, H2 = 160, 100
t2 = torch.tensor(np.asarray(Image.fromarray((hero * 255).astype(np.uint8)).resize((W2, H2), Image.LANCZOS)) / 255, dtype=torch.float32).reshape(-1, 3)
yy, xx = torch.meshgrid(torch.linspace(0, 1, H2), torch.linspace(0, 1, W2), indexing="ij")
xy = torch.stack([xx, yy], -1).reshape(-1, 2)


def enc(x, Lf):
    if Lf == 0: return x
    f = 2.0 ** torch.arange(Lf) * np.pi
    a = x[..., None] * f
    return torch.cat([x, torch.sin(a).flatten(1), torch.cos(a).flatten(1)], -1)


for Lf in (0, 8):
    torch.manual_seed(1)
    net = torch.nn.Sequential(torch.nn.Linear(enc(xy[:1], Lf).shape[1], 256), torch.nn.ReLU(), torch.nn.Linear(256, 256), torch.nn.ReLU(),
                              torch.nn.Linear(256, 256), torch.nn.ReLU(), torch.nn.Linear(256, 3), torch.nn.Sigmoid())
    opt = torch.optim.Adam(net.parameters(), lr=1e-3); X = enc(xy, Lf)
    for it in range(2500):
        loss = ((net(X) - t2) ** 2).mean(); opt.zero_grad(); loss.backward(); opt.step()
    with torch.no_grad(): out = net(X).reshape(H2, W2, 3).numpy()
    print(f"posenc L={Lf} PSNR {-10 * np.log10(float(loss)):.1f}", flush=True)
    up(out, (480, 300)).save(f"{OUT}/posenc-L{Lf}.jpg", quality=90)
up(t2.reshape(H2, W2, 3).numpy(), (480, 300)).save(f"{OUT}/posenc-target.jpg", quality=90)
print("done")
