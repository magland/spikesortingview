#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-6dev4

yarn build
gsutil -m cp -R ./build/* $TARGET/
