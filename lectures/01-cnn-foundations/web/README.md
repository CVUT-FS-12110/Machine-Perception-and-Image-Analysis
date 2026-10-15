# CNN Foundations — web slides

The HTML slides for lecture 1 (77 slides) with live animations. They have
no dependencies and no build step. It works offline from
`file://` and on GitHub Pages.

Open `index.html` in Chrome, Edge, or Firefox and press **F** for fullscreen.

## Controls

| key | action |
| --- | --- |
| → · Space · PageDown · click | next step (then next slide) |
| ← · PageUp | previous step |
| Shift + → / ← | skip to next / previous slide |
| F | fullscreen |
| O | overview of all slides |
| R | restart the current slide |
| number + Enter | go to slide |
| H | help |

Presentation clickers send PageDown/PageUp, so they work out of the box.
The URL hash (`#/14/3`) stores slide and step, so a reload keeps your place.

Animations play *inside* a slide: continuous loops, such as the sliding
window, optimizer paths, and training curves, run while the slide is shown.
Step-driven animations advance with →. Some slides have sliders (output-size
formula, softmax/sigmoid, cross-entropy, regression losses) or buttons
(kernels on a real image). On that slide you can also drop your own image.

## Static PDF

    python ../shared/export_pdf.py .              # → 01-cnn-foundations.pdf
    python ../shared/export_pdf.py . out.pdf      # custom path

The script needs only Python and an installed Chrome or Edge (or set `CHROME`
to the browser path). It opens `index.html?print` headlessly, so every slide
is printed in its final state, one 16:9 page per slide. Re-run it after any
edit to the HTML. Ctrl + P → *Save as PDF* in the browser gives the same
result manually.

## Files

- `index.html` — slide content (one `<section class="slide">` per slide);
  sets `window.DECK_PARTS`, the part names shown under each title
- `viz1.js`, `viz2.js`, `viz3.js` — visuals for Parts 1–2, 3, and 4–5

The engine is shared by all lectures in `../../shared/`:
`deck.js` (slide engine + SVG toolkit), `kit.js` (flow diagrams, cuboids,
sliders, plots, receptive-field trees, table steps), `deck.css`, the CTU logo,
and `export_pdf.py`. A fix there applies to every lecture.

A visual is attached with `<div class="viz" data-viz="name">`. Its factory
`VIZ.name(host)` may return `{steps, set(step), start(), stop(), final()}`.
Elements with class `step` are revealed one per step.
