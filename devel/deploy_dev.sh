#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-6dev2

yarn build
gsutil -m cp -R ./build/* $TARGET/