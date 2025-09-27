# Assignment: Camera Calibration

In this assignment, you will capture a set of images of a checkerboard pattern, use them to **calibrate your camera**, and then validate the calibration by undistorting a test image.

## **1. Prepare the Dataset**
- Capture **30–40 images** of a checkerboard to use for calibration.
- The **checkerboard must be perfectly flat**:
  - Display it on a flatscreen monitor **or**
  - Print it on paper and make sure it is **completely unrolled and fixed** to a flat surface.
- Ensure the images are **sufficiently diverse**:
  - Vary the **distance** of the checkerboard from the camera.
  - Change **angles** and **tilts**.
  - Position the checkerboard near **different parts of the image frame**, especially the **edges and corners**.
- Avoid blurry or over/under-exposed images.

## **2. Compute the Camera Model**
- Use **OpenCV calibration functions** (`cv.findChessboardCorners`, `cv.calibrateCamera`) to estimate the **camera matrix** and **distortion coefficients**.
- Save the resulting parameters for later use.


## **3. Test the Calibration**
- Take **one or more test images** with the **same camera** and **exact same settings** as your calibration dataset:
  - Same resolution and aspect ratio.
  - Same focus and zoom level.
- Undistort the test image using `cv.undistort` and compare the results.
- ⚠️ **Important note:**
  - If your calibration dataset was created from **video frames**, you must also validate using **frames from the same type of video**, not separate still images.


## **Expected Submission**
Your final report should include:

1. **Dataset and Validation Image Overview**
   - Example images from the calibration dataset.
   - The test image used for validation.

2. **Camera Calibration**
   - An image with **detected checkerboard corners** drawn on it.
   - The **final camera model parameters**:
     - Camera matrix
     - Distortion coefficients

3. **Testing**
   - Side-by-side visualization of the **undistorted image**, showing:
     - **Uncropped** version (with black borders).
     - **Cropped** version (region of interest applied).


## **Hints**
- Use the example workflow in the [notebook](calibration.ipynb) as a reference.
- Start by testing with a small number of images to verify your pipeline.
- Good calibration requires **clear and accurate checkerboard corner detections**.
- For wide-angle cameras, consider using OpenCV’s **fisheye calibration module** for better results.
