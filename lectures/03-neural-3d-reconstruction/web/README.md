# Learned 3D and 4D Reconstruction — web slides

The HTML slides for lecture 3 (68 slides, 7 parts). The lecture is taught
**after the block on conventional methods** (camera models, epipolar geometry,
triangulation, bundle adjustment, visual SLAM) and assumes it. It also builds
on lectures 1–2: CNN features, encoder–decoders, the feature pyramid.

Parts: from VSLAM to dense 3D · representing 3D · learned depth · neural
radiance fields · Gaussian splatting · dynamic scenes · evaluation and
practice.

Most visuals use one running example, a 2D cross-section of a flange given
as a signed distance function (`sdf` in `vizA.js`). Points, mesh, voxels,
TSDF, occupancy, quadtree, and Gaussian fits are all computed from it in the
browser. Several slides are interactive:

- triangulation baseline
- voxel memory
- TSDF truncation
- number of Gaussians
- stereo depth error
- positional encoding (least-squares fit)
- volume rendering (surface sharpness, floaters)
- Gaussian covariance
- temporal smoothing
- camera synchronization
- Chamfer / F-score threshold

PSNR values on the evaluation slide are computed live.

Open `index.html` in Chrome or Edge; keys as in the other lectures.

## Files

- `index.html` — slide content
- `vizA.js` — Parts 1–3 and the shared 2D example (SDF, contours, Gaussian fit)
- `vizB.js` — Parts 4–5 (NeRF, Gaussian splatting)
- `vizC.js` — Parts 6–7 (dynamic scenes, evaluation)

The engine is shared in `../../shared/`. PDF:
`python ../shared/export_pdf.py .` (from the lecture folder).

## Images and difficulty

The lecture is a bonus for the end of the course, so it leads with pictures
and the *why*. Most parts open with real results on one rendered workshop
scene: stereo vs. network depth with error maps in mm, TSDF accuracy maps,
camera coverage, an image rebuilt from Gaussians, motion blur and rolling
shutter. Mechanism-level slides carry an orange **optional detail** badge
(`<section class="slide deep">`) and can be skipped. How the images are made:
`../assets/generate/README.md`.
