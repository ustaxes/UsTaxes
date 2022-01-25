#!/bin/bash

# Modified from https://raw.githubusercontent.com/jsmrcaga/action-netlify-deploy/master/entrypoint.sh
# This script was being run inside a docker container, which is a bit of extra overhead,
# we can make a bunch of simplifications and just run it inside github's (already) containerized
# environment.


set -e

# Install netlify globally before NVM to prevent EACCESS issues
npm i -g netlify-cli

# Save its exec path to run later
NETLIFY_CLI=$(which netlify)

AUTH=$1
APP_ID=$2
NETLIFY_DEPLOY_TO_PROD=true
BUILD_DIRECTORY='./build'
FUNCTIONS_DIRECTORY=''
DEPLOY_ALIAS=''
DEPLOY_MESSAGE='Deployed from github'

COMMAND="$NETLIFY_CLI deploy --auth=$AUTH --site=$APP_ID --dir=$BUILD_DIRECTORY --functions=$FUNCTIONS_DIRECTORY --message=$DEPLOY_MESSAGE"

if [[ $NETLIFY_DEPLOY_TO_PROD == "true" ]]
then
	COMMAND+=" --prod"
elif [[ -n $DEPLOY_ALIAS ]]
then
	COMMAND+=" --alias $DEPLOY_ALIAS"
fi

# Deploy with netlify
OUTPUT=$(sh -c "$COMMAND")

NETLIFY_OUTPUT=$(echo "$OUTPUT")
NETLIFY_PREVIEW_URL=$(echo "$OUTPUT" | grep -Eo '(http|https)://[a-zA-Z0-9./?=_-]*(--)[a-zA-Z0-9./?=_-]*') #Unique key: --
NETLIFY_LOGS_URL=$(echo "$OUTPUT" | grep -Eo '(http|https)://app.netlify.com/[a-zA-Z0-9./?=_-]*') #Unique key: app.netlify.com
NETLIFY_LIVE_URL=$(echo "$OUTPUT" | grep -Eo '(http|https)://[a-zA-Z0-9./?=_-]*' | grep -Eov "netlify.com") #Unique key: don't containr -- and app.netlify.com

echo "::set-output name=NETLIFY_OUTPUT::$NETLIFY_OUTPUT"
echo "::set-output name=NETLIFY_PREVIEW_URL::$NETLIFY_PREVIEW_URL"
echo "::set-output name=NETLIFY_LOGS_URL::$NETLIFY_LOGS_URL"
echo "::set-output name=NETLIFY_LIVE_URL::$NETLIFY_LIVE_URL"
