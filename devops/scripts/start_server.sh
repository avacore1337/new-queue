#!/bin/bash

set -eu
set -o pipefail

sleep 1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
pushd $DIR/../..
target/release/queuesystem

