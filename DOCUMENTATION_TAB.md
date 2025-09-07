# Documentation Tab - Technical Details

## Overview
The Documentation tab provides built-in access to all user guides and technical documentation directly within the SpendingTracker application.

## Features
- **8 documentation files** available through dropdown selector
- **Markdown to HTML conversion** with proper formatting
- **Deployment-aware file loading** works across all deployment types
- **Graceful error handling** with helpful troubleshooting information

## Available Documents
1. **📋 Features Summary** - Complete overview of all application features
2. **📖 Getting Started** - Installation and setup instructions  
3. **📝 What's New** - Changelog with version history
4. **🔧 Technical Specifications** - Detailed technical documentation
5. **🚀 Deployment Guide** - Deployment options and instructions
6. **📦 Distribution Updates** - How to update distribution files
7. **🕒 Timezone Fix Details** - Technical details about date display fix
8. **👨‍💻 Development Guide** - Commands and development workflow

## Technical Implementation

### Server-Side Endpoint
- **Route**: `GET /docs/:filename`
- **Validation**: Filename pattern matching to prevent directory traversal
- **Multi-deployment support**: Automatically detects deployment type

### File Location Logic
```javascript
if (process.pkg) {
    // Standalone executable - same directory as .exe
    docPath = path.join(path.dirname(process.execPath), filename);
} else if (process.env.NAS_MODE || process.env.NODE_ENV === 'production') {
    // Container/NAS - server directory
    docPath = path.join(__dirname, filename);
} else {
    // Development - parent directory
    docPath = path.join(__dirname, '..', filename);
}
```

### Client-Side Features
- **Markdown parser**: Converts markdown to HTML with proper styling
- **Error handling**: Deployment-specific troubleshooting information
- **Refresh functionality**: Reload current document
- **Responsive design**: Scrollable content with maximum height

## Deployment Considerations

### Standalone Executables
- Documentation files must be in the same folder as the executable
- Files are automatically copied during `update-dist` process
- Works offline without network connection

### Container Deployment
- Documentation files included in Docker image
- Located in `/app/server/` directory within container
- Accessible through standard HTTP endpoints

### Development Mode
- Documentation files served from project root
- Hot-reload friendly for documentation updates
- Full debugging information available

## Security Features
- **Filename validation**: Only `.md` files with safe names allowed
- **Path sanitization**: Prevents directory traversal attacks  
- **Error information**: Deployment type exposed only in development mode

## User Experience
- **Default selection**: Features Summary loads first for immediate value
- **Visual feedback**: Loading states and error messages
- **Consistent styling**: Matches application design language
- **Mobile responsive**: Works on all device sizes

## Troubleshooting

### Documentation Not Loading
1. **Standalone**: Ensure `.md` files are in same folder as executable
2. **Container**: Check if container includes documentation files
3. **Development**: Verify files exist in project root

### Missing Files
- Run `update-dist` script to ensure all files are copied
- Check Docker build includes `COPY *.md ./server/` step
- Verify file permissions in deployment environment

## Future Enhancements
- **Search functionality** within documentation
- **Navigation between documents** with cross-references  
- **Table of contents** generation for long documents
- **Print-friendly formatting** for offline reference
