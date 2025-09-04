#!/bin/bash

echo "========================================"
echo "   SpendingTracker - NAS Mode"
echo "========================================"
echo ""
echo "Starting SpendingTracker for network access..."
echo ""

# Set environment variables for NAS mode
export NAS_MODE=true
export HOST=0.0.0.0
export PORT=3001

echo "Server will be accessible from network at:"
echo "  http://[YOUR-NAS-IP]:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the application
node server/index.js
