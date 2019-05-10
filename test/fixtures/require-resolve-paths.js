console.log(
  '%j',
  {
    hasRequireResolve: typeof require.resolve.paths === 'function',
    value: typeof require.resolve.paths === 'function'
      ? require.resolve.paths(process.argv[2])
      : undefined
  }
);
