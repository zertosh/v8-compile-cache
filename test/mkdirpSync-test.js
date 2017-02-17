/* eslint max-len: 0 */
'use strict';

const fs = require('fs');
const path = require('path');
const tap = require('tap');
const temp = require('temp');

temp.track();

const mkdirpSync = require('../mkdirpSync');

tap.test('creates nested dirs', t => {
  const dirname = path.join(temp.path('mkdirpSync-test'), 'a/b/c');

  t.notOk(fs.existsSync(dirname));
  mkdirpSync(dirname);
  t.ok(fs.existsSync(dirname));

  t.doesNotThrow(() => {
    t.ok(fs.existsSync(dirname));
    mkdirpSync(dirname);
    t.ok(fs.existsSync(dirname));
  });

  t.end();
});

tap.test('throws if trying to write over a file', t => {
  const dirname = path.join(temp.path('mkdirpSync-test'), 'a');
  const filename = path.join(dirname, 'b');

  t.notOk(fs.existsSync(dirname));
  mkdirpSync(dirname);
  t.ok(fs.existsSync(dirname));

  fs.writeFileSync(filename, '\n');
  t.ok(fs.existsSync(dirname));

  t.throws(() => {
    mkdirpSync(filename);
  }, /EEXIST: file already exists/);

  t.end();
});
