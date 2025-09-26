# Assignment: Dataset Creation and Augmentation

## **1. Collect Two Suitable Videos**  
- Capture **two short videos** using your camera or smartphone.  
- These videos will be used to create a **training dataset for a binary classification model**.  
- **One video should contain positive examples**, the other **negative examples**.  
- **Move the camera while recording** so that every frame is slightly different.  
- A few seconds of video are enough (aim for **100+ frames total**).  
- *Example*:  
  - **Positive samples video**: Camera circling around an **apple** (object) on a **desk** (background).  
  - **Negative samples video**: Camera circling around an **orange** (object) on the same **desk** (background).


## **2. Convert Videos into Images**  
- Extract every frame and save it as a **`.jpg` image**.  
- **Resize** the images to a reasonable size (e.g., **256×256**).  
- Use a **clear naming convention**: `image_<class>_<id>.jpg`
- `<class>`: `positive` / `negative` **or** `0` / `1`  
- `<id>`: unique identifier for the frame  


## **3. Create Training and Validation Split**  
- **Randomly split** the images into two groups:
  - **Training** (~80%)
  - **Validation** (~20%)  
- Store them in **separate folders** for clarity.  
- **Verify balance** between positive and negative samples by visually checking a few images.


## **4. Suggest Augmentations for Your Data**  
- Study possible augmentations in the **[Albumentations](https://albumentations.ai/docs/)** library.  
- Select **reasonable augmentations** that reflect **real-world variations** in your dataset.  
- Think carefully about transformations that make sense for your task (e.g., flipping, color changes, noise).


## **Expected Submission**

Your final report should include:

1. **Dataset goal description**  
   - Define what counts as **positive** and **negative** samples.  
   - Explain the **purpose** of your binary classification task.

2. **Video description**  
   - Provide details such as **number of frames**, **resolution**, **objects**, and **background**.

3. **Preview of images**  
   - Include **thumbnails** showing the diversity of both **training** and **validation** subsets.

4. **Chosen augmentations**  
   - List selected augmentations with **before/after image examples**.
   - Choose at least 5 augmentations.

5. **Conclusion**  
   - Explain **why** you chose certain augmentations and **why you excluded others**.


## **Hints**
- Example workflow notebook: [dataset_creation.ipynb](dataset_creation.ipynb)
- Think carefully about the **goal** of your binary classification.
- While selecting augmentations, ask yourself questions like:
  - Can the object **realistically** be flipped upside down or mirrored?  
  - Can the object **naturally vary in color**?  
  - Could there be **lighting or brightness changes** in real-world conditions?  
