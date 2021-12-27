#!/usr/bin/env bash

set -e

export CI=false 

npm run lint

npm run build
