#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-2

yarn build
gsutil -m cp -R ./build/* $TARGET/