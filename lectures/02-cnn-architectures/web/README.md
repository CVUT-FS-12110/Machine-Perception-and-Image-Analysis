# CNN Architectures — web slides

The HTML slides for lecture 2: 80 slides in 7 parts (one network, many
tasks · backbones · heads · detection · multi-scale necks · segmentation ·
attention and design). They have live animations and a few interactive
sliders (IoU, NMS threshold, focal loss, MobileNet width and resolution).

Open `index.html` in Chrome or Edge and press **F** for fullscreen. The keys
are the same as in lecture 1: → / ← step, **O** overview, **H** help.

## Files

- `index.html` — slide content
- `vizA.js` — Parts 1–2 (system view, backbones)
- `vizB.js` — Parts 3–4 (heads, detection)
- `vizC.js` — Parts 5–7 (necks, segmentation, attention, design)
- `../assets/` — real photos (cats, apples, steel billet) from the original course
  slides, plus overlays derived from them (semantic and
  instance masks, coarse stride-8 / stride-32 masks)

The engine (`deck.js`, `deck.css`, `kit.js`, logo) is shared with the other
lectures and lives in `../../shared/`.

## PDF

    python ../shared/export_pdf.py .      # → 02-cnn-architectures.pdf

Numbers in the ImageNet charts come from the torchvision reference weights.
The ablation table is explicitly marked as illustrative.
