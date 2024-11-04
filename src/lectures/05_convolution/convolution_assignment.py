"""
Implement simple 2D convolution via numpy arrays and pure python code, i.e.
use for loops
"""

import numpy as np
import numpy.typing as npt

def convolve2d(src: npt.NDArray, kernel: npt.NDArray, padding: bool=True):
    """ Performs 2d convolution

    Args:
        src (array): source image
        kernel (array): kernel
        padding (bool): whether to add padding full of zeros to `src` image to
            have the same output size
    
    Returns:
        result (array): convolved image
    """
    result = None
    return result


"""
Use numba to improve performance of `convolve2d`, see:
    https://numba.pydata.org/

Compare runtime of both functions (old vs numba) on any image of your choice.
"""
