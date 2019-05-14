'use strict';

const path = require('path');
const os = require('os');
const tap = require('tap');
const vm = require('vm');

process.env.DISABLE_V8_COMPILE_CACHE = 1;
const getCacheDir = require('..').__TEST__.getCacheDir;

tap.test('getCacheDir (v8)', t => {
  const cacheDir = getCacheDir();
  const parts = cacheDir.split(os.tmpdir());
  const nameParts = parts[1].split(path.sep);

  t.match(nameParts[1], /^v8-compile-cache(-\d+)?$/);
  t.equal(nameParts[2], process.versions.v8);

  t.done();
});

tap.test('getCacheDir (chakracore)', t => {
  const cacheDir = vm.runInNewContext(
    '(' + getCacheDir.toString() + ')();',
    {
      process: {
        getuid: process.getuid,
        versions: {chakracore: '1.2.3'},
        env: {},
      },
      path,
      os,
    }
  );

  const parts = cacheDir.split(os.tmpdir());
  const nameParts = parts[1].split(path.sep);

  t.match(nameParts[1], /^v8-compile-cache(-\d+)?$/);
  t.equal(nameParts[2], 'chakracore-1.2.3');

  t.done();
});

tap.test('getCacheDir (unknown)', t => {
  const cacheDir = vm.runInNewContext(
    '(' + getCacheDir.toString() + ')();',
    {
      process: {
        getuid: process.getuid,
        version: '1.2.3',
        versions: {},
        env: {},
      },
      path,
      os,
    }
  );

  const parts = cacheDir.split(os.tmpdir());
  const nameParts = parts[1].split(path.sep);
  t.match(nameParts[1], /^v8-compile-cache(-\d+)?$/);
  t.equal(nameParts[2], 'node-1.2.3');

  t.done();
});

tap.test('getCacheDir (env)', t => {
  const cacheDir = vm.runInNewContext(
    '(' + getCacheDir.toString() + ')();',
    {
      process: {
        getuid: process.getuid,
        versions: {},
        env: {
          V8_COMPILE_CACHE_CACHE_DIR: 'from env',
        },
      },
      path,
      os,
    }
  );

  t.equal(cacheDir, 'from env');

  t.done();
});
