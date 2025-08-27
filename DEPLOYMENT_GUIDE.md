# Spending Tracker - Deployment Guide

## Standalone Executable

### Quick Start
1. **Download**: Get the `spending-tracker.exe` file from the `dist` folder
2. **Run**: Double-click `spending-tracker.exe`
3. **Use**: Browser will automatically open to the application
4. **Data**: Your database file (`spending.db`) will be created in the same folder as the executable

### Files Created
When you run the executable, it creates:
- `spending.db` - Your expense database (backup this file!)
- Console window showing server status

### System Requirements
- **Operating System**: Windows 10/11 (64-bit)
- **Browser**: Chrome, Firefox, Edge, or Safari (modern browser with ES6+ support)
- **Memory**: 50MB RAM
- **Storage**: 10MB + your data

### Features Included
- ✅ Complete expense tracking with three-level hierarchy (Type → Expense → Payment Method)
- ✅ Credit card payment tracking with automatic "Others" calculation
- ✅ Duplicate from previous month for both expenses and payments
- ✅ Payment Methods management (dedicated tab for creating/editing payment methods)
- ✅ Monthly/yearly reports with "Others" calculation
- ✅ Excel export functionality (.xlsx format with multiple sheets)
- ✅ Edit/delete functionality with visual indicators
- ✅ Split-screen interface for immediate feedback
- ✅ Export-ready data in SQLite format

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
