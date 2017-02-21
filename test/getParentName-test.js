/* eslint max-len: 0 */
'use strict';

const tap = require('tap');
const child_process = require('child_process');

tap.beforeEach(cb => {
  delete process.env.DISABLE_V8_COMPILE_CACHE;
  cb();
});

tap.test('handles --require', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    ['--require', '..', require.resolve('./fixtures/print-parent-name')],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);
  t.equal(String(ps.stdout).trim(), __dirname);

  t.end();
});

tap.test('bad module.parent.filename', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    ['--eval', `
      module.filename = null;
      console.log(require('..').__TEST__.getParentName());
    `],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);
  t.equal(String(ps.stdout).trim(), __dirname);

  t.end();
});

tap.test('module.parent.filename works with --eval', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    ['--eval', 'require("..")'],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);

  t.end();
});

tap.test('module.parent.filename works with --require', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    ['--require', '..'],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);

  t.end();
});

tap.test('module.parent.filename works with as arg script', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    [require.resolve('..')],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);

  t.end();
});
