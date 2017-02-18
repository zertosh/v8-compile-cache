'use strict';

const path = require('path');
const os = require('os');

const FileSystemBlobStore = require('./FileSystemBlobStore');
const NativeCompileCache = require('./NativeCompileCache');

const cacheDir = path.join(os.tmpdir(), 'v8-compile-cache');
const blobStore = new FileSystemBlobStore(cacheDir);

NativeCompileCache.setCacheStore(blobStore);
NativeCompileCache.setV8Version(process.versions.v8);
NativeCompileCache.install();

process.on('exit', code => {
  if (blobStore.isDirty()) {
    blobStore.save();
  }
});
