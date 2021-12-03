#!/usr/bin/env bash

set -e

export CI=false 

npm ci

npx ts-node ./scripts/env.ts

npx ts-node ./scripts/setup.ts

npm run lint

npm run build
