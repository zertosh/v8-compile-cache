/* eslint max-len: 0 */
'use strict';

// This test is to make sure that v8-compile-cache.js can at least load in
// Node 4/5.

const tap = require('tap');

tap.test('loads without throwing', t => {
  t.doesNotThrow(() => {
    require('../');
  });

  t.end();
});
