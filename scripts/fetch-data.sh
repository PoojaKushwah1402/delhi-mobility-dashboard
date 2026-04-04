#!/bin/bash
set -e

mkdir -p data/dmrc data/bus

echo "Downloading DMRC static data..."
curl -L -o data/dmrc.zip "https://otd.delhi.gov.in/data/staticDMRC/download"
unzip -o data/dmrc.zip -d data/dmrc/

echo "Downloading Bus static data..."
curl -L -o data/bus.zip "https://otd.delhi.gov.in/data/static/download"
unzip -o data/bus.zip -d data/bus/

echo "Done! Data downloaded to data/dmrc/ and data/bus/"
