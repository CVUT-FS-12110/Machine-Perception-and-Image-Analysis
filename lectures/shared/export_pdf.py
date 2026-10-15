"""Export a lecture's HTML slides to PDF with headless Chrome or Edge.

Usage:  python shared/export_pdf.py <lecture folder> [output.pdf]
        python shared/export_pdf.py all          # every lecture folder
Reads <lecture>/web/index.html?print (every slide in its final state) and
writes <lecture>/<lecture>.pdf by default. Only the Python standard library
is needed (pikepdf, if installed, makes the PDF ~10-25 % smaller
losslessly); set CHROME to the browser path if it is not found.
"""
import os, pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]
NAMES = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome", "msedge"]


def find_browser():
    if os.environ.get("CHROME"):
        return os.environ["CHROME"]
    for p in CANDIDATES:
        if os.path.exists(p):
            return p
    for n in NAMES:
        if shutil.which(n):
            return shutil.which(n)
    sys.exit("Chrome or Edge not found; set the CHROME environment variable to its path.")


def export(lecture, out=None):
    lecture = pathlib.Path(lecture).resolve()
    out = pathlib.Path(out or lecture / f"{lecture.name}.pdf").resolve()
    url = (lecture / "web" / "index.html").as_uri() + "?print"
    subprocess.run([find_browser(), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    "--allow-file-access-from-files", "--virtual-time-budget=10000",
                    f"--print-to-pdf={out}", url], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if not out.exists():
        sys.exit(f"PDF was not created for {lecture.name}.")
    compact(out)
    print(f"written {out} ({out.stat().st_size // 1024} kB)")


def compact(path):
    """Lossless repacking (max. Flate, object streams): ~10-25 % smaller, pixel-identical.
    Optional: needs `pip install pikepdf`; skipped silently otherwise."""
    try:
        import pikepdf
    except ImportError:
        return
    tmp = path.with_suffix(".tmp.pdf")
    with pikepdf.open(path) as pdf:
        pdf.save(tmp, compress_streams=True, recompress_flate=True,
                 object_stream_mode=pikepdf.ObjectStreamMode.generate,
                 stream_decode_level=pikepdf.StreamDecodeLevel.generalized)
    if tmp.stat().st_size < path.stat().st_size:
        tmp.replace(path)
    else:
        tmp.unlink()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if sys.argv[1] == "all":
        for d in sorted(ROOT.iterdir()):
            if (d / "web" / "index.html").exists():
                export(d)
    else:
        export(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
