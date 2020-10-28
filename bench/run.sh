#!/bin/bash

# for i in {1..5}; do node bench/require-yarn.js; done

# rm -rf "$TMPDIR/v8-compile-cache"

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
: "${NODE_BIN:=node}"

# shellcheck disable=SC2016
"$NODE_BIN" -p '`node ${process.versions.node}, v8 ${process.versions.v8}`'

for f in "$THIS_DIR"/require-*.js; do
  printf 'Running "%s"\n' "$(basename "$f")"
  for _ in {1..5}; do "$NODE_BIN" "$f"; done
done
