'use strict';

const fs = require('fs');
const path = require('path');
const mkdirpSync = require('./mkdirpSync');

module.exports = class FileSystemBlobStore {
  static load(directory) {
    const instance = new FileSystemBlobStore(directory);
    instance.load();
    return instance;
  }

  constructor(directory) {
    this.blobFilename = path.join(directory, 'BLOB');
    this.blobMapFilename = path.join(directory, 'MAP');
    this.invalidationKeysFilename = path.join(directory, 'INVKEYS');
    this.lockFilename = path.join(directory, 'LOCK');
    mkdirpSync(directory);
    this.reset();
  }

  reset() {
    this.inMemoryBlobs = new Map();
    this.invalidationKeys = {};
    this.storedBlob = new Buffer(0);
    this.storedBlobMap = {};
  }

  load() {
    if (!fs.existsSync(this.blobMapFilename)) {
      return;
    }
    if (!fs.existsSync(this.blobFilename)) {
      return;
    }
    if (!fs.existsSync(this.invalidationKeysFilename)) {
      return;
    }

    try {
      this.storedBlob = fs.readFileSync(this.blobFilename);
      this.storedBlobMap = JSON.parse(fs.readFileSync(this.blobMapFilename));
      this.invalidationKeys = JSON.parse(fs.readFileSync(this.invalidationKeysFilename));
    } catch (e) {
      this.reset();
    }
  }

  save() {
    const dump = this.getDump();
    const blobToStore = Buffer.concat(dump[0]);
    const mapToStore = JSON.stringify(dump[1]);
    const invalidationKeysToStore = JSON.stringify(this.invalidationKeys);

    let acquiredLock = false;
    try {
      fs.writeFileSync(this.lockFilename, 'LOCK', {flag: 'wx'});
      acquiredLock = true;

      fs.writeFileSync(this.blobFilename, blobToStore);
      fs.writeFileSync(this.blobMapFilename, mapToStore);
      fs.writeFileSync(this.invalidationKeysFilename, invalidationKeysToStore);
    } catch (error) {
      // Swallow the exception silently only if we fail to acquire the lock.
      if (error.code !== 'EEXIST') {
        throw error;
      }
    } finally {
      if (acquiredLock) {
        fs.unlinkSync(this.lockFilename);
      }
    }
  }

  has(key, invalidationKey) {
    const containsKey =
      this.inMemoryBlobs.has(key) ||
      this.storedBlobMap.hasOwnProperty(key);
    const isValid = this.invalidationKeys[key] === invalidationKey;
    return containsKey && isValid;
  }

  get(key, invalidationKey) {
    if (this.has(key, invalidationKey)) {
      return this.getFromMemory(key) || this.getFromStorage(key);
    }
  }

  set(key, invalidationKey, buffer) {
    this.invalidationKeys[key] = invalidationKey;
    return this.inMemoryBlobs.set(key, buffer);
  }

  delete(key) {
    this.inMemoryBlobs.delete(key);
    delete this.storedBlobMap[key];
  }

  getFromMemory(key) {
    return this.inMemoryBlobs.get(key);
  }

  getFromStorage(key) {
    if (!this.storedBlobMap[key]) {
      return;
    }
    const [start, end] = this.storedBlobMap[key];
    return this.storedBlob.slice(start, end);
  }

  getDump() {
    const buffers = [];
    const blobMap = {};
    let currentBufferStart = 0;

    function dump(key, getBufferByKey) {
      const buffer = getBufferByKey(key);
      buffers.push(buffer);
      blobMap[key] = [currentBufferStart, currentBufferStart + buffer.length];
      currentBufferStart += buffer.length;
    }

    for (const key of this.inMemoryBlobs.keys()) {
      dump(key, this.getFromMemory.bind(this));
    }

    for (const key of Object.keys(this.storedBlobMap)) {
      if (!blobMap[key]) {
        dump(key, this.getFromStorage.bind(this));
      }
    }

    return [buffers, blobMap];
  }
};
