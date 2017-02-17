'use strict';

const Module = require('module');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

function computeHash(contents) {
  return crypto.createHash('sha1').update(contents, 'utf8').digest('hex');
}

class NativeCompileCache {
  constructor() {
    this.cacheStore = null;
    this.previousModuleCompile = null;
  }

  setCacheStore(store) {
    this.cacheStore = store;
  }

  setV8Version(v8Version) {
    this.v8Version = v8Version.toString();
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
    const self = this;
    let resolvedArgv = null;
    // Here we override Node's module.js
    // (https://github.com/atom/node/blob/atom/lib/module.js#L378), changing
    // only the bits that affect compilation in order to use the cached one.
    Module.prototype._compile = function(content, filename) {
      const moduleSelf = this;
      // remove shebang
      content = content.replace(/^#!.*/, '');
      function require(path) {
        return moduleSelf.require(path);
      }
      require.resolve = function(request) {
        return Module._resolveFilename(request, moduleSelf);
      };
      require.main = process.mainModule;

      // Enable support to add extra extension types
      require.extensions = Module._extensions;
      require.cache = Module._cache;

      const dirname = path.dirname(filename);

      // create wrapper function
      const wrapper = Module.wrap(content);

      const cacheKey = filename;
      const invalidationKey = computeHash(wrapper + self.v8Version);
      let compiledWrapper = null;
      if (self.cacheStore.has(cacheKey, invalidationKey)) {
        const buffer = self.cacheStore.get(cacheKey, invalidationKey);

        const script = new vm.Script(wrapper, {
          filename,
          lineOffset: 0,
          displayErrors: true,
          cachedData: buffer,
          produceCachedData: true,
        });

        if (script.cachedDataRejected) {
          self.cacheStore.delete(cacheKey);
          // TODO: replace code
        }

        compiledWrapper = script.runInThisContext({
          filename,
          lineOffset: 0,
          columnOffset: 0,
          displayErrors: true,
        });
      } else {
        let script;
        try {
          script = new vm.Script(wrapper, {
            filename,
            lineOffset: 0,
            displayErrors: true,
            produceCachedData: true,
          });
          compiledWrapper = script.runInThisContext({
            filename,
            lineOffset: 0,
            columnOffset: 0,
            displayErrors: true,
          });
        } catch (err) {
          console.error(`Error running script ${filename}`);
          throw err;
        }
        if (script.cachedDataProduced) {
          self.cacheStore.set(cacheKey, invalidationKey, script.cachedData);
        }
      }
      if (global.v8debug) {
        if (!resolvedArgv) {
          // we enter the repl if we're not given a filename argument.
          if (process.argv[1]) {
            resolvedArgv = Module._resolveFilename(process.argv[1], null);
          } else {
            resolvedArgv = 'repl';
          }
        }

        // Set breakpoint on module start
        if (filename === resolvedArgv) {
          // Installing this dummy debug event listener tells V8 to start
          // the debugger.  Without it, the setBreakPoint() fails with an
          // 'illegal access' error.
          global.v8debug.Debug.setListener(() => {});
          global.v8debug.Debug.setBreakPoint(compiledWrapper, 0, 0);
        }
      }
      const args = [moduleSelf.exports, require, moduleSelf, filename, dirname, process, global];
      return compiledWrapper.apply(moduleSelf.exports, args);
    };
  }

  restorePreviousModuleCompile() {
    Module.prototype._compile = this.previousModuleCompile;
  }
}

module.exports = new NativeCompileCache();
