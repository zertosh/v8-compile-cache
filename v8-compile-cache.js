'use strict';

const path = require('path');
const os = require('os');

const FileSystemBlobStore = require('./FileSystemBlobStore');
const NativeCompileCache = require('./NativeCompileCache');
const slashEscape = require('./slashEscape');

const cacheDir = path.join(os.tmpdir(), 'v8-compile-cache', process.versions.v8);
const prefix = slashEscape(module.parent.filename);
const blobStore = new FileSystemBlobStore(cacheDir, prefix);

const nativeCompileCache = new NativeCompileCache();
nativeCompileCache.setCacheStore(blobStore);
nativeCompileCache.install();

process.on('exit', code => {
  if (blobStore.isDirty()) {
    blobStore.save();
  }
  nativeCompileCache.uninstall();
});
