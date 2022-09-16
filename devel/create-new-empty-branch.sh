#!/bin/bash

set -ex

# see https://stackoverflow.com/questions/34100048/create-empty-branch-on-github
git switch --orphan $1