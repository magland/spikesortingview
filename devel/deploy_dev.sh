#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-8devc

yarn build
gsutil -m cp -R ./build/* $TARGET/
