'use strict';

const tap = require('tap');
const child_process = require('child_process');
const semver = require('semver');

tap.beforeEach(cb => {
  delete process.env.DISABLE_V8_COMPILE_CACHE;
  cb();
});

const hasRequireResolvePaths = semver.satisfies(process.versions.node, '>=8.9.0');
if (hasRequireResolvePaths) {
  tap.test('does not override require.resolve.paths()', t => {
    const ps = child_process.spawnSync(
      process.execPath,
      ['--require', '..', require.resolve('./fixtures/resolve-paths')],
      {cwd: __dirname}
    );
    t.equal(ps.status, 0);
    t.equal(Array.isArray(JSON.parse(String(ps.stdout).trim())), true);

    t.end();
  });
}
