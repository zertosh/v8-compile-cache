/* eslint max-len: 0 */
'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const tap = require('tap');
const temp = require('temp');

const FileSystemBlobStore = require('../FileSystemBlobStore');

temp.track();

let storageDirectory;
let blobStore;

tap.beforeEach(cb => {
  storageDirectory = temp.path('filesystemblobstore');
  blobStore = new FileSystemBlobStore(storageDirectory);
  cb();
});

tap.afterEach(cb => {
  rimraf.sync(storageDirectory);
  cb();
});

tap.test('is empty when the file doesn\'t exist', t => {
  t.type(blobStore.get('foo', 'invalidation-key-1'), 'undefined');
  t.type(blobStore.get('bar', 'invalidation-key-2'), 'undefined');
  t.end();
});

tap.test('allows to read and write buffers from/to memory without persisting them', t => {
  blobStore.set('foo', 'invalidation-key-1', new Buffer('foo'));
  blobStore.set('bar', 'invalidation-key-2', new Buffer('bar'));

  t.same(blobStore.get('foo', 'invalidation-key-1'), new Buffer('foo'));
  t.same(blobStore.get('bar', 'invalidation-key-2'), new Buffer('bar'));

  t.type(blobStore.get('foo', 'unexisting-key'), 'undefined');
  t.type(blobStore.get('bar', 'unexisting-key'), 'undefined');

  t.end();
});

tap.test('persists buffers when saved and retrieves them on load, giving priority to in-memory ones', t => {
  blobStore.set('foo', 'invalidation-key-1', new Buffer('foo'));
  blobStore.set('bar', 'invalidation-key-2', new Buffer('bar'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('foo', 'invalidation-key-1'), new Buffer('foo'));
  t.same(blobStore.get('bar', 'invalidation-key-2'), new Buffer('bar'));
  t.type(blobStore.get('foo', 'unexisting-key'), 'undefined');
  t.type(blobStore.get('bar', 'unexisting-key'), 'undefined');

  blobStore.set('foo', 'new-key', new Buffer('changed'));

  t.same(blobStore.get('foo', 'new-key'), new Buffer('changed'));
  t.type(blobStore.get('foo', 'invalidation-key-1'), 'undefined');

  t.done();
});

tap.test('persists both in-memory and previously stored buffers when saved', t => {
  blobStore.set('foo', 'invalidation-key-1', new Buffer('foo'));
  blobStore.set('bar', 'invalidation-key-2', new Buffer('bar'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  blobStore.set('bar', 'invalidation-key-3', new Buffer('changed'));
  blobStore.set('qux', 'invalidation-key-4', new Buffer('qux'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('foo', 'invalidation-key-1'), new Buffer('foo'));
  t.same(blobStore.get('bar', 'invalidation-key-3'), new Buffer('changed'));
  t.same(blobStore.get('qux', 'invalidation-key-4'), new Buffer('qux'));
  t.type(blobStore.get('foo', 'unexisting-key'), 'undefined');
  t.type(blobStore.get('bar', 'invalidation-key-2'), 'undefined');
  t.type(blobStore.get('qux', 'unexisting-key'), 'undefined');

  t.end();
});

tap.test('allows to delete keys from both memory and stored buffers', t => {
  blobStore.set('a', 'invalidation-key-1', new Buffer('a'));
  blobStore.set('b', 'invalidation-key-2', new Buffer('b'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  blobStore.set('b', 'invalidation-key-3', new Buffer('b'));
  blobStore.set('c', 'invalidation-key-4', new Buffer('c'));
  blobStore.delete('b');
  blobStore.delete('c');
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('a', 'invalidation-key-1'), new Buffer('a'));
  t.type(blobStore.get('b', 'invalidation-key-2'), 'undefined');
  t.type(blobStore.get('b', 'invalidation-key-3'), 'undefined');
  t.type(blobStore.get('c', 'invalidation-key-4'), 'undefined');

  t.end();
});

tap.test('ignores errors when loading an invalid blob store', t => {
  blobStore.set('a', 'invalidation-key-1', new Buffer('a'));
  blobStore.set('b', 'invalidation-key-2', new Buffer('b'));
  blobStore.save();

  // Simulate corruption
  fs.writeFileSync(path.join(storageDirectory, 'MAP'), new Buffer([0]));
  fs.writeFileSync(path.join(storageDirectory, 'INVKEYS'), new Buffer([0]));
  fs.writeFileSync(path.join(storageDirectory, 'BLOB'), new Buffer([0]));

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.type(blobStore.get('a', 'invalidation-key-1'), 'undefined');
  t.type(blobStore.get('b', 'invalidation-key-2'), 'undefined');

  blobStore.set('a', 'invalidation-key-1', new Buffer('x'));
  blobStore.set('b', 'invalidation-key-2', new Buffer('y'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('a', 'invalidation-key-1'), new Buffer('x'));
  t.same(blobStore.get('b', 'invalidation-key-2'), new Buffer('y'));

  t.end();
});
