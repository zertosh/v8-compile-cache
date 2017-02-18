#!/usr/bin/env node
'use strict';

const WITH_CACHE = true;

require('./_measure.js')('require-yarn-bundle', WITH_CACHE, () => {
  process.argv.push('config', 'get', 'init.author.name');
  require('./fixtures/yarn-0.20.3.js');
});
