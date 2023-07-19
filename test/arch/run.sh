#!/bin/bash

set -eo pipefail

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
: "${NODE_BIN:=node}"

if [ "$(/usr/bin/arch)" != "arm64" ]; then
  echo "arch/run.sh: This must be run on Apple Silicon." >&2
  exit
fi

# shellcheck disable=SC2016
"$NODE_BIN" "$THIS_DIR/yarn.js" config get init.author.name >/dev/null
/usr/bin/arch -x86_64 "$NODE_BIN" "$THIS_DIR/yarn.js" config get init.author.name >/dev/null

echo "Success!"
