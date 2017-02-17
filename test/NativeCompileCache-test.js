/* eslint max-len: 0, no-shadow: [1, {allow: ['t']}] */
'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');
const temp = require('temp');

temp.track();

const FileSystemBlobStore = require('../FileSystemBlobStore');
const nativeCompileCache = require('../NativeCompileCache');

describe('NativeCompileCache', () => {
  let fakeCacheStore;
  let cachedFiles;
  let fakeCachePath;

  beforeEach(cb => {
    fakeCachePath = temp.path('native-compile-cache-test');
    fakeCacheStore = new FileSystemBlobStore(fakeCachePath);
    cachedFiles = fakeCacheStore._cachedFiles;
    nativeCompileCache.setCacheStore(fakeCacheStore);
    nativeCompileCache.setV8Version('a-v8-version');
    nativeCompileCache.install();
    cb();
  });

  afterEach(cb => {
    nativeCompileCache.restorePreviousModuleCompile();
    cb();
  });

  it('writes and reads from the cache storage when requiring files', () => {
    let fn1 = require('./fixtures/file-1');
    const fn2 = require('./fixtures/file-2');

    expect(cachedFiles.length).toBe(2);


    expect(cachedFiles[0].cacheKey).toBe(require.resolve('./fixtures/file-1'));
    expect(cachedFiles[0].cacheBuffer).toBeInstanceOf(Uint8Array);
    expect(cachedFiles[0].cacheBuffer.length).toBeGreaterThan(0);
    expect(fn1()).toBe(1);

    expect(cachedFiles[1].cacheKey).toBe(require.resolve('./fixtures/file-2'));
    expect(cachedFiles[1].cacheBuffer).toBeInstanceOf(Uint8Array);
    expect(cachedFiles[1].cacheBuffer.length).toBeGreaterThan(0);
    expect(fn2()).toBe(2);

    delete Module._cache[require.resolve('./fixtures/file-1')];
    fn1 = require('./fixtures/file-1');
    expect(cachedFiles.length).toBe(2);
    expect(fn1()).toBe(1);
  });

  describe('when v8 version changes', () => {
    it('updates the cache of previously required files', () => {
      nativeCompileCache.setV8Version('version-1');
      let fn4 = require('./fixtures/file-4');

      expect(cachedFiles.length).toBe(1);
      expect(cachedFiles[0].cacheKey).toBe(require.resolve('./fixtures/file-4'));
      expect(cachedFiles[0].cacheBuffer).toBeInstanceOf(Uint8Array);
      expect(cachedFiles[0].cacheBuffer.length).toBeGreaterThan(0);
      expect(fn4()).toBe('file-4');

      nativeCompileCache.setV8Version('version-2');
      delete Module._cache[require.resolve('./fixtures/file-4')];
      fn4 = require('./fixtures/file-4');

      expect(cachedFiles.length).toBe(2);
      expect(cachedFiles[1].cacheKey).toBe(require.resolve('./fixtures/file-4'));
      expect(cachedFiles[1].invalidationKey).not.toBe(cachedFiles[0].invalidationKey);
      expect(cachedFiles[1].cacheBuffer).toBeInstanceOf(Uint8Array);
      expect(cachedFiles[1].cacheBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('when a previously required and cached file changes', () => {
    beforeEach(() => {
      fs.writeFileSync(
        path.resolve(__dirname + '/fixtures/file-5'),
        `\
    }
module.exports = function () { return 'file-5' }\
`
      );
    });

    afterEach(() => fs.unlinkSync(path.resolve(__dirname + '/fixtures/file-5')));

    it('removes it from the store and re-inserts it with the new cache', () => {
      let fn5 = require('./fixtures/file-5');

      expect(cachedFiles.length).toBe(1);
      expect(cachedFiles[0].cacheKey).toBe(require.resolve('./fixtures/file-5'));
      expect(cachedFiles[0].cacheBuffer).toBeInstanceOf(Uint8Array);
      expect(cachedFiles[0].cacheBuffer.length).toBeGreaterThan(0);
      expect(fn5()).toBe('file-5');

      delete Module._cache[require.resolve('./fixtures/file-5')];
      fs.appendFileSync(require.resolve('./fixtures/file-5'), '\n\n');
      fn5 = require('./fixtures/file-5');

      expect(cachedFiles.length).toBe(2);
      expect(cachedFiles[1].cacheKey).toBe(require.resolve('./fixtures/file-5'));
      expect(cachedFiles[1].invalidationKey).not.toBe(cachedFiles[0].invalidationKey);
      expect(cachedFiles[1].cacheBuffer).toBeInstanceOf(Uint8Array);
      expect(cachedFiles[1].cacheBuffer.length).toBeGreaterThan(0);
    });
  });

  it('deletes previously cached code when the cache is an invalid file', () => {
    fakeCacheStore.has.andReturn(true);
    fakeCacheStore.get.andCallFake(() => new Buffer('an invalid cache'));

    const fn3 = require('./fixtures/file-3');

    expect(fakeCacheStore.delete).toHaveBeenCalledWith(require.resolve('./fixtures/file-3'));
    expect(fn3()).toBe(3);
  });
});
