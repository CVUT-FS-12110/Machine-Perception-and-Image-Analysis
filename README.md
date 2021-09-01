# Machine Perception and Image Processing (Labs)

The subject introduces students to digital image processing and machine perception and algorithms.

## Lab schedule

| Week | Topic        | Presetation  |
|:----:|:-------------|:-------------|
|  1   | Python Basics - datatypes, flow (if-else, for, while), functions, classes | --- |
|  2   | Continuation (Python Basics) - libraries, visualization | |
|  3   | Histogram, histogram equalization, histogram matching | |
|  4   | Continuation | |
|  5   | High Dynamic Range (HDR) |  |
|  6   | Continuation |  |
|  7   | Segmentation |  |
|  8   | Continuation |  |
|  9   | Image restoration |  |
|  10  | Continuation |  |
|  11  | 3D vision and deep maps |  |
|  12  | Continuation |  |
|  13  | Excursion to CIIRC |  |
|  14  | Consultation |  |


## Setting up your environment

Python 3.7.9 was used for developing all the jupyter notebooks, however, every python > 3.5 should be fine.

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








