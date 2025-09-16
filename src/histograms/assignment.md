# Assignment: Histogram Equalization in Different Color Spaces

1. **Collect a new image**  
   - Capture an image that is **low-contrast**, **overly dark**, or **overly bright**.  
   - Choose something where important details are hard to distinguish due to lighting or exposure.  
   - *Examples*: a shadowy room, an overexposed window, or a foggy outdoor scene.  

2. **Visualize the original histogram**  
   - Convert the image to **grayscale** and plot its histogram.  
   - Experiment with different numbers of bins (e.g., 32, 64, 128, 256) and compare how much detail the histograms reveal.  

3. **Apply histogram equalization (grayscale)**  
   - Equalize the grayscale version of your image.  
   - Display the **before and after** images side by side.  
   - Compare histograms of the original and equalized versions.  

4. **Try a different color space**  
   - Convert the original image into a color space such as **HSV** or **YCrCb**.  
   - Apply histogram equalization only on the **luminance channel** (e.g., V in HSV, Y in YCrCb).  
   - Convert the result back to RGB for display.  
   - Show how this approach differs from equalizing the grayscale image.  

5. **Discussion**  
   - Which method (grayscale vs. luminance channel) gave better visual results?  
   - Did the equalization help reveal hidden details?  
   - Are there any artifacts introduced by the process?  

## Expected Submission

- **Original image** (low-contrast / poorly exposed).  
- **Histograms of the original image** (several bin counts).  
- **Equalized grayscale image** + its histogram.  
- **Equalized luminance-channel image** (HSV/YCrCb) + its histogram.  
- **Comparison and short discussion** of results.  
- **Source code** for all steps (image conversion, histogram computation, equalization, and visualization).  

## Hint

[Notebook](histograms.ipynb)