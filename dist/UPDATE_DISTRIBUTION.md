# Distribution Update Guide

This guide explains how to automatically update all distribution files after making changes to the SpendingTracker application.

## Quick Update

### Windows
```bash
# Run the batch file
update-dist.bat

# OR using npm script
npm run update-dist
```

### Linux/macOS
```bash
# Make executable (first time only)
chmod +x update-dist.sh

# Run the shell script
./update-dist.sh

# OR using npm script
npm run update-dist-unix
```

## What Gets Updated

The update script automatically updates all distribution files:

### 1. **Client Files** → `dist/client/`
- `app.js` - Main application JavaScript
- `index.html` - HTML structure and navigation
- `styles.css` - CSS styling and layout

### 2. **Server Files** → `dist/server/`
- All server-side Node.js files
- Database schema and API endpoints

### 3. **Documentation** → `dist/*.md`
- `AGENTS.md` - Development guide
- `FEATURES_SUMMARY.md` - Feature documentation
- `README.md` - Main documentation
- All deployment guides (NAS, QNAP, Docker)

### 4. **Deployment Files** → `dist/`
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Docker Compose setup
- Shell scripts for NAS deployment
- Package configuration files

### 5. **Executables** → `dist/`
- `spending-tracker-win.exe` - Windows standalone
- `spending-tracker-linux` - Linux standalone  
- `spending-tracker-mac` - macOS standalone

## Deployment Impact

After running the update script:

- **Docker/NAS**: Redeploy container to use updated files
- **Standalone**: Use new executables for latest features
- **Source**: Updated files ready for direct Node.js deployment

## Manual Alternative

If you prefer manual updates:

```bash
# Copy client files
copy client\*.* dist\client\

# Copy server files  
xcopy server dist\server /E /Y

# Build executables
npm run package-win
npm run package-linux
npm run package-mac
```

## Troubleshooting

If the update script fails:
1. Ensure `dist/` directory exists
2. Check file permissions
3. Verify npm and pkg are installed
4. Run individual commands manually

## Version Control

The update script is safe to run multiple times and will:
- Overwrite existing files with latest versions
- Maintain existing database files
- Preserve container data volumes
