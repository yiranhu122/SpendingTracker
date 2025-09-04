#!/bin/bash

echo "========================================"
echo "   QNAP Container Station Setup"
echo "========================================"
echo ""

# Default container path on QNAP
CONTAINER_PATH="/share/Container/spending-tracker"

echo "This script will help you set up SpendingTracker on QNAP Container Station"
echo ""

# Check if we're running on QNAP (rough check)
if [[ -d "/share/Container" ]]; then
    echo "✅ Detected QNAP system"
    
    # Create the container directory
    echo "Creating container directory: $CONTAINER_PATH"
    mkdir -p "$CONTAINER_PATH"
    mkdir -p "$CONTAINER_PATH/data"
    
    # Set permissions
    chmod 755 "$CONTAINER_PATH"
    chmod 755 "$CONTAINER_PATH/data"
    
    echo ""
    echo "📁 Next steps:"
    echo "1. Copy all SpendingTracker files to: $CONTAINER_PATH"
    echo "2. Navigate to the directory: cd $CONTAINER_PATH"
    echo "3. Run: docker compose up -d"
    echo ""
    echo "📋 Required files to copy:"
    echo "   - Dockerfile"
    echo "   - docker compose.yml"
    echo "   - package.json"
    echo "   - server/ folder"
    echo "   - client/ folder"
    echo "   - .dockerignore"
    echo ""
    
else
    echo "⚠️  This doesn't appear to be a QNAP system"
    echo "   Please run this script on your QNAP NAS via SSH"
    echo ""
    echo "📖 Alternative setup:"
    echo "1. SSH to your QNAP: ssh admin@[qnap-ip]"
    echo "2. Create directory: mkdir -p /share/Container/spending-tracker"
    echo "3. Copy files to that directory"
    echo "4. Run docker compose up -d"
    echo ""
fi

# Get network info
HOSTNAME=$(hostname)
IP_ADDR=$(hostname -I | awk '{print $1}')

if [ ! -z "$IP_ADDR" ]; then
    echo "🌐 Your QNAP IP address appears to be: $IP_ADDR"
    echo "   Once deployed, access at: http://$IP_ADDR:3001"
fi

echo ""
echo "📚 For detailed instructions, see: QNAP_CONTAINER_GUIDE.md"
