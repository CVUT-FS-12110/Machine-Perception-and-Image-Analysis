import cv2 as cv
from pathlib import Path


INPUT_DIR = Path("input_images")
OUTPUT_DIR = Path("reference_output")
OUTPUT_DIR.mkdir(exist_ok=True)


rectangles = [
    # ---  (aug0_01, aug0_02, aug0_03) ---
    ((345, 235), (1315, 665)),
    ((345, 235), (1315, 665)),
    ((345, 235), (1315, 665)),

    # ---  (aug1_01, aug1_02, aug1_03) ---
    ((450, 235), (1480, 665)),
    ((450, 215), (1480, 685)),
    ((450, 215), (1480, 685)),

    # --- (aug2_01, aug2_02, aug2_03) ---
    ((345, 235), (1315, 665)),
    ((345, 235), (1315, 665)),
    ((345, 235), (1315, 665)),
]

# seřadí soubory: aug0_01, aug0_02, ...
image_paths = sorted(INPUT_DIR.glob("*.jpg"))

if len(image_paths) != len(rectangles):
    raise ValueError(
        f"Number of images ({len(image_paths)}) != number of rectangles ({len(rectangles)})"
    )

for img_path, rect in zip(image_paths, rectangles):
    img = cv.imread(str(img_path))
    if img is None:
        print(f"Cannot read {img_path}, skipping.")
        continue

    (x1, y1), (x2, y2) = rect
    cv.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 3)

    out_path = OUTPUT_DIR / img_path.name
    cv.imwrite(str(out_path), img)
    print(f"Saved preview: {out_path}")
