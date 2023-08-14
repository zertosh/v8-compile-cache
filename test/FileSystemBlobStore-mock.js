'use strict';

module.exports = class FileSystemBlobStoreMock {
  constructor() {
    this._cachedFiles = [];
  }

  has(key, invalidationKey) {
    return !!this._cachedFiles.find(
      file => file.key === key && file.invalidationKey === invalidationKey
    );
  }

  get(key, invalidationKey) {
    if (this.has(key, invalidationKey)) {
      return this._cachedFiles.find(
        file => file.key === key && file.invalidationKey === invalidationKey
      ).buffer;
    }
  }

  set(key, invalidationKey, buffer) {
    const entry = this._cachedFiles.find(
      file => file.key === key && file.invalidationKey === invalidationKey
    );
    if (entry == null) {
      this._cachedFiles.push({key, invalidationKey, buffer});
    } else {
      entry.buffer = buffer;
    }
    return buffer;
  }

  delete(key) {
    const i = this._cachedFiles.findIndex(file => file.key === key);
    if (i != null) {
      this._cachedFiles.splice(i, 1);
    }
  }
};
