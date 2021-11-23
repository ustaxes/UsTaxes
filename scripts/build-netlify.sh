#!/usr/bin/env bash

set -e

export CI=false 

cd ./ustaxes-forms/Y2020

echo "Running npm ci in 2020 forms directory"
npm ci
cd ../.. 

npm run lint

npm run build
