# v8-compile-cahe

[![Build Status](https://travis-ci.org/zertosh/v8-compile-cache.svg?branch=master)](https://travis-ci.org/zertosh/v8-compile-cache)

https://v8project.blogspot.com/2015/07/code-caching.html

## Acknowledgements

* `FileSystemBlobStore` and `NativeCompileCache` are based on Atom's implementation of their v8 compile cache: 
  - https://github.com/atom/atom/blob/b0d7a8a/src/file-system-blob-store.js
  - https://github.com/atom/atom/blob/b0d7a8a/src/native-compile-cache.js
* `mkdirpSync` is based on:
  - https://github.com/substack/node-mkdirp/blob/f2003bb/index.js#L55-L98
