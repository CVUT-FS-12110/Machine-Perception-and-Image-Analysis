# Assignment: Edge Detection and Morphological Operations

1. **Collect a suitable image**  
   - Capture a picture with your camera or cellphone.  
   - The image should contain **many clear, straight edges** (e.g., windows, doors, fences).  
   - Avoid images with excessive texture or fuzzy content.  
   - *Example*: a building façade with uniform walls and sharp window frames.  

2. **Apply edge detectors**  
   - **Canny edge detector**:  
     - Experiment with different threshold values.  
     - Compare how stricter vs. looser thresholds affect the detected edges.  
   - **Sobel filter**:  
     - Compute gradients in both directions (x and y).  
     - Visualize gradient magnitude images.  
     - Try different kernel sizes or scaling options.  

3. **Compare edge detection methods**  
   - Which method produces smoother and more complete lines?  
   - Which method is more sensitive to noise?  
   - Explain your observations briefly.  

4. **Morphological operations (post-processing)**  
   - Choose **one of your edge detection results** (the one you consider most promising).  
   - Apply morphological transformations such as:  
     - **Erosion** (to thin edges or remove small noise).  
     - **Dilation** (to strengthen weak or broken edges).  
     - **Combinations** (e.g., opening or closing).  
   - Experiment with different kernel sizes and iterations.  
   - Discuss how these operations improve or worsen the edge map.  

## Expected Submission

- **Original image** (your photo).  
- **Canny detector outputs** (at least two threshold settings).  
- **Sobel filter outputs** (at least two settings).  
- **Comparison discussion** of Canny vs. Sobel.  
- **Morphological results**: before/after examples with chosen edge detector.  
- **Discussion** of how morphology improved (or harmed) the result.  
- **List of tested hyperparameters** (thresholds, kernel sizes, iterations, etc.).  
- **Source code** used for processing and visualization.  

## Hints

- Start with small kernels for morphology (`3x3`, `5x5`) and increase only if needed.  
- For noisy images, combining **Canny + morphological closing** often helps.  
- For broken lines, **dilation** is usually a good first step.  
