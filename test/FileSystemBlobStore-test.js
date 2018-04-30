'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const tap = require('tap');
const temp = require('temp');

process.env.DISABLE_V8_COMPILE_CACHE = 1;
const FileSystemBlobStore = require('..').__TEST__.FileSystemBlobStore;

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
  t.equal(blobStore.isDirty(), false);
  t.type(blobStore.get('foo', 'invalidation-key-1'), 'undefined');
  t.type(blobStore.get('bar', 'invalidation-key-2'), 'undefined');
  t.end();
});

tap.test('allows to read and write buffers from/to memory without persisting them', t => {
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  blobStore.set('bar', 'invalidation-key-2', Buffer.from('bar'));

  t.same(blobStore.get('foo', 'invalidation-key-1'), Buffer.from('foo'));
  t.same(blobStore.get('bar', 'invalidation-key-2'), Buffer.from('bar'));

  t.type(blobStore.get('foo', 'unexisting-key'), 'undefined');
  t.type(blobStore.get('bar', 'unexisting-key'), 'undefined');

  t.end();
});

tap.test('persists buffers when saved and retrieves them on load, giving priority to in-memory ones', t => {
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  blobStore.set('bar', 'invalidation-key-2', Buffer.from('bar'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('foo', 'invalidation-key-1'), Buffer.from('foo'));
  t.same(blobStore.get('bar', 'invalidation-key-2'), Buffer.from('bar'));
  t.type(blobStore.get('foo', 'unexisting-key'), 'undefined');
  t.type(blobStore.get('bar', 'unexisting-key'), 'undefined');

  blobStore.set('foo', 'new-key', Buffer.from('changed'));

  t.same(blobStore.get('foo', 'new-key'), Buffer.from('changed'));
  t.type(blobStore.get('foo', 'invalidation-key-1'), 'undefined');

  t.done();
});

tap.test('persists both in-memory and previously stored buffers when saved', t => {
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  blobStore.set('bar', 'invalidation-key-2', Buffer.from('bar'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  blobStore.set('bar', 'invalidation-key-3', Buffer.from('changed'));
  blobStore.set('qux', 'invalidation-key-4', Buffer.from('qux'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('foo', 'invalidation-key-1'), Buffer.from('foo'));
  t.same(blobStore.get('bar', 'invalidation-key-3'), Buffer.from('changed'));
  t.same(blobStore.get('qux', 'invalidation-key-4'), Buffer.from('qux'));
  t.type(blobStore.get('foo', 'unexisting-key'), 'undefined');
  t.type(blobStore.get('bar', 'invalidation-key-2'), 'undefined');
  t.type(blobStore.get('qux', 'unexisting-key'), 'undefined');

  t.end();
});

tap.test('allows to delete keys from both memory and stored buffers', t => {
  blobStore.set('a', 'invalidation-key-1', Buffer.from('a'));
  blobStore.set('b', 'invalidation-key-2', Buffer.from('b'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  blobStore.set('b', 'invalidation-key-3', Buffer.from('b'));
  blobStore.set('c', 'invalidation-key-4', Buffer.from('c'));
  blobStore.delete('b');
  blobStore.delete('c');
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('a', 'invalidation-key-1'), Buffer.from('a'));
  t.type(blobStore.get('b', 'invalidation-key-2'), 'undefined');
  t.type(blobStore.get('b', 'invalidation-key-3'), 'undefined');
  t.type(blobStore.get('c', 'invalidation-key-4'), 'undefined');

  t.end();
});

tap.test('ignores errors when loading an invalid blob store', t => {
  blobStore.set('a', 'invalidation-key-1', Buffer.from('a'));
  blobStore.set('b', 'invalidation-key-2', Buffer.from('b'));
  blobStore.save();

  // Simulate corruption
  fs.writeFileSync(path.join(storageDirectory, 'MAP'), Buffer.from([0]));
  fs.writeFileSync(path.join(storageDirectory, 'BLOB'), Buffer.from([0]));

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.type(blobStore.get('a', 'invalidation-key-1'), 'undefined');
  t.type(blobStore.get('b', 'invalidation-key-2'), 'undefined');

  blobStore.set('a', 'invalidation-key-1', Buffer.from('x'));
  blobStore.set('b', 'invalidation-key-2', Buffer.from('y'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.same(blobStore.get('a', 'invalidation-key-1'), Buffer.from('x'));
  t.same(blobStore.get('b', 'invalidation-key-2'), Buffer.from('y'));

  t.end();
});

tap.test('object hash collision', t => {
  t.type(blobStore.get('constructor', 'invalidation-key-1'), 'undefined');
  blobStore.delete('constructor');
  t.type(blobStore.get('constructor', 'invalidation-key-1'), 'undefined');

  blobStore.set('constructor', 'invalidation-key-1', Buffer.from('proto'));
  t.same(blobStore.get('constructor', 'invalidation-key-1'), Buffer.from('proto'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);
  t.same(blobStore.get('constructor', 'invalidation-key-1'), Buffer.from('proto'));
  t.type(blobStore.get('hasOwnProperty', 'invalidation-key-2'), 'undefined');

  t.end();
});

tap.test('dirty state (set)', t => {
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  t.equal(blobStore.isDirty(), true);
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.equal(blobStore.isDirty(), false);
  blobStore.set('foo', 'invalidation-key-2', Buffer.from('bar'));
  t.equal(blobStore.isDirty(), true);

  t.end();
});

tap.test('dirty state (delete memory)', t => {
  blobStore.delete('foo');
  t.equal(blobStore.isDirty(), false);
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  blobStore.delete('foo');
  t.equal(blobStore.isDirty(), true);
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  t.equal(blobStore.isDirty(), false);
  blobStore.set('foo', 'invalidation-key-2', Buffer.from('bar'));
  t.equal(blobStore.isDirty(), true);

  t.end();
});

tap.test('dirty state (delete stored)', t => {
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  blobStore.save();

  blobStore = new FileSystemBlobStore(storageDirectory);

  blobStore.delete('foo');
  t.equal(blobStore.isDirty(), true);

  t.end();
});

tap.test('prefix', t => {
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  blobStore.save();

  t.ok(fs.existsSync(path.join(storageDirectory, 'MAP')));
  t.ok(fs.existsSync(path.join(storageDirectory, 'BLOB')));

  storageDirectory = temp.path('filesystemblobstore');
  blobStore = new FileSystemBlobStore(storageDirectory, 'prefix');
  blobStore.set('foo', 'invalidation-key-1', Buffer.from('foo'));
  blobStore.save();

  t.ok(fs.existsSync(path.join(storageDirectory, 'prefix.MAP')));
  t.ok(fs.existsSync(path.join(storageDirectory, 'prefix.BLOB')));

  t.end();
});
