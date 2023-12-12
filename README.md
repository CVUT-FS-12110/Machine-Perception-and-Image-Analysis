# Machine Perception and Image Processing (Labs)

The subject introduces students to digital image processing and machine perception and algorithms.

## Lab schedule

This course assumes basic knowledge of [the python programming language](src%2Flectures%2F00-Python-Introduction%2FPython-Introduction.ipynb).

| Week | Topic                                                 | Presetation  |
|:----:|:------------------------------------------------------|:-------------|
|  1   | Introduction to OpenCV in Python                      | [OpenCV.ipynb](src%2Flectures%2F01_openCV%2FOpenCV.ipynb) |
|  2   | Histogram, histogram equalization, histogram matching | [histograms.ipynb](src%2Flectures%2F02_histograms%2Fhistograms.ipynb)|
|  3   | Continuation                                          | |
|  4   | High Dynamic Range (HDR)                              | [HDR.ipynb](src%2Flectures%2F04_HDR%2FHDR.ipynb) |
|  5   | Continuation                                          |  |
|  6   | Segmentation                                          | [segmentation.ipynb](src%2Flectures%2F06_segmentation%2Fsegmentation.ipynb) |
|  7   | Continuation                                          |  |
|  8   | Image restoration                                     | [Image Restoration.ipynb](src%2Flectures%2F08_image_restoration%2FImage%20Restoration.ipynb) |
|  9   | Continuation                                          | [FourierTransformation.ipynb](src%2Flectures%2F08_image_restoration%2FFourierTransformation.ipynb) |
|  10  | Morphological operations                              | [Morphological Operations](src%2Flectures%2F07_morphological_operations%2Fmorphological_operations.ipynb)  |
|  11  | Continuation                                          |  |
|  12  | 3D vision and deep maps                               | point cloud - [processing](src%2Flectures%2F09_point_cloud%2Fpoint_cloud_processing.ipynb) [clustering](src%2Flectures%2F09_point_cloud%2Fpoint_cloud_clustering.ipynb) |
|  13  | Continuation                                          |  |
|  14  | Consultation                                          |  |


## Setting up your environment

Python 3.9 was used for developing all the jupyter notebooks, however, every python > 3.8 should be fine.

### Windows

Suppose you clone this repository using `git clone` into path `C:\Users\username\source\mpip` and you already have python interpreter installed on your computer. First you need to go to projects repository, for example after opening command line you can see something like this:

```
PS C:\Users\username> 
```

Use command `cd source\mpip` to get into our project folder and create virtual enviroment:

```
python -m venv .venv
```

Note that `.venv` is my prefered convention for naming python virtual environment, you can use your own name (frequently used are `.env`, `env`, `venv` and even `ENV`)

Activate your python environment:

```
.venv\Scripts\activate
```

If you encounter execution policy problems, see [this stackoverflow thread](https://stackoverflow.com/questions/18713086/virtualenv-wont-activate-on-windows). You should see something like this in your command line:

```
(.venv) PS C:\Users\username\source\mpip>
```

Now we need to install all dependencies used in this project, we already prepared everything you need in text file `requirements.txt`, simply run:

```
pip install -r requirements.txt
```

Note, that if you need some special library, feel free to install it into your virtual enviroment using `pip install <package>` or if you need specific version use `pip install <package>==<version>`.

You are ready to go.

## Authors

* **Václav Hlaváč** - *Main architect, lectures, labs* - [---]()
* **Cyril Oswald** - *Initial work, labs* - [redeemer-zz](https://github.com/redeemer-zz)
* **Adam Peichl** - *Initial work, labs* - [LockeErasmus](https://github.com/LockeErasmus)








