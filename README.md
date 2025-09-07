# Spending Tracker

A full-stack web application for tracking personal expenses and generating spending reports.

## Features

- **Three-level expense hierarchy**: Expense Type → Expense → Payment Method
- **Credit card payment tracking** with automatic "Untracked Expenses" calculation  
- **Duplicate from previous month** for both expenses and payments
- **Payment Methods management** with dedicated tab for setup
- **Database management** with backup, import, and clear functionality
- **Split-screen interface** for immediate feedback during data entry
- **Edit/delete functionality** with visual indicators and safety checks
- **Advanced filtering** by multiple criteria with **total amount displays**
- **Separate expense and payment views** for easier navigation (no more scrolling!)
- **Smart form persistence** - payment method stays selected for quick similar entries
- **Monthly/yearly reports** with intelligent "Untracked Expenses" calculation
- **Excel export functionality** for professional report analysis
- **Combo input fields** for dynamic creation of expense types and names
- **Timezone-accurate date display** - dates show exactly as entered
- **Automated distribution updates** with one-click deployment preparation

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: SQLite
- **Frontend**: HTML/CSS/JavaScript (vanilla)

## Setup Instructions

### Prerequisites
- Node.js and npm installed on your system

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run server
```

3. Open the frontend:
   - Navigate to the `client` folder
   - Open `index.html` in your web browser
   - Or serve it with a simple HTTP server:
```bash
cd client
npx http-server
```

### Alternative: Run both simultaneously
```bash
npm run dev
```

## Development & Distribution

### Quick Distribution Update
After making changes to the application, update all distribution files:

**Windows:**
```bash
npm run update-dist
```

**Linux/macOS:**
```bash
npm run update-dist-unix
```

This automatically:
- Updates all client and server files in `dist/` folder
- Rebuilds Windows, Linux, and macOS executables
- Updates Docker deployment files
- Copies all documentation

See `UPDATE_DISTRIBUTION.md` for detailed instructions.

## Usage

### First-Time Setup
1. **Set up Payment Methods**: Go to "Payment Methods" tab and add your credit cards and bank accounts
2. **Add first month's data**: Enter expenses and credit card payments manually

### Daily Usage  
1. **Add Expense**: Split-screen interface with smart form persistence and immediate feedback
2. **Credit Card Payments**: Track actual payments to credit cards with notifications  
3. **View Expenses**: Dedicated expense view with filtering and total amount display
4. **View Payments**: Dedicated payment view with filtering and total amount display
5. **Duplicate Previous Month**: One-click duplication of recurring expenses/payments
6. **Payment Methods**: Manage your payment methods (credit cards and bank accounts)
7. **Reports**: Generate monthly/yearly summaries with "Untracked Expenses" calculation
8. **Database**: Backup, import, and manage your data safely
9. **Excel Export**: Download reports in .xlsx format for advanced analysis

## Database Schema

The application uses SQLite with five main tables:
- `expense_types`: High-level categories (Utilities, House Maintenance, etc.)
- `categories`: Specific expense names (DTE Heyward, Water, etc.)
- `payment_methods`: Credit cards and bank accounts with type specification
- `expenses`: Individual expense records linking all three levels
- `credit_card_payments`: Actual payments made to credit cards

## API Endpoints

### Core Data
- `GET /api/expense-types` - Get all expense types
- `GET /api/categories` - Get all categories (expense names)
- `GET /api/payment-methods` - Get all payment methods
- `GET /api/credit-cards` - Get unique credit card names

### Expenses
- `GET /api/expenses` - Get expenses (with optional filters)
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense  
- `DELETE /api/expenses/:id` - Delete expense

### Credit Card Payments
- `GET /api/credit-card-payments` - Get credit card payments (with optional filters)
- `POST /api/credit-card-payments` - Add new payment
- `PUT /api/credit-card-payments/:id` - Update payment
- `DELETE /api/credit-card-payments/:id` - Delete payment

### Payment Method Management
- `POST /api/payment-methods` - Create new payment method
- `PUT /api/payment-methods/:id` - Update payment method
- `DELETE /api/payment-methods/:id` - Delete payment method (with usage validation)

### Reports
- `GET /api/reports/yearly/:year` - Get yearly spending report
- `GET /api/reports/monthly/:year/:month` - Get monthly spending report with "Untracked Expenses"
- `GET /api/reports/export/yearly/:year` - Export yearly report to Excel
- `GET /api/reports/export/monthly/:year/:month` - Export monthly report to Excel

### Database Management
- `GET /api/database/backup` - Download database backup
- `POST /api/database/import` - Import database with data merging
- `DELETE /api/database/clear` - Clear all database data

## Deployment Options

### Local Desktop Use
- **Windows**: Run `spending-tracker-win.exe`
- **Linux**: Run `spending-tracker-linux`
- **macOS**: Run `spending-tracker-mac`

### Network/NAS Deployment

#### Docker Container (Recommended for QNAP NAS)
```bash
# Deploy to QNAP Container Station
docker compose up -d
```
- See `QNAP_CONTAINER_GUIDE.md` for detailed instructions
- Accessible from any device on your network
- Data persistence with volume mounting

#### Source Code on NAS
```bash
# Install dependencies
npm install

# Start in network mode
npm run nas
```

#### Pre-built Executable on NAS
```bash
# Set environment and run
NAS_MODE=true ./spending-tracker-linux
```

### Network Access
- **URL Format**: `http://[nas-ip]:3001`
- **Mobile Friendly**: Works on phones, tablets, any browser
- **Auto-refresh**: Lists update automatically across devices
- **Toast Notifications**: No more clicking "OK" on success messages

## Security Notes
- **Local Network Only**: Not intended for internet exposure
- **No Authentication**: Relies on network-level security
- **VPN Recommended**: For remote access outside home network
