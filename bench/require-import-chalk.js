#!/usr/bin/env node
'use strict';

const WITH_CACHE = true;

require('./_measure.js')('require-chalk', WITH_CACHE, () => {
  // Node introduced support for dynamics import in v12
  const NODE_MAJOR_VERSION = process.versions.node.split('.')[0];
  if (NODE_MAJOR_VERSION < 12) {
    return;
  }

  process.argv.push('config', 'get', 'init.author.name');
  require('./esm/import-chalk.js');
});
