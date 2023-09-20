import numpy as np

class ImageBGR:

    def __init__(self, file: str = None, image: np.ndarray = None):
        if file:
            self.__image = None  # load the image from file -- your code here
        elif image:
            self.__image = None # load the image from ndarray -- your code here
        else:
            raise AttributeError("") # add your code for the case of the error
        
    def gray(self) -> np.ndarray:
        """
        Returns the image in grayscale
        """
        
        return None #your code here
        
    def lab(self) -> np.ndarray:
        """
        Returns the image in Lab color format
        """
       
        return None #your code here
    
        
    def rgb(self) -> np.ndarray:
        """
        Returns the image in RGB color format
        """

        return None #your code here
        
    def bgr(self) -> np.ndarray:
        """
        Returns the image in BGR color format
        """
        
        return None #your code here
        
    def resize(self, width: int, height: int) -> 'ImageBGR':
        """
        Returns a new instance of ImageBGR class but with a new image shape that is gotten by OpenCV resize function
        """
                
        return None #your code here
        
    def rotate(self, angle: int, keep_ratio: bool) -> 'ImageBGR':
        """
        Returns a new instance of ImageBGR class containing the image from the original instance of the ImageBGR class but rotated by the given angle.
        If keep_ratio is set to True, the new image must be the same size as the original. If set to False, the new image must contain the entire image information 
        from the original image.
        """
        
        return None #your code here
        
    def histogram(self): -> np.ndarray:
        """
        Returns the histogram of the image from its grayscale version.
        """
        
        return None #your code here
        
    @property
    def shape(self) -> tuple:
        """
        A function decorated as an attribute that returns the dimensions of the stored image.
        """
        
        return (None, None, None) #your code here
    
    @property
    def size(self) -> int:
        """
        A function decorated as an attribute that returns the memory occupied by the image (purely the field in which the image is stored). 
        """
        
        return None #your code here
    