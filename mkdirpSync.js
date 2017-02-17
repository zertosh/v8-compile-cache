'use strict';

// From https://github.com/substack/node-mkdirp/blob/f2003bb/index.js#L55-L98

var path = require('path');
var fs = require('fs');
var _0777 = parseInt('0777', 8);

module.exports = function mkdirpSync (p, opts, made) {
  if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  var mode = opts.mode;
  var xfs = opts.fs || fs;

  if (mode === undefined) {
    mode = _0777 & (~process.umask());
  }
  if (!made) made = null;

  p = path.resolve(p);

  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  }
  catch (err0) {
    switch (err0.code) {
      case 'ENOENT' :
        made = mkdirpSync(path.dirname(p), opts, made);
        mkdirpSync(p, opts, made);
        break;

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        var stat;
        try {
          stat = xfs.statSync(p);
        }
        catch (err1) {
          throw err0;
        }
        if (!stat.isDirectory()) throw err0;
        break;
    }
  }

  return made;
};
