'use strict';

const fs = require('fs');
const path = require('path');
const mkdirpSync = require('./mkdirpSync');

const hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = class FileSystemBlobStore {
  constructor(directory) {
    this._blobFilename = path.join(directory, 'BLOB');
    this._mapFilename = path.join(directory, 'MAP');
    this._lockFilename = path.join(directory, 'LOCK');
    mkdirpSync(directory);
    this._load();
  }

  has(key, invalidationKey) {
    if (hasOwnProperty.call(this._inMemoryBlobs, key)) {
      return this._invalidationKeys[key] === invalidationKey;
    } else if (hasOwnProperty.call(this._storedBlobMap, key)) {
      return this._storedBlobMap[key][0] === invalidationKey;
    }
    return false;
  }

  get(key, invalidationKey) {
    if (hasOwnProperty.call(this._inMemoryBlobs, key)) {
      if (this._invalidationKeys[key] === invalidationKey) {
        return this._inMemoryBlobs[key];
      }
    } else if (hasOwnProperty.call(this._storedBlobMap, key)) {
      const blobMap = this._storedBlobMap[key];
      if (blobMap[0] === invalidationKey) {
        return this._storedBlob.slice(blobMap[1], blobMap[2]);
      }
    }
  }

  set(key, invalidationKey, buffer) {
    this._invalidationKeys[key] = invalidationKey;
    this._inMemoryBlobs[key] = buffer;
  }

  delete(key) {
    if (hasOwnProperty.call(this._inMemoryBlobs, key)) {
      delete this._inMemoryBlobs[key];
    }
    if (hasOwnProperty.call(this._invalidationKeys, key)) {
      delete this._invalidationKeys[key];
    }
    if (hasOwnProperty.call(this._storedBlobMap, key)) {
      delete this._storedBlobMap[key];
    }
  }

  save() {
    const dump = this._getDump();
    const blobToStore = Buffer.concat(dump[0]);
    const mapToStore = JSON.stringify(dump[1]);

    let acquiredLock = false;
    try {
      fs.writeFileSync(this._lockFilename, 'LOCK', {flag: 'wx'});
      acquiredLock = true;

      fs.writeFileSync(this._blobFilename, blobToStore);
      fs.writeFileSync(this._mapFilename, mapToStore);
    } catch (error) {
      // Swallow the exception silently only if we fail to acquire the lock.
      if (error.code !== 'EEXIST') {
        throw error;
      }
    } finally {
      if (acquiredLock) {
        fs.unlinkSync(this._lockFilename);
      }
    }
  }

  _load() {
    if (
      fs.existsSync(this._mapFilename) &&
      fs.existsSync(this._blobFilename)
    ) {
      try {
        this._storedBlob = fs.readFileSync(this._blobFilename);
        this._storedBlobMap = JSON.parse(fs.readFileSync(this._mapFilename));
      } catch (e) {
        // ...
      }
    }
    this._inMemoryBlobs = {};
    this._invalidationKeys = {};
    if (this._storedBlob == null || this._storedBlobMap == null) {
      this._storedBlob = new Buffer(0);
      this._storedBlobMap = {};
    }
  }

  _getDump() {
    const buffers = [];
    const blobMap = {};
    let offset = 0;

    function push(key, invalidationKey, buffer) {
      buffers.push(buffer);
      blobMap[key] = [invalidationKey, offset, offset + buffer.length];
      offset += buffer.length;
    }

    for (const key of Object.keys(this._inMemoryBlobs)) {
      const buffer = this._inMemoryBlobs[key];
      const invalidationKey = this._invalidationKeys[key];
      push(key, invalidationKey, buffer);
    }

    for (const key of Object.keys(this._storedBlobMap)) {
      if (hasOwnProperty.call(blobMap, key)) { continue; }
      const [invalidationKey, start, end] = this._storedBlobMap[key];
      const buffer = this._storedBlob.slice(start, end);
      push(key, invalidationKey, buffer);
    }

    return [buffers, blobMap];
  }
};
