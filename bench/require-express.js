#!/usr/bin/env node
'use strict';

const WITH_CACHE = true;

require('./_measure.js')('require-express', WITH_CACHE, () => {
  const express = require('express');
  const app = express();
});
