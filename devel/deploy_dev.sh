#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-8dev

yarn build
gsutil -m cp -R ./build/* $TARGET/
