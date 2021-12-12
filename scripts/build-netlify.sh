#!/usr/bin/env bash

set -e

export CI=false 

git submodule sync --recursive
git submodule update --init --recursive

npm ci

npm run build
