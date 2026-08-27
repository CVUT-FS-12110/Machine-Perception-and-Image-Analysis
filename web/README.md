# Image Analysis — Interactive Demonstrations

A static browser application accompanying the Machine Perception and Image Analysis laboratory assignments.

The module index contains demonstrations for image representation, histograms, geometric transformations, edge detection, thresholding, K-means segmentation, template and feature matching, and camera calibration.

Every module accepts a user-supplied image through the common workspace upload control. Generated scenes are used as fallbacks. Files and results remain local in the browser and are not uploaded.

Template matching additionally accepts images dropped directly onto its search canvas. Drag a rectangle over the image to define the template. The search image, extracted template, and two-dimensional response heatmap are displayed separately.

## Local use

There is no build step and no external dependency. From the repository root run:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

Publish the repository root as a static site. The entry point is `index.html`; scripts and styles remain in the `web` directory.

## Scope

Most modules execute the relevant image operation directly in JavaScript. Camera calibration uses a controlled lens-model visualization that isolates coverage, radial distortion, and the valid crop. These are discussion aids, not reference implementations of the assignments.
