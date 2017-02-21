'use strict';

const tap = require('tap');

process.env.DISABLE_V8_COMPILE_CACHE = 1;
const {slashEscape} = require('..').__TEST__;

var escapes = {
  '/a/b/c/d': 'zSazSbzSczSd',
  '/z/zZ/a/': 'zSzZzSzZZzSazS',
  'z:\\a/b': 'zZzCzBazSb',
  '\x00abc': 'z0abc',
};

tap.test('escape', t => {
  for (var key in escapes) {
    if (!escapes.hasOwnProperty(key)) continue;
    t.equal(
      slashEscape(key),
      escapes[key]
    );
  }
  t.done();
});
