# NAS Quick Start Guide

## 🚀 Quick Setup Steps

### 1. Prepare Your NAS
- **Install Node.js** on your NAS (check your NAS app center/package manager)
- **Enable SSH access** (if needed for command line setup)
- **Note your NAS IP address** (usually 192.168.x.x)

### 2. Deploy SpendingTracker

**Option A: Docker Container (Recommended for QNAP)**
1. Copy SpendingTracker files to `/share/Container/spending-tracker/`
2. SSH into NAS: `cd /share/Container/spending-tracker`
3. Run: `docker compose up -d`
4. See `QNAP_CONTAINER_GUIDE.md` for detailed instructions

**Option B: Source Code**
1. Copy entire `SpendingTracker` folder to your NAS
2. SSH into NAS and navigate to the folder
3. Run: `npm install`
4. Start: `npm run nas` or use `./launch-nas.sh`

**Option C: Executable**
1. Copy `spending-tracker` (Linux) or `spending-tracker.exe` (Windows) to NAS
2. Set environment variable: `NAS_MODE=true`
3. Run the executable

### 3. Access from Other Devices
- Open browser on any device
- Go to: `http://[YOUR-NAS-IP]:3001`
- Example: `http://192.168.1.100:3001`

### 4. Security Setup
- **NAS Firewall**: Allow port 3001 for local network only
- **Router**: Do NOT forward port 3001 to internet
- **VPN**: Use VPN for secure remote access

## ⚠️ Important Notes
- **Single user**: Designed for personal use, not multiple concurrent users
- **No authentication**: Anyone on your network can access
- **Database**: All data stored in SQLite file on NAS
- **Backups**: Use Database tab to create regular backups

## 📱 Device Access
Once running on NAS, you can access from:
- Desktop computers
- Laptops  
- Tablets
- Smartphones
- Any device with a web browser on your network

## 🔧 Common Commands
```bash
# Start in NAS mode
npm run nas

# Check if running
netstat -tulpn | grep :3001

# Stop (if running in background)
pkill -f "node server/index.js"
```
