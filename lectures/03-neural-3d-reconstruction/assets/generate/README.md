# Generating the lecture 3 images

All photos and maps in `../` come from one synthetic workshop scene with exact
geometry (`scene.py`, a numpy sphere tracer). Real algorithms run on the
renders and are scored against the true geometry:

| step | script | produces |
| --- | --- | --- |
| 1 | `render_all.py [hero\|stereo\|train\|novel\|dyn]` | renders into `cache/` (≈ 1 h on CPU in total; run the groups in parallel) |
| 2 | `process.py <assets dir>` | ORB features, OpenCV SGBM stereo, Depth Anything V2 (small), coverage, TSDF fusion with/without pose error, motion blur, rolling shutter |
| 3 | `fits.py <assets dir>` | 2D Gaussian fits (30/200/1200) and the positional-encoding MLP (PyTorch, CPU) |

Requirements: `numpy scipy scikit-image pillow opencv-python-headless torch transformers`.
Measured on these images: SGBM 69 % valid pixels with a 3 mm median error;
monocular + scale 12 mm median error; TSDF 0.4 mm.
