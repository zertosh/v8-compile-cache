'use strict';

// https://github.com/zertosh/slash-escape

const ESCAPE_LOOKUP = {
  '\\': 'zB',
  ':': 'zC',
  '/': 'zS',
  '\x00': 'z0',
  'z': 'zZ',
};

const ESCAPE_REGEX = /[\\:\/\x00z]/g;

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

module.exports = function escape(str) {
  return str.replace(ESCAPE_REGEX, escaper);
};
