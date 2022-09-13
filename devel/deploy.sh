#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-9

yarn build
gsutil -m cp -R ./build/* $TARGET/