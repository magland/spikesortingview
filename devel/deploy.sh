#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-7

yarn build
gsutil -m cp -R ./build/* $TARGET/