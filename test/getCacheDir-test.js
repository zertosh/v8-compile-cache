'use strict';

const path = require('path');
const os = require('os');
const tap = require('tap');

process.env.DISABLE_V8_COMPILE_CACHE = 1;
const getCacheDir = require('..').__TEST__.getCacheDir;

tap.test('getCacheDir', t => {
  const cacheDir = getCacheDir();
  const parts = cacheDir.split(os.tmpdir());
  const nameParts = parts[1].split(path.sep);

  t.match(nameParts[1], /^v8-compile-cache(-\d+)?$/);
  t.equal(nameParts[2], process.versions.v8);

  t.done();
});
