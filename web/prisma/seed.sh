#!/bin/sh

# -e Exit immediately when a command returns a non-zero status.
# -x Print commands before they are executed
set -ex

BASEDIR=$(dirname $0)

# Seeding command
sqlite3 $BASEDIR/dev.db < $BASEDIR/articles.sql
