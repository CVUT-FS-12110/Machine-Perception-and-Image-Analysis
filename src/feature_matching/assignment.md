# Assignment

1. **Collect a suitable pair of images**  
   - Capture two pictures of the **same scene/object** with your camera or cellphone.  
   - Change the viewpoint, distance, or angle slightly between the two shots.  
   - The scene should contain **distinct shapes, corners, or patterns** (e.g., a building façade, posters, or objects on a table).  
   - Avoid completely textureless surfaces (e.g., blank walls).  

2. **Apply Harris Corner Detection**  
   - Detect salient points in your **first image** using the Harris corner detector.  
   - Experiment with different parameter values (block size, aperture size, threshold).  
   - Visualize detected corners.  

3. **Apply SIFT Feature Detection and Matching**  
   - Detect SIFT keypoints and descriptors in both images.  
   - Match features between the two images.  
   - Visualize matches.  

4. **Apply ORB Feature Detection and Matching**  
   - Detect ORB keypoints and descriptors in both images.  
   - Match features between the two images.  
   - Visualize matches.  

5. **Compare the methods**  
   - Which method detects **more points**?  
   - Which method gives **more robust matches** when the viewpoint changes?  
   - Which method is **faster**?  
   - Briefly explain your observations.  

## Expected Submission

- **Original image pair** (your photos).  
- **Harris corner detection result** (with marked corners).  
- **SIFT matching result** (visualized matches).  
- **ORB matching result** (visualized matches).  
- **Discussion** comparing the SIFT and ORB.  
- **List of tested hyperparameters** (block size, thresholds, etc.).  
- **Source code** used for processing and visualization.  

## Hint

[Notebook](feature_matching.ipynb)