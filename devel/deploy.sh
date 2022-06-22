#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-5

yarn build
gsutil -m cp -R ./build/* $TARGET/