'use strict';

const Module = require('module');
const path = require('path');

const moduleCompile = require('./moduleCompile');

class NativeCompileCache {
  constructor() {
    this.previousModuleCompile = null;
  }

  setCacheStore(cacheStore) {
    this.cacheStore = cacheStore;
  }

  install() {
    this.savePreviousModuleCompile();
    this.overrideModuleCompile();
  }

  uninstall() {
    this.restorePreviousModuleCompile();
  }

  savePreviousModuleCompile() {
    this.previousModuleCompile = Module.prototype._compile;
  }

  overrideModuleCompile() {
    const cacheStore = this.cacheStore;
    Module.prototype._compile = function(content, filename) {
      const self = this;
      function require(path) {
        return self.require(path);
      }
      require.resolve = function(request) {
        return Module._resolveFilename(request, self);
      };
      require.main = process.mainModule;

      // Enable support to add extra extension types
      require.extensions = Module._extensions;
      require.cache = Module._cache;

      const dirname = path.dirname(filename);

      const compiledWrapper = moduleCompile(cacheStore, filename, content);

      // We skip the debugger setup because by the time we run, node has already
      // done that itself.

      const args = [self.exports, require, self, filename, dirname, process, global];
      return compiledWrapper.apply(self.exports, args);
    };
  }

  restorePreviousModuleCompile() {
    Module.prototype._compile = this.previousModuleCompile;
  }
}

module.exports = new NativeCompileCache();
