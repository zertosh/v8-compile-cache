'use strict';

const child_process = require('child_process');
const tap = require('tap');
const semver = require('semver');

tap.beforeEach(cb => {
  delete process.env.DISABLE_V8_COMPILE_CACHE;
  cb();
});

tap.test('require.resolve.paths module', t => {
  const psWithoutCache = child_process.spawnSync(
    process.execPath,
    [require.resolve('./fixtures/require-resolve-paths'), 'tap'],
    {cwd: __dirname}
  );

  const psWithCache = child_process.spawnSync(
    process.execPath,
    [
      '--require',
      '..',
      require.resolve('./fixtures/require-resolve-paths'),
      'tap',
    ],
    {cwd: __dirname}
  );

  const actual = JSON.parse(psWithCache.stdout);
  const expected = JSON.parse(psWithoutCache.stdout);

  t.same(actual, expected);
  t.equal(psWithCache.stderr.toString(), '');
  t.equal(psWithCache.status, 0);

  t.equal(
    actual.hasRequireResolve,
    semver.satisfies(process.versions.node, '>=8.9.0')
  );

  t.end();
});

tap.test('require.resolve.paths relative', t => {
  const psWithoutCache = child_process.spawnSync(
    process.execPath,
    [require.resolve('./fixtures/require-resolve-paths'), './foo'],
    {cwd: __dirname}
  );

  const psWithCache = child_process.spawnSync(
    process.execPath,
    [
      '--require',
      '..',
      require.resolve('./fixtures/require-resolve-paths'),
      './foo',
    ],
    {cwd: __dirname}
  );

  t.same(JSON.parse(psWithCache.stdout), JSON.parse(psWithoutCache.stdout));
  t.equal(psWithCache.stderr.toString(), '');
  t.equal(psWithCache.status, 0);

  t.end();
});
