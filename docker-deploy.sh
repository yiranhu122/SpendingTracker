#!/bin/bash

echo "========================================"
echo "   SpendingTracker Docker Deploy"
echo "========================================"
echo ""

# Check if docker compose.yml exists
if [ ! -f "docker compose.yml" ]; then
    echo "❌ docker compose.yml not found!"
    echo "Please ensure you're in the correct directory."
    exit 1
fi

# Create data directory with proper permissions
mkdir -p data
chmod 755 data

echo "Deploying SpendingTracker container..."
echo ""

# Deploy with docker compose
docker compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    
    # Wait a moment for container to start
    sleep 3
    
    # Show container status
    echo "Container status:"
    docker compose ps
    echo ""
    
    # Try to get the IP address
    CONTAINER_IP=$(hostname -I | awk '{print $1}')
    
    echo "🌐 Access your SpendingTracker at:"
    echo "   http://localhost:3001"
    if [ ! -z "$CONTAINER_IP" ]; then
        echo "   http://$CONTAINER_IP:3001"
    fi
    echo ""
    
    echo "📊 Useful commands:"
    echo "   View logs: docker compose logs -f"
    echo "   Stop:      docker compose stop"
    echo "   Restart:   docker compose restart"
    echo "   Update:    docker compose down && docker compose build --no-cache && docker compose up -d"
    echo ""
    
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Check logs with: docker compose logs"
    exit 1
fi
