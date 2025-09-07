# Spending Tracker - Deployment Guide

## Deployment Options

### Option 1: Standalone Executables

#### Windows Desktop
1. **Download**: Get `spending-tracker-win.exe` from the `dist` folder
2. **Run**: Double-click `spending-tracker-win.exe`
3. **Use**: Browser will automatically open to the application
4. **Data**: Your database file (`spending.db`) will be created in the same folder

#### Linux/Mac Desktop
1. **Download**: Get `spending-tracker-linux` or `spending-tracker-mac`
2. **Make executable**: `chmod +x spending-tracker-linux`
3. **Run**: `./spending-tracker-linux`
4. **Access**: Open browser to `http://localhost:3001`

### Files Created
When you run the executable, it creates:
- `spending.db` - Your expense database (use the Database tab to create backups!)
- Console window showing server status

### System Requirements
- **Operating System**: Windows 10/11 (64-bit)
- **Browser**: Chrome, Firefox, Edge, or Safari (modern browser with ES6+ support)
- **Memory**: 50MB RAM
- **Storage**: 10MB + your data

### Features Included
- ✅ Complete expense tracking with three-level hierarchy (Type → Expense → Payment Method)
- ✅ Credit card payment tracking with automatic "Untracked Expenses" calculation
- ✅ **Separate View Expenses and View Payments tabs** with total amount displays
- ✅ **Smart form persistence** - payment method stays selected for quick similar entries
- ✅ **Timezone-accurate date display** - dates show exactly as entered
- ✅ Duplicate from previous month for both expenses and payments
- ✅ Payment Methods management (dedicated tab for creating/editing payment methods)
- ✅ Monthly/yearly reports with "Untracked Expenses" calculation
- ✅ Excel export functionality (.xlsx format with multiple sheets)
- ✅ Edit/delete functionality with visual indicators
- ✅ Split-screen interface for immediate feedback
- ✅ Export-ready data in SQLite format
- ✅ Database management with backup/import/clear functionality  
- ✅ Toast notifications with auto-dismiss (no clicking "OK")
- ✅ Network access support for multi-device use
- ✅ **Automated distribution updates** with one-click deployment preparation

### Option 2: Docker Container (QNAP NAS)

#### Quick Setup
```bash
# Copy files to QNAP Container Station
cd /share/Container/spending-tracker
docker compose up -d
```

#### Features
- **Network Access**: Available to all devices on your network
- **Data Persistence**: Database stored in Docker volume
- **Health Monitoring**: Container Station health checks
- **Easy Management**: Start/stop from Container Station GUI
- **Auto-restart**: Container restarts if application crashes

#### Network URL
- Access from any device: `http://[qnap-ip]:3001`
- Mobile responsive design works on phones/tablets

See `QNAP_CONTAINER_GUIDE.md` for complete Docker deployment instructions.

## Manual Installation (For Developers)

### Prerequisites
- Node.js 16+ installed
- npm package manager

### Setup
1. **Clone/Download** the project folder
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start application**:
   ```bash
   npm start
   ```
4. **Browser** will auto-open to http://localhost:3001

### Development Mode
```bash
npm run server  # Start server with auto-reload
```

### Create New Executable
```bash
npm run package-win    # Windows
npm run package-mac    # macOS  
npm run package-linux  # Linux
```

## Usage

### First-Time Setup
1. **Set up Payment Methods**: Go to "Payment Methods" tab and add your credit cards and bank accounts
2. **Add first month's data**: Enter expenses and credit card payments manually

### Daily/Monthly Usage
1. **Adding Expenses**: Use "Add Expense" tab with split-screen interface
2. **Credit Card Payments**: Use "Credit Card Payments" tab for payment tracking  
3. **Monthly Duplication**: Use "Duplicate from Previous Month" in both expense and payment tabs
4. **View All Data**: Use "View All" tab to see both expenses and payments
5. **Manage Payment Methods**: Use "Payment Methods" tab to add/edit/delete payment methods
6. **Generate Reports**: Use "Reports" tab for monthly/yearly analysis with "Others" calculation
7. **Export to Excel**: Click "Export to Excel" button to download .xlsx reports

## Data Management

### Backup Your Data
**IMPORTANT**: Regularly backup your `spending.db` file!

**Location**: Same folder as the executable or project root
**Backup Method**: 
1. Copy `spending.db` to a safe location
2. Export monthly/yearly Excel reports for external backup
3. Use the Reports feature to export data periodically

### Data Migration
- **Moving to new computer**: Copy `spending.db` file to new location
- **Upgrading application**: Replace executable, keep `spending.db` file
- **Reset data**: Delete `spending.db` file (WARNING: loses all data)

### File Structure (Portable Installation)
```
SpendingTracker/
├── spending-tracker.exe    # The application
├── spending.db            # Your data (created on first run)
└── README.txt             # Basic instructions
```

## Troubleshooting

### Common Issues

**Q: Application won't start**
- Check if port 3001 is available
- Run as administrator if needed
- Check Windows Defender/firewall settings

**Q: Browser doesn't open automatically**
- Manually navigate to http://localhost:3001
- Check if default browser is set correctly

**Q: Data disappeared**
- Check if `spending.db` file exists in the same folder
- Restore from backup if available

**Q: Can't add expenses/payments**
- Check browser console for errors (F12)
- Ensure all required fields are filled
- Try refreshing the page

### Advanced Configuration

**Change Port**: Set environment variable
```bash
set PORT=3002
spending-tracker.exe
```

**Database Location**: Place `spending.db` in same folder as executable

## Development & Updates

### Updating Distribution Files
When making changes to the source code, use the automated update scripts:

**Windows:**
```bash
npm run update-dist
```

**Linux/macOS:**
```bash
npm run update-dist-unix
```

This automatically:
- Updates all client and server files
- Rebuilds executables for all platforms
- Updates Docker deployment files
- Copies documentation

### Recent Improvements
- **Enhanced Navigation**: Split from 6 to 7 tabs for better organization
- **Smart Form Persistence**: Payment method stays selected for quick similar entries
- **Total Amount Displays**: Real-time totals in both View Expenses and View Payments
- **Timezone Fix**: Dates now display exactly as entered
- **Separate Views**: No more scrolling through combined expense/payment lists

## Security Notes

### Data Privacy
- ✅ **Local storage only**: No data sent to external servers
- ✅ **Offline capable**: Works without internet connection
- ✅ **Encrypted**: Consider using BitLocker/FileVault for additional protection

### Firewall
- Application listens on localhost:3001
- No external network access required
- Safe for corporate networks

## Support

### Getting Help
1. **Check this guide** for common solutions
2. **Review SOFTWARE_SPECIFICATION.md** for detailed technical information
3. **Check browser console** (F12) for error messages

### Version Information
- **Version**: 1.0.0
- **Built with**: Node.js 18, Express, SQLite
- **Compatible with**: Windows 10/11, macOS 10.15+, Ubuntu 18+

---

**Enjoy your Personal Spending Tracker!**
