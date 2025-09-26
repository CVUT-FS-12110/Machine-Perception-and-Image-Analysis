# Assignment: Training a CNN Model for Classification

In this assignment, you will **train a convolutional neural network (CNN)** to classify images into **two classes** using the dataset you created in the previous task.



## **1. Prepare the Dataset**
- Use the **training and validation splits** created in the previous assignment.
- Implement a **PyTorch `Dataset`** class to:
  - Load images and their corresponding labels.
  - Apply any necessary preprocessing (resizing, normalization, etc.).
- Create **PyTorch `DataLoader`** objects for both training set and validation set


## **2. Build the Model**
- Design a **simple CNN backbone** with:
  - Convolutional layers
  - ReLU activations
  - Pooling layers
- Add a **fully connected classification head** for the final decision.
- Verify that **input and output shapes** match correctly throughout the network.


## **3. Train the Model**
- Select an appropriate:
  - **Loss function** (`torch.nn.CrossEntropyLoss` is recommended)
  - **Optimizer** (`Adam` or `SGD`)
- Monitor **training and validation loss** during each epoch.
- Track **classification accuracy** to evaluate performance.
- **Avoid overfitting or underfitting**:
  - Stop training when accuracy stabilizes or validation loss stops improving.
  - If overfitting occurs, try **data augmentation** or **regularization**.


## **Expected Submission**
Your final report should include:

1. **Dataset Overview**
   - Number of images in the training and validation sets, including a breakdown of positive and negative samples.
   - A figure showing **examples of positive and negative samples**.

2. **Model Architecture**
   - Nice schematic of the model (table, or diagram):
     - Layers
     - Shapes
     - Purpose of each component
     - Activation functions

3. **Convergence Plot**
   - A plot showing **training and validation loss over epochs**.

4. **Conclusion**
   - Was the task easy for the model given **your** dataset size and diversity?
   - If **your** dataset were larger or more complex (more variation, noisier images), how could the model or pipeline be improved?

## **Hints**
- Example workflow notebook: [CNN Example](cnn.ipynb)
- Start simple:
  - Use **2–3 convolutional layers** followed by a fully connected head.
- Watch the **gap between training and validation loss** to detect overfitting.
- Validate every step of the process - identify hidden mistakes that not cause direct error.
- If performance is too poor, experiment with:
  - Data augmentation
  - Learning rate adjustments
  - A deeper network
