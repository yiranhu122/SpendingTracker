@echo off
echo ========================================
echo Updating SpendingTracker Distribution
echo ========================================

echo.
echo [1/6] Copying client files to dist...
copy "client\app.js" "dist\client\app.js" >nul
copy "client\index.html" "dist\client\index.html" >nul  
copy "client\styles.css" "dist\client\styles.css" >nul
echo ✓ Client files updated

echo.
echo [2/6] Copying server files to dist...
xcopy "server" "dist\server" /E /I /Y >nul
echo ✓ Server files updated

echo.
echo [3/6] Copying documentation files to dist...
REM Copy to dist root (for standalone executables)
copy "AGENTS.md" "dist\AGENTS.md" >nul
copy "FEATURES_SUMMARY.md" "dist\FEATURES_SUMMARY.md" >nul
copy "README.md" "dist\README.md" >nul
copy "DEPLOYMENT_GUIDE.md" "dist\DEPLOYMENT_GUIDE.md" >nul
copy "NAS_DEPLOYMENT_GUIDE.md" "dist\NAS_DEPLOYMENT_GUIDE.md" >nul
copy "NAS_QUICK_START.md" "dist\NAS_QUICK_START.md" >nul
copy "QNAP_CONTAINER_GUIDE.md" "dist\QNAP_CONTAINER_GUIDE.md" >nul
copy "SOFTWARE_SPECIFICATION.md" "dist\SOFTWARE_SPECIFICATION.md" >nul
copy "CHANGELOG.md" "dist\CHANGELOG.md" >nul
copy "UPDATE_DISTRIBUTION.md" "dist\UPDATE_DISTRIBUTION.md" >nul
copy "DOCUMENTATION_TAB.md" "dist\DOCUMENTATION_TAB.md" >nul
copy "TIMEZONE_FIX.md" "dist\TIMEZONE_FIX.md" >nul

REM Copy to dist/server (for container deployments)
copy "AGENTS.md" "dist\server\AGENTS.md" >nul
copy "FEATURES_SUMMARY.md" "dist\server\FEATURES_SUMMARY.md" >nul
copy "README.md" "dist\server\README.md" >nul
copy "DEPLOYMENT_GUIDE.md" "dist\server\DEPLOYMENT_GUIDE.md" >nul
copy "NAS_DEPLOYMENT_GUIDE.md" "dist\server\NAS_DEPLOYMENT_GUIDE.md" >nul
copy "NAS_QUICK_START.md" "dist\server\NAS_QUICK_START.md" >nul
copy "QNAP_CONTAINER_GUIDE.md" "dist\server\QNAP_CONTAINER_GUIDE.md" >nul
copy "SOFTWARE_SPECIFICATION.md" "dist\server\SOFTWARE_SPECIFICATION.md" >nul
copy "CHANGELOG.md" "dist\server\CHANGELOG.md" >nul
copy "UPDATE_DISTRIBUTION.md" "dist\server\UPDATE_DISTRIBUTION.md" >nul
copy "DOCUMENTATION_TAB.md" "dist\server\DOCUMENTATION_TAB.md" >nul
copy "TIMEZONE_FIX.md" "dist\server\TIMEZONE_FIX.md" >nul
echo ✓ Documentation files updated

echo.
echo [4/6] Copying Docker and deployment files to dist...
copy "Dockerfile" "dist\Dockerfile" >nul
copy "docker-compose.yml" "dist\docker-compose.yml" >nul
copy ".dockerignore" "dist\.dockerignore" >nul
copy "docker-build.sh" "dist\docker-build.sh" >nul
copy "docker-deploy.sh" "dist\docker-deploy.sh" >nul
copy "launch-nas.bat" "dist\launch-nas.bat" >nul
copy "launch-nas.sh" "dist\launch-nas.sh" >nul
copy "launch.bat" "dist\launch.bat" >nul
copy "qnap-setup.sh" "dist\qnap-setup.sh" >nul
copy "package.json" "dist\package.json" >nul
copy "package-lock.json" "dist\package-lock.json" >nul
echo ✓ Docker and deployment files updated

echo.
echo [5/6] Building Windows executable...
call npm run package-win
if %ERRORLEVEL% neq 0 (
    echo ✗ Windows executable build failed
    goto :error
) else (
    echo ✓ Windows executable built successfully
)

echo.
echo [6/6] Building Linux and macOS executables...
call npm run package-linux
if %ERRORLEVEL% neq 0 (
    echo ✗ Linux executable build failed
    goto :error
)
echo ✓ Linux executable built successfully

call npm run package-mac  
if %ERRORLEVEL% neq 0 (
    echo ✗ macOS executable build failed
    goto :error
)
echo ✓ macOS executable built successfully

echo.
echo ========================================
echo ✅ Distribution update completed successfully!
echo ========================================
echo.
echo Updated files:
echo   • dist/client/ (app.js, index.html, styles.css)
echo   • dist/server/ (all server files)  
echo   • dist/*.md (all documentation)
echo   • dist/spending-tracker-win.exe
echo   • dist/spending-tracker-linux
echo   • dist/spending-tracker-mac
echo   • dist/Dockerfile and deployment files
echo.
echo Your NAS Docker deployment will automatically use
echo the updated files when you redeploy the container.
echo.
pause
goto :end

:error
echo.
echo ========================================
echo ❌ Distribution update failed!
echo ========================================
echo Please check the error messages above.
echo.
pause

:end
