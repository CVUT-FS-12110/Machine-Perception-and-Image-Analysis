# Assignment: Template Matching  

## Objectives

### 1. Prepare input data  
- Create **five images** of a similar scene (e.g., a table with multiple objects).  
- Choose object of interest you will focus on.
- Between the images, move the object of interest, but keep **very similar rotation and scale** .  
- Ensure that background is not too cluttered.  

### 2. Create templates  
- **Template (crop):**  
  - Select one object of interest from one of your images.  
  - Crop it out as a small rectangular region.  
- There will only one template for all images, do not create different
  template for every image!

### 3. Apply template matching  
- Convert images and templates to grayscale.  
- Use **four different OpenCV template matching methods**:  
  - `cv.TM_CCOEFF`  
  - `cv.TM_CCOEFF_NORMED`  
  - `cv.TM_CCORR_NORMED`  
  - `cv.TM_SQDIFF_NORMED`  
- For each method:  
  - Show the **heatmap of match scores**.  
  - Draw bounding boxes for the best matches on the original images.  
- Apply the template to every image.

### 4. Discussion  
- Which matching method performs best across your five images?
- Suggest improvements for your specific case (e.g., template modifications - resizing, blur, etc.).  

## Expected Submission  

- **Five input images** (scene with repeated objects).  
- **A template**  
- **Heatmap + detection images** for each method, mask and image.
- **Short written discussion.**
- **Source code** used for template matching and visualization.  

## Hint

[Notebook](template_matching.ipynb)