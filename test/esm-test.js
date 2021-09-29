'use strict';

const child_process = require('child_process');
const tap = require('tap');

tap.test('support dynamic imports', t => {
  const psWithCache = child_process.spawnSync(
    process.execPath,
    [
      '--require',
      '..',
      require.resolve('./fixtures/dynamic-import.js')
    ],
    {cwd: __dirname}
  );

  t.equal(psWithCache.stdout.toString('utf8').trim(), 'file-4');
  t.equal(psWithCache.status, 0);

  t.end();
});

