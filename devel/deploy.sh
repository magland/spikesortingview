#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-3

yarn build
gsutil -m cp -R ./build/* $TARGET/