# Spending Tracker

A full-stack web application for tracking personal expenses and generating spending reports.

## Features

- **Three-level expense hierarchy**: Expense Type → Expense → Payment Method
- **Credit card payment tracking** with automatic "Others" calculation  
- **Duplicate from previous month** for both expenses and payments
- **Payment Methods management** with dedicated tab for setup
- **Split-screen interface** for immediate feedback during data entry
- **Edit/delete functionality** with visual indicators and safety checks
- **Advanced filtering** by multiple criteria
- **Monthly/yearly reports** with intelligent "Others" calculation
- **Excel export functionality** for professional report analysis
- **Combo input fields** for dynamic creation of expense types and names

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

## Usage

### First-Time Setup
1. **Set up Payment Methods**: Go to "Payment Methods" tab and add your credit cards and bank accounts
2. **Add first month's data**: Enter expenses and credit card payments manually

### Daily Usage  
1. **Add Expense**: Split-screen interface with immediate feedback
2. **Credit Card Payments**: Track actual payments to credit cards
3. **Duplicate Previous Month**: One-click duplication of recurring expenses/payments
4. **View All**: See complete overview of expenses and payments
5. **Payment Methods**: Manage your payment methods (credit cards and bank accounts)
6. **Reports**: Generate monthly/yearly summaries with "Others" calculation
7. **Excel Export**: Download reports in .xlsx format for advanced analysis

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
- `GET /api/reports/monthly/:year/:month` - Get monthly spending report with "Others"
- `GET /api/reports/export/yearly/:year` - Export yearly report to Excel
- `GET /api/reports/export/monthly/:year/:month` - Export monthly report to Excel
