/* eslint-disable no-console */
'use strict';

module.exports = (name, withCache, callback) => {
  let s;

  const logs = [];
  logs.push(`node: ${process.uptime() * 1000}ms`);

  // So each test gets its own cache
  module.filename = module.parent.filename;
  s = Date.now();
  if (withCache) require('../v8-compile-cache');
  logs.push(`require-cache: ${Date.now() - s}ms`);
  module.filename = __filename;

  s = Date.now();
  callback();
  logs.push(`${name}: ${Date.now() - s}ms`);

  s = Date.now();
  process.on('exit', () => {
    logs.push(`exit: ${Date.now() - s}ms`);
    logs.push(`total: ${process.uptime() * 1000}ms`);
    console.log(logs.join('\t'));
  });
};
