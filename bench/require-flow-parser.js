#!/usr/bin/env node
'use strict';

const WITH_CACHE = true;

require('./_measure.js')('require-flow-parser', WITH_CACHE, () => {
  require('flow-parser');
});
