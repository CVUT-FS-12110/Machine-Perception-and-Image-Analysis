# Assignment: Template Matching  

## Objectives

### 1. Prepare input data  
- Create **three images** of a similar scene (e.g., a table with multiple objects).  
- Choose object of interest you will focus on.
- Between the images, move the object of interest, but keep **very similar rotation and scale** .  
- Ensure that background is not too cluttered.  

### 2. Create templates  
- **Template A (crop):**  
  - Select one object of interest from one of your images.  
  - Crop it out as a small rectangular region.  
- **Template B (manual):**  
  - Create a simple **binary mask** of the object.  
  - This can be drawn by hand (e.g., in an image editor) or generated programmatically.  
- There will only two templates, do not create different
  template for every image!

### 3. Apply template matching  
- Convert images and templates to grayscale.  
- Use at least **four different OpenCV template matching methods**:  
  - `cv.TM_CCOEFF`  
  - `cv.TM_CCOEFF_NORMED`  
  - `cv.TM_CCORR_NORMED`  
  - `cv.TM_SQDIFF_NORMED`  
- For each method:  
  - Show the **heatmap of match scores**.  
  - Draw bounding boxes for the best matches on the original images.  
- Apply both templates to every image.

### 4. Compare templates  
- Compare the results for Template A vs. Template B. in different images. 
- Which one works better, and why?  
- Is one template more robust to background noise or small movements?  

### 5. Discussion  
- Which matching method performs best across your three images?  
- Does Template A (crop) or Template B (mask) generalize better?  
- Suggest improvements for your specific case (e.g., resizing, preprocessing, using multiple scales).  

## Expected Submission  

- **Three input images** (scene with repeated objects).  
- **Two templates**: crop and mask.  
- **Heatmap + detection images** for each method, mask and image.
- **Comparison of methods and templates** (short written discussion).  
- **Source code** used for template matching and visualization.  

## Hint

[Notebook](template_matching.ipynb)