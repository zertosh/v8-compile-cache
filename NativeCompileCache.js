'use strict';

const Module = require('module');
const path = require('path');

const moduleCompile = require('./moduleCompile');

class NativeCompileCache {
  constructor() {
    this._previousModuleCompile = null;
  }

  setCacheStore(cacheStore) {
    this.cacheStore = cacheStore;
  }

  install() {
    const nativeCompileCache = this;
    this._previousModuleCompile = Module.prototype._compile;
    Module.prototype._compile = function(content, filename) {
      const self = this;
      function require(id) {
        return self.require(id);
      }
      require.resolve = function(request) {
        return Module._resolveFilename(request, self);
      };
      require.main = process.mainModule;

      // Enable support to add extra extension types
      require.extensions = Module._extensions;
      require.cache = Module._cache;

      const dirname = path.dirname(filename);

      const compiledWrapper =
        moduleCompile(nativeCompileCache.cacheStore, filename, content);

      // We skip the debugger setup because by the time we run, node has already
      // done that itself.

      const args = [self.exports, require, self, filename, dirname, process, global];
      return compiledWrapper.apply(self.exports, args);
    };
  }

  uninstall() {
    Module.prototype._compile = this._previousModuleCompile;
  }
}

module.exports = new NativeCompileCache();
