# `v8-module-cache` Changelog

## 2017-03-27, Version 1.1.0

* Safer cache directory creation (see [bcb3b12](https://github.com/zertosh/v8-compile-cache/commit/bcb3b12c819ab0927ec4408e70f612a6d50a9617)).
  - The cache is now suffixed with the user's uid on POSIX systems (i.e. `/path/to/tmp/v8-compile-cache-1234`).

## 2017-02-21, Version 1.0.0

* Initial release.
