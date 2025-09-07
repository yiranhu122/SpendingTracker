#!/bin/bash

echo "========================================"
echo "Updating SpendingTracker Distribution"
echo "========================================"

# Function to check if last command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo "✓ $1"
    else
        echo "✗ $1 failed"
        exit 1
    fi
}

echo
echo "[1/6] Copying client files to dist..."
cp client/app.js dist/client/app.js
cp client/index.html dist/client/index.html  
cp client/styles.css dist/client/styles.css
check_success "Client files updated"

echo
echo "[2/6] Copying server files to dist..."
cp -r server/* dist/server/
check_success "Server files updated"

echo
echo "[3/6] Copying documentation files to dist..."
# Copy to dist root (for standalone executables)
cp AGENTS.md dist/AGENTS.md
cp FEATURES_SUMMARY.md dist/FEATURES_SUMMARY.md
cp README.md dist/README.md
cp DEPLOYMENT_GUIDE.md dist/DEPLOYMENT_GUIDE.md 2>/dev/null || true
cp NAS_DEPLOYMENT_GUIDE.md dist/NAS_DEPLOYMENT_GUIDE.md 2>/dev/null || true
cp NAS_QUICK_START.md dist/NAS_QUICK_START.md 2>/dev/null || true
cp QNAP_CONTAINER_GUIDE.md dist/QNAP_CONTAINER_GUIDE.md 2>/dev/null || true
cp SOFTWARE_SPECIFICATION.md dist/SOFTWARE_SPECIFICATION.md 2>/dev/null || true
cp CHANGELOG.md dist/CHANGELOG.md 2>/dev/null || true
cp UPDATE_DISTRIBUTION.md dist/UPDATE_DISTRIBUTION.md 2>/dev/null || true
cp DOCUMENTATION_TAB.md dist/DOCUMENTATION_TAB.md 2>/dev/null || true
cp TIMEZONE_FIX.md dist/TIMEZONE_FIX.md 2>/dev/null || true

# Copy to dist/server (for container deployments)
cp AGENTS.md dist/server/AGENTS.md 2>/dev/null || true
cp FEATURES_SUMMARY.md dist/server/FEATURES_SUMMARY.md 2>/dev/null || true
cp README.md dist/server/README.md 2>/dev/null || true
cp DEPLOYMENT_GUIDE.md dist/server/DEPLOYMENT_GUIDE.md 2>/dev/null || true
cp NAS_DEPLOYMENT_GUIDE.md dist/server/NAS_DEPLOYMENT_GUIDE.md 2>/dev/null || true
cp NAS_QUICK_START.md dist/server/NAS_QUICK_START.md 2>/dev/null || true
cp QNAP_CONTAINER_GUIDE.md dist/server/QNAP_CONTAINER_GUIDE.md 2>/dev/null || true
cp SOFTWARE_SPECIFICATION.md dist/server/SOFTWARE_SPECIFICATION.md 2>/dev/null || true
cp CHANGELOG.md dist/server/CHANGELOG.md 2>/dev/null || true
cp UPDATE_DISTRIBUTION.md dist/server/UPDATE_DISTRIBUTION.md 2>/dev/null || true
cp DOCUMENTATION_TAB.md dist/server/DOCUMENTATION_TAB.md 2>/dev/null || true
cp TIMEZONE_FIX.md dist/server/TIMEZONE_FIX.md 2>/dev/null || true
check_success "Documentation files updated"

echo
echo "[4/6] Copying Docker and deployment files to dist..."
cp Dockerfile dist/Dockerfile
cp docker-compose.yml dist/docker-compose.yml
cp .dockerignore dist/.dockerignore
cp docker-build.sh dist/docker-build.sh
cp docker-deploy.sh dist/docker-deploy.sh
cp launch-nas.bat dist/launch-nas.bat 2>/dev/null || true
cp launch-nas.sh dist/launch-nas.sh
cp launch.bat dist/launch.bat 2>/dev/null || true
cp qnap-setup.sh dist/qnap-setup.sh
cp package.json dist/package.json
cp package-lock.json dist/package-lock.json 2>/dev/null || true
check_success "Docker and deployment files updated"

echo
echo "[5/6] Building Windows executable..."
npm run package-win
check_success "Windows executable built"

echo
echo "[6/6] Building Linux and macOS executables..."
npm run package-linux
check_success "Linux executable built"

npm run package-mac
check_success "macOS executable built"

echo
echo "========================================"
echo "✅ Distribution update completed successfully!"
echo "========================================"
echo
echo "Updated files:"
echo "  • dist/client/ (app.js, index.html, styles.css)"
echo "  • dist/server/ (all server files)"
echo "  • dist/*.md (all documentation)"
echo "  • dist/spending-tracker-win.exe"
echo "  • dist/spending-tracker-linux"
echo "  • dist/spending-tracker-mac"
echo "  • dist/Dockerfile and deployment files"
echo
echo "Your NAS Docker deployment will automatically use"
echo "the updated files when you redeploy the container."
echo
