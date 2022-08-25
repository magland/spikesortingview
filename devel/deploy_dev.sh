#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-8devb

yarn build
gsutil -m cp -R ./build/* $TARGET/
