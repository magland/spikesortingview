#!/bin/bash

set -ex

TARGET=gs://figurl/spikesortingview-8

yarn build
gsutil -m cp -R ./build/* $TARGET/