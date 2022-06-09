#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-4

yarn build
gsutil -m cp -R ./build/* $TARGET/