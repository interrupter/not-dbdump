#!/bin/bash
MONGO_HOST=$1
MONGO_DB=$2
MONGO_LOGIN=$3
MONGO_PASS=$4
MONGO_ARCHIVE=$5
mongodump mongodb://${MONGO_LOGIN}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DB}?authSource=${MONGO_DB} --gzip --archive=${MONGO_ARCHIVE}
