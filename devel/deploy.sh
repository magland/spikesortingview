#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-10

yarn upgrade
yarn build
gsutil -m cp -R ./build/* $TARGET/