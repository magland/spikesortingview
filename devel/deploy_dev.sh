#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-6dev

yarn build
gsutil -m cp -R ./build/* $TARGET/