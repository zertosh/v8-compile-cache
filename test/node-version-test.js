'use strict';

// This test is to make sure that v8-compile-cache.js can at least load in
// Node 4/5.

const tap = require('tap');
const semver = require('semver');

process.env.DISABLE_V8_COMPILE_CACHE = 1;

tap.test('loads without throwing', t => {
  t.doesNotThrow(() => {
    require('..');
  });

  t.end();
});

tap.test('supportsCachedData', t => {
  const hasV8WithCache = semver.satisfies(process.versions.node, '>=5.7.0');
  const supportsCachedData = require('..').__TEST__.supportsCachedData;
  t.equal(supportsCachedData(), hasV8WithCache);

  t.end();
});
