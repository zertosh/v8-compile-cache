/* eslint max-len: 0 */
'use strict';

const tap = require('tap');
const slashEscape = require('../slashEscape');

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
