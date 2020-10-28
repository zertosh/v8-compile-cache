#!/usr/bin/env node
'use strict';

const WITH_CACHE = true;

require('./_measure.js')('require-yarn', WITH_CACHE, () => {
  process.argv.push('config', 'get', 'init.author.name');
  require('yarn/lib/cli.js');
});
