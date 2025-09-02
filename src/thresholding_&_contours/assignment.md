# Assignment: Thresholding, Contour Finding, and Shape Approximation

1. **Collect a suitable image**  
   - Take a picture of an object with a **clear and simple background** (minimal texture).  
   - The object should have **high contrast** compared to the background.  
   - The object should have a **clearly defined border**.  
   - *Example*: a colored mug on a plain table, a book on a blank surface.  

2. **Apply Thresholding Methods**  
   - Use **Global Thresholding**  
     - Test different threshold values.  
     - Observe which value segments the object cleanly.  
   - Use **Adaptive Thresholding**  
     - Experiment with block sizes and offset parameters.  
     - Compare results to global thresholding.  
   - Use **Otsu’s Thresholding**  
     - Test optional Gaussian blur smoothing.  
     - Observe how it separates the object from the background.  

3. **Choose the Best Thresholding Result**  
   - Decide which method best isolates the object.  
   - Justify your choice based on clarity of the object and minimal background noise.  

4. **Find and Draw Contours**  
   - Use `cv.findContours` on the chosen thresholded image.  
   - Draw the contours onto a copy of the image.  
   - Highlight the largest contour corresponding to the object.  

5. **Approximate the Contour with a Polygon**  
   - Use `cv.approxPolyDP` to simplify the largest contour into a polygon.  
   - Experiment with different approximation precision values (`epsilon`) to balance accuracy and simplicity.  
   - Draw the approximated polygon over the object and compare with the original contour.  

6. **Discussion**  
   - Is the contour extraction and approximation satisfactory?  
   - How did the choice of thresholding method and parameters affect the result?  
   - How does the polygon approximation compare to the actual object shape?  

## Expected Submission

- **Original image** (photo of the object).  
- **Thresholded images**: Global, Adaptive, and Otsu (with parameter settings).  
- **Final contour image** (object outlined).  
- **Polygon approximation image** (simplified contour drawn).  
- **List of tested hyperparameters** (thresholds, block sizes, C values, blur size, approximation epsilon, etc.).  
- **Source code** used for processing and visualization.  