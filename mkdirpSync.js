/* eslint-disable no-bitwise */
'use strict';

// From https://github.com/substack/node-mkdirp/blob/f2003bb/index.js#L55-L98

const path = require('path');
const fs = require('fs');

module.exports = function mkdirpSync(p_, mode_, made_) {
  const p = path.resolve(p_);
  const mode = mode_ || parseInt('0777', 8) & (~process.umask());
  let made = made_ || null;

  try {
    fs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    if (err0.code === 'ENOENT') {
      made = mkdirpSync(path.dirname(p), mode, made);
      mkdirpSync(p, mode, made);
    } else {
      try {
        const stat = fs.statSync(p);
        if (!stat.isDirectory()) { throw err0; }
      } catch (err1) {
        throw err0;
      }
    }
  }

  return made;
};
