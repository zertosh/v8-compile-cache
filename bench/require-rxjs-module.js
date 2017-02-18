#!/usr/bin/env node
'use strict';

const WITH_CACHE = true;

require('./_measure.js')('require-rxjs-module', WITH_CACHE, () => {
  require('rxjs');
});
