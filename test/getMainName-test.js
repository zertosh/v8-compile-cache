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
    ['--require', '..', require.resolve('./fixtures/print-main-name')],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);
  t.equal(String(ps.stdout).trim(), __dirname);

  t.end();
});

tap.test('bad require.main.filename', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    ['--eval', `
      module.filename = null;
      console.log(require('..').__TEST__.getMainName());
    `],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);
  t.equal(String(ps.stdout).trim(), __dirname);

  t.end();
});

tap.test('require.main.filename works with --eval', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    ['--eval', 'require("..")'],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);

  t.end();
});

tap.test('require.main.filename works with --require', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    ['--require', '..'],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);

  t.end();
});

tap.test('require.main.filename works with as arg script', t => {
  const ps = child_process.spawnSync(
    process.execPath,
    [require.resolve('..')],
    {cwd: __dirname}
  );
  t.equal(ps.status, 0);

  t.end();
});
