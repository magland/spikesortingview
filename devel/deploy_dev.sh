#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-10dev

yarn build
gsutil -m cp -R ./build/* $TARGET/
