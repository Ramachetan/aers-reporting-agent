#!/bin/bash

# Build and test locally
echo "Building Docker image locally..."
docker build -t aers-reporting-agent .

echo "Running container locally on port 8080..."
docker run -p 8080:8080 aers-reporting-agent

# To stop the container:
# docker stop $(docker ps -q --filter ancestor=aers-reporting-agent)
