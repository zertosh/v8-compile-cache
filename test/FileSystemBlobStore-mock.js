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
    this._cachedFiles.push({key, invalidationKey, buffer});
    return buffer;
  }

  delete(key) {
    const i = this._cachedFiles.findIndex(file => file.key === key);
    if (i != null) {
      this._cachedFiles.splice(i, 1);
    }
  }
};
