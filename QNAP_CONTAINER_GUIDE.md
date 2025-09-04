# QNAP Container Station Deployment Guide

## 🐳 Deploy SpendingTracker as Docker Container

### Prerequisites
- **QNAP NAS** with Container Station installed
- **SSH access** to your QNAP NAS
- **Basic Docker knowledge** (optional but helpful)

## 🚀 Deployment Methods

### Method 1: Using Docker Compose (Recommended)

#### Step 1: Prepare Files on QNAP
1. **SSH into your QNAP NAS**:
   ```bash
   ssh admin@[YOUR-QNAP-IP]
   ```

2. **Create deployment directory**:
   ```bash
   mkdir -p /share/Container/spending-tracker
   cd /share/Container/spending-tracker
   ```

3. **Upload files to this directory**:
   - `Dockerfile`
   - `docker compose.yml`
   - `package.json`
   - `server/` folder
   - `client/` folder
   - `.dockerignore`

4. **Create data directory**:
   ```bash
   mkdir -p data
   chmod 755 data
   ```

#### Step 2: Build and Deploy
1. **Build the container**:
   ```bash
   docker compose build
   ```

2. **Start the service**:
   ```bash
   docker compose up -d
   ```

3. **Verify it's running**:
   ```bash
   docker compose ps
   docker compose logs
   ```

### Method 2: Using Container Station GUI

#### Step 1: Create Container via Container Station
1. **Open Container Station** on your QNAP
2. **Go to "Create"** → **"Create Application"**
3. **Use Docker Compose** and paste this configuration:

```yaml
version: '3.8'
services:
  spending-tracker:
    build: /share/Container/spending-tracker
    container_name: spending-tracker
    ports:
      - "3001:3001"
    volumes:
      - /share/Container/spending-tracker/data:/app/data
    environment:
      - NODE_ENV=production
      - NAS_MODE=true
      - DOCKER_MODE=true
      - HOST=0.0.0.0
      - PORT=3001
    restart: unless-stopped
```

#### Step 2: Configure and Deploy
1. **Set Application Name**: "SpendingTracker"
2. **Review Settings**
3. **Click "Create"**

### Method 3: Pre-built Image (Alternative)

If you have Docker Hub access, you can also:

1. **Build and push image**:
   ```bash
   docker build -t your-username/spending-tracker:latest .
   docker push your-username/spending-tracker:latest
   ```

2. **Deploy from Container Station**:
   - Search for your image
   - Configure ports: `3001:3001`
   - Set volume: `/share/Container/spending-tracker/data:/app/data`

## 📁 Directory Structure on QNAP

```
/share/Container/spending-tracker/
├── Dockerfile
├── docker compose.yml
├── package.json
├── server/
├── client/
├── data/                    # Database storage (persistent)
│   └── spending.db         # Created automatically
└── .dockerignore
```

## 🌐 Accessing Your Application

### Local Network Access
- **URL**: `http://[QNAP-IP]:3001`
- **Example**: `http://192.168.1.100:3001`

### Container Station Monitoring
1. **View Logs**: Container Station → Applications → spending-tracker → Logs
2. **Resource Usage**: Container Station → Applications → spending-tracker → Terminal
3. **Restart**: Container Station → Applications → spending-tracker → Stop/Start

## 🔧 Management Commands

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# Restart container
docker compose restart

# Stop container
docker compose stop

# Update and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Access container shell (troubleshooting)
docker compose exec spending-tracker sh
```

## 💾 Data Persistence

- **Database Location**: `/share/Container/spending-tracker/data/spending.db`
- **Backup**: Use the Database tab in the app, or copy the file directly
- **Restore**: Replace the database file and restart container

## 🔐 Security Considerations

### Network Security
- **Container runs on port 3001** - ensure it's not exposed to internet
- **QNAP Firewall**: Configure to allow port 3001 for local network only
- **Container isolation**: Application runs in isolated container environment

### Access Control
- No built-in authentication
- Relies on network-level security
- Consider using QNAP's reverse proxy with authentication

## 📊 Monitoring & Health Checks

The container includes health checks that verify the application is responding:
- **Check interval**: 30 seconds
- **Timeout**: 10 seconds
- **Auto-restart**: If health check fails repeatedly

## 🔄 Updates

### Update Application
1. **Stop container**:
   ```bash
   docker compose down
   ```

2. **Update source files** (copy new versions)

3. **Rebuild and start**:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

### Backup Before Updates
```bash
# Backup database
cp data/spending.db data/spending.db.backup.$(date +%Y%m%d)

# Or use the Database tab in the application
```

## ⚡ Performance Tips

- **Container Resources**: Container Station allows CPU/memory limits
- **Storage**: Use SSD storage for better database performance
- **Network**: Wired connection recommended for NAS access
- **Monitoring**: Use Container Station's resource monitoring

## 🐛 Troubleshooting

### Build Errors

#### "npm ci can only install with existing package-lock.json"
This means package-lock.json is missing. Fix:
```bash
# Ensure package-lock.json is in the same directory as Dockerfile
ls -la package-lock.json

# If missing, copy from source or regenerate:
npm install  # This will create package-lock.json
```

### Container Won't Start
```bash
# Check logs
docker compose logs

# Check port conflicts
netstat -tulpn | grep :3001

# Rebuild container
docker compose build --no-cache
```

### UI Loads But Navigation Tabs Don't Work
This usually indicates a JavaScript or API connectivity issue:

1. **Open Browser Developer Tools** (F12)
   - Go to Console tab
   - Look for JavaScript errors or network failures
   - Check what the API_BASE URL shows in console logs

2. **Check API Connectivity**:
   ```bash
   # Test API from inside container
   docker compose exec spending-tracker wget -qO- http://localhost:3001/api/expense-types
   
   # Test API from QNAP host
   wget -qO- http://localhost:3001/api/expense-types
   ```

3. **Common Fixes**:
   - **Rebuild container**: `docker compose down && docker compose build --no-cache && docker compose up -d`
   - **Check browser console**: Look for CORS or network errors
   - **Verify port**: Ensure you're accessing the correct port (3001)

### Can't Access from Network
1. **Check QNAP firewall settings**
2. **Verify container is running**: `docker compose ps`
3. **Test from QNAP itself**: `wget http://localhost:3001`
4. **Check Container Station network settings**

### Database Issues
```bash
# Check data directory permissions
ls -la data/

# Access container to debug
docker compose exec spending-tracker sh
```

## 📱 Mobile Access

Once deployed, you can access from:
- **Desktop browsers**
- **Mobile devices** (phones/tablets)
- **Any device on your network**

The web interface is responsive and works well on mobile devices.
