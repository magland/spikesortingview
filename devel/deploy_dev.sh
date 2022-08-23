#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-8deva

yarn build
gsutil -m cp -R ./build/* $TARGET/
