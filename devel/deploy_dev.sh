#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-1-dev

yarn build
gsutil -m cp -R ./build/* $TARGET/