# NAS Deployment Guide

## Overview
Run SpendingTracker on your NAS to access it from any device on your home network.

## Prerequisites
- **NAS with Node.js support** (Synology, QNAP, etc.)
- **Network connectivity** between NAS and client devices
- **Port 3001** available on your NAS

## Deployment Options

### Option 1: Using Source Code (Recommended for NAS)
1. **Copy files to NAS**:
   ```
   SpendingTracker/
   ├── server/
   ├── client/
   ├── node_modules/
   ├── package.json
   └── launch-nas.bat
   ```

2. **Install dependencies** on NAS:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   # Linux/Unix NAS:
   NAS_MODE=true HOST=0.0.0.0 PORT=3001 node server/index.js
   
   # Windows-based NAS:
   launch-nas.bat
   ```

### Option 2: Using Pre-built Executable
1. **Copy to NAS**:
   - `spending-tracker.exe` (if Windows NAS)
   - Or build for Linux: `npm run package-linux`

2. **Set environment variables**:
   ```bash
   export NAS_MODE=true
   export HOST=0.0.0.0
   export PORT=3001
   ```

3. **Run executable**:
   ```bash
   ./spending-tracker
   ```

## Network Access

### Find Your NAS IP Address
1. **Check NAS admin panel** for IP address
2. **Or use command line**:
   ```bash
   # On NAS (Linux/Unix):
   hostname -I
   
   # On Windows NAS:
   ipconfig
   ```

### Access from Other Devices
- **URL format**: `http://[NAS-IP]:3001`
- **Example**: `http://192.168.1.100:3001`

## Security Considerations

### 🔒 Important Security Notes
- **Internal network only**: Only accessible within your home network
- **No authentication**: Application has no built-in user authentication
- **Firewall**: Ensure port 3001 is blocked from external internet access
- **VPN recommended**: For remote access outside home network, use VPN

### Network Security Setup
1. **Configure NAS firewall**:
   - Allow port 3001 from local network only
   - Block port 3001 from internet/WAN

2. **Router configuration**:
   - Do NOT port forward port 3001 to internet
   - Keep access limited to local network (192.168.x.x)

## Troubleshooting

### Cannot Connect from Other Devices
1. **Check NAS firewall**: Ensure port 3001 is open for local network
2. **Verify IP address**: Use correct NAS IP address
3. **Test connectivity**: `ping [NAS-IP]` from client device
4. **Check port availability**: Ensure port 3001 isn't blocked

### Database Location
- **Source deployment**: Database creates in `server/spending.db`
- **Executable deployment**: Database creates in same folder as executable
- **Backup**: Use Database tab to create backups before updates

### Performance
- **Single user**: Designed for personal use, not concurrent users
- **Network latency**: May be slightly slower than local access
- **Database**: SQLite performs well for personal expense tracking

## Common NAS Platforms

### Synology NAS
1. Install Node.js package from Package Center
2. Use File Station to upload files
3. SSH into NAS and run commands
4. Consider creating a scheduled task for auto-start

### QNAP NAS
1. Install Node.js from App Center
2. Use File Manager to upload files
3. SSH access for command line operations

### TrueNAS/FreeNAS
1. Install Node.js in jail or as plugin
2. Configure network access through jail settings
3. Use shell access for deployment

## Backup Strategy
- **Regular backups**: Use Database tab to download backups
- **NAS backup**: Include SpendingTracker folder in NAS backup routine
- **Database file**: `server/spending.db` contains all your data
