# Image Analysis — Interactive Demonstrations

A static browser application accompanying the Machine Perception and Image Analysis laboratory assignments.

The module index contains demonstrations for image representation, histograms, geometric transformations, edge detection, thresholding, K-means segmentation, template and feature matching, and camera calibration.

Every module accepts a user-supplied image through the common workspace upload control. Generated scenes are used as fallbacks. Files and results remain local in the browser and are not uploaded.

Template matching additionally accepts images dropped directly onto its search canvas. Drag a rectangle over the image to define the template. The search image, extracted template, and two-dimensional response heatmap are displayed separately.

The K-means posterization module loads `./assets/obrazky/meduzy.jpeg` by default and accepts a separate image by file selection or drag-and-drop. Clustering runs in the browser over RGB values with either k-means++ or random initialization.

## Local use

There is no build step, external dependency, or local server. Open the root `index.html` directly in a browser. Scripts, styles, and default images use paths relative to that file.

## GitHub Pages

Publish the repository root as a static site. The entry point is `index.html`; scripts and styles remain in the `web` directory.

## Scope

Most modules execute the relevant image operation directly in JavaScript. Camera calibration uses a controlled lens-model visualization that isolates coverage, radial distortion, and the valid crop. These are discussion aids, not reference implementations of the assignments.
