#!/bin/bash

set -eu
set -o pipefail

dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
echo $dir

cargo build --manifest-path "$dir/Cargo.toml"
cargo build --release --manifest-path "$dir/Cargo.toml"
npm run build --prefix $dir/public/

sudo systemctl restart queue.service
sudo systemctl restart nginx.service

