tesseract.js-core
=================

![](https://raw.githubusercontent.com/jeromewu/tesseract.js-core/master/assets/images/tesseract.js-core.png)

Core part of [tesseract.js](https://github.com/naptha/tesseract.js), which compiles original tesseract from C to JavaScript WebAssembly.


## Compiling

To build tesseract-core.js by yourself, please install [docker](https://www.docker.com/) and run:

```
bash build-with-docker.sh
```

The generated files will be stored in root path.  When compiling, errors sometimes occur due to race conditions (some dependencies do not appear to compile properly in parallel).  Re-running generally resolves. 

## Structure

1.	Build scripts are in `build-scripts` folder
2.	Javascript/wrapper files are in `javascript` folder
3.	All dependencies (including Tesseract) are in `third_party` folder
    1. All dependencies are unmodified except for Tesseract, which uses a forked repo
    1. The Tesseract repo has the following changes:
       1. Modified `CMakeLists.txt` to build with emscripten
       1. Modified `ltrresultiterator.h` and `ltrresultiterator.cpp` to add `WordChoiceIterator` class
       1. Added `src/arch_see` folder, which is used instead of `src/arch` for the simd-enabled build
          1. This hard-codes the use of the SSE function
       1. Commented out "Empty page!!" message in `src/textord/colfind.cpp` to prevent this from printing to console
       1. Added functions for detecting page angle and applying rotation
          1. Modified `src/ccmain/thresholder.cpp`, `src/ccmain/thresholder.h`, `src/api/baseapi.cpp`, and `include/tesseract/baseapi.h` to add `exif` and `angle` arguments for rotating images
          1. Changed `FindLines` from "protected" to "public" in `baseapi.h` to expose to Javascript
             1. Allows for lines (and therefore page angle) to be detected without running unnecessary steps afterwards
          1. Added public `GetGradient` function to `baseapi.h` and `baseapi.cpp` for reporting page angle
             1. Also required minor changes to `src/ccmain/tesseractclass.h`, `src/ccmain/pagesegmain.cpp`, `src/textord/textord.cpp`, and `src/textord/textord.h`
                1. See this commit: https://github.com/Balearica/tesseract/commit/db6951f655263878f6344380a5ddb95e678d7c09
       2. Added `WriteImage` function to `baseapi.h` and `baseapi.cpp` for saving images (original, grey, and binary)
       3. Added `SaveParameters` and `RestoreParameters` functions to `baseapi.h` and `baseapi.cpp` for saving and restoring parameters
       4. Added calls to `EM_ASM_ARGS` to `src/ccmain/control.cpp` for progress logging (and added `<emscripten.h>` header)
       5. Rewrote `tprintf` function in `src/ccutil/tprintf.cpp` to force flushing
       6. Added new version of `SetImage` to `src/api/baseapi.cpp` and `include/tesseract/baseapi.h` that reads image from filesystem
          1. This was done to resolve memory leak--see [this issue](https://github.com/naptha/tesseract.js/issues/678)
       7. Edited `ParamUtils::PrintParams` in `src/ccutil/params.cpp` to remove description text (resolves bug)
          1. The bug was reported in [this](https://github.com/tesseract-ocr/tesseract/issues/3943) Git Issue, so we can cut this point if resolved in a future version of Tesseract
       8. Edited `src/ccmain/tessedit.cpp` to save error log to separate file (`/debugDev.txt`)

## Running Minimal Examples
To run the browser examples, launch a web server in the root of the repo (i.e. run `http-server`).  Then navigate to the pages in `examples/web/minimal/` in your browser.  

To run the node examples, navigate to `examples/node/minimal/` and then run e.g. `node index.wasm.js [input_file]`.

The "benchmark" examples behave similarly, except that they take longer to run and report runtime instead of recognition text.  All other examples are experimental and should not be expected to run. 

## Contribution

As we leverage git-submodule to manage dependencies, remember to add recursive when cloning the repository:

```
git clone --recursive https://github.com/naptha/tesseract.js-core
```
