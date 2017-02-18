#!/bin/bash

# for i in {1..5}; do node bench/require-yarn.js; done

# rm -rf "$TMPDIR/v8-compile-cache"

for f in require-*.js; do
  echo "Running '$f'"
  for i in {1..5}; do node $f; done
done
