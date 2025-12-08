# Assignment
## Robust Detection of the Upper Shelf

---

## Dataset
You are provided with a fixed set of **9 augmented images** in the folder `AUGMENTED_OUTPUT/`.

Additionally, a script **`check_output.py`** is provided.  
Run it to visualize how the **correct bounding boxes** look on the images.  
This serves only as *reference* — your algorithm must **not** use these coordinates directly.

---

## Task
Create an automatic algorithm that **detects and crops the upper shelf** from each image in `AUGMENTED_OUTPUT/`.

Your method must:

- work **fully automatically** for all 9 images,
- **must not** use any hard-coded coordinates or image-specific thresholds,
- be **robust** to lighting changes, blur, occlusions, rotations, and distortions,
- produce for each input image:
  - a visualization with the detected region (bounding box or mask),
  - a cropped image of the detected shelf.

Use any techniques learned in previous lessons (edges, morphological ops, template matching, features, Hough lines, etc.).

---

## Requirements
- Implement your solution in **Python**.  
- Process all 9 images in a **loop**, no manual fine-tuning.  
- Save results (e.g., into `MY_OUTPUT/`):
  - `detection_*` – images with detected region visualized  
  - `crop_*` – cropped outputs  
- (Optional) Compare your crops with the ground-truth crops in `CORRECT_OUTPUT/`.
- Compare your results with the ground-truth crops using:
  1. **Visual comparison**: show *your crop* and the *correct output crop* side-by-side in a `matplotlib` figure.  
  2. **Numerical comparison (MAE)**: compute the **Mean Absolute Error** between your crop and the correct output crop.
  
---

## Expected Submission
- 9 detection visualizations  
- 9 cropped outputs  
- A short discussion including:
  - how your detection method works,
  - robustness, successes, failures,
  - how you ensured **no fixed coordinates** were used  
- Source code (`.py` file or Jupyter notebook)

---

## Hint
1. Inspect the dataset using `check_output.py` to understand what the shelf region looks like.  
2. Implement a fully automatic detection pipeline that generalizes to all 9 images.  
3. Validate your results by comparing them with the crops in `CORRECT_OUTPUT/`.

