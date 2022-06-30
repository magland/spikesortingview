#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-6

yarn build
gsutil -m cp -R ./build/* $TARGET/