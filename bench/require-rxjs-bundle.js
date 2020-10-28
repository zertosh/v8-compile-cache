#!/usr/bin/env node
'use strict';

const WITH_CACHE = true;

require('./_measure.js')('require-rxjs-bundle', WITH_CACHE, () => {
  require('rxjs/bundles/rxjs.umd.js');
});
