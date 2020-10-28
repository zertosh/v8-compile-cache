'use strict';

const tap = require('tap');

process.env.DISABLE_V8_COMPILE_CACHE = 1;
const slashEscape = require('..').__TEST__.slashEscape;

var escapes = {
  '/a/b/c/d': 'zSazSbzSczSd',
  '/z/zZ/a/': 'zSzZzSzZZzSazS',
  'z:\\a/b': 'zZzCzBazSb',
  '\x00abc': 'z0abc',
};

tap.test('escape', t => {
  for (const key of Object.keys(escapes)) {
    t.equal(
      slashEscape(key),
      escapes[key]
    );
  }
  t.done();
});
