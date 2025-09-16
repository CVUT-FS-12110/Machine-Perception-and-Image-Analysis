# Assignment: Image Segmentation with K-Means Clustering

## Objective
Learn to segment images using K-means clustering, analyze cluster colors, and extract specific objects based on cluster selection.

## Task Description

1. **Collect Suitable Images**  
   - Take **two images**:  
     1. A **landscape image** with multiple natural regions (sky, grass, buildings, water, etc.).  
     2. An **object image** with a clear object on a contrasting background (e.g., a mug on a plain table).  
   - Ensure the images have **distinct color regions** for better segmentation.  

2. **Apply K-Means Segmentation**  
   - Decide on a **reasonable number of clusters (K)** for each image:  
     - Landscape image: more clusters to capture different regions.  
     - Object image: fewer clusters to easily isolate the object.  
   - Apply K-means clustering and reconstruct the segmented images.  

3. **Analyze Clusters**  
   - Generate a **bar chart showing the cluster colors and their indices** for each image.
   - Order the clusters in the bar chart by pixel count.

4. **Object Segmentation via Cluster Selection**  
   - For the object image, **select one or more clusters** that correspond to the object.  
   - Create a new image where only the selected clusters are visible, and the rest is replaced by a custom background color.  

5. **Discussion**  
   - Compare the segmentation quality between the landscape and object images.  
   - Explain **why certain clusters represent meaningful regions** and others do not.  
   - Discuss what properties of the images (color contrast, lighting, texture) would improve segmentation.  
   - Comment on the effect of the number of clusters on segmentation results.  

## Expected Submission

- **Original images** (landscape and object).  
- **Segmented images** for each image (reconstructed from K-means clusters).  
- **Cluster bar charts** showing the color of each cluster and its index.  
- **Object-segmented image** (with selected clusters highlighted).  
- **List of tested hyperparameters** (number of clusters, K, etc.).  
- **Short discussion** comparing results and explaining insights.  
- **Source code** used for clustering, visualization, and segmentation.  

## Hint

[Notebook](pixel_clustering.ipynb)