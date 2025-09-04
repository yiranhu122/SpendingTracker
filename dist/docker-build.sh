#!/bin/bash

echo "========================================"
echo "   SpendingTracker Docker Build"
echo "========================================"
echo ""

# Set variables
IMAGE_NAME="spending-tracker"
TAG="latest"

echo "Building Docker image: $IMAGE_NAME:$TAG"
echo ""

# Create data directory if it doesn't exist
mkdir -p data

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy with: docker-compose up -d"
    echo "2. Check logs: docker-compose logs -f"
    echo "3. Access at: http://[your-ip]:3001"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    exit 1
fi
