#!/bin/bash
# Build script - runs build inside Docker container
# Usage: ./build.sh

set -e

echo "🐳 Building Spark Assembly Lab using Docker..."
echo ""

# Build the production Docker image
docker build \
  -f spark-assembly-lab/Dockerfile.prod \
  -t spark-assembly-lab:latest \
  .

echo ""
echo "✅ Build complete!"
echo ""
echo "To run the built image:"
echo "  docker run -p 8080:8080 spark-assembly-lab:latest"
echo ""
echo "Or use docker-compose:"
echo "  docker compose -f spark-assembly-lab/docker-compose.prod.yml up"
