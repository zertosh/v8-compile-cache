'use strict';

const Module = require('module');
const crypto = require('crypto');
const vm = require('vm');

module.exports = function moduleCompile(cacheStore, filename, content) {
  // https://github.com/nodejs/node/blob/v7.5.0/lib/module.js#L511

  // Remove shebang
  var contLen = content.length;
  if (contLen >= 2) {
    if (content.charCodeAt(0) === 35/*#*/ &&
        content.charCodeAt(1) === 33/*!*/) {
      if (contLen === 2) {
        // Exact match
        content = '';
      } else {
        // Find end of shebang line and slice it off
        var i = 2;
        for (; i < contLen; ++i) {
          var code = content.charCodeAt(i);
          if (code === 10/*\n*/ || code === 13/*\r*/) break;
        }
        if (i === contLen) {
          content = '';
        } else {
          // Note that this actually includes the newline character(s) in the
          // new output. This duplicates the behavior of the regular expression
          // that was previously used to replace the shebang line
          content = content.slice(i);
        }
      }
    }
  }

  // create wrapper function
  var wrapper = Module.wrap(content);

  var invalidationKey = crypto
    .createHash('sha1')
    .update(content, 'utf8')
    .digest('hex');

  var buffer = cacheStore.get(filename, invalidationKey);

  var script = new vm.Script(wrapper, {
    filename: filename,
    lineOffset: 0,
    displayErrors: true,
    cachedData: buffer,
    produceCachedData: true,
  });

  if (script.cachedDataProduced) {
    cacheStore.set(filename, invalidationKey, script.cachedData);
  } else if (script.cachedDataRejected) {
    cacheStore.delete(filename);
  }

  const compiledWrapper = script.runInThisContext({
    filename: filename,
    lineOffset: 0,
    columnOffset: 0,
    displayErrors: true,
  });

  return compiledWrapper;
};
