blobStore = FileSystemBlobStore.load(
  path.join(process.env.ATOM_HOME, 'blob-store/')
)
NativeCompileCache.setCacheStore(blobStore)
NativeCompileCache.setV8Version(process.versions.v8)
NativeCompileCache.install()
