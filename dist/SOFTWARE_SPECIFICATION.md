# Personal Spending Tracker - Software Specification

## 1. Overview

### Purpose
A personal spending tracking application designed to replace Excel-based bill tracking with a digital solution that provides better analysis, reporting, and data management capabilities.

### Target User
Individual users who need to track monthly expenses, credit card payments, and generate spending reports for personal financial management.

## 2. System Architecture

### Technology Stack
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite (file-based, no server required)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Excel Export**: xlsx library for .xlsx file generation
- **Packaging**: pkg for standalone executable

### Application Structure
```
SpendingTracker/
├── server/
│   ├── index.js          # Express server and API endpoints
│   ├── database.js       # SQLite database setup and schema
│   └── spending.db       # SQLite database file (created at runtime)
├── client/
│   ├── index.html        # Frontend HTML
│   ├── styles.css        # CSS styling
│   └── app.js           # Frontend JavaScript
├── package.json          # Main package configuration
├── README.md            # User documentation
└── SOFTWARE_SPECIFICATION.md # This document
```

## 3. Database Schema

### Tables

#### expense_types
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE) - e.g., "Utilities", "House Maintenance", "Child Care"
- `created_at` (DATETIME)

#### categories  
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE) - e.g., "DTE Heyward", "Water", "Consumer gas Heyward"
- `created_at` (DATETIME)

#### payment_methods
- `id` (INTEGER PRIMARY KEY) 
- `name` (TEXT UNIQUE) - e.g., "Credit Card 1", "Bank Account"
- `type` (TEXT) - 'credit_card' or 'bank_account'
- `created_at` (DATETIME)

#### expenses
- `id` (INTEGER PRIMARY KEY)
- `date` (TEXT) - ISO date format
- `expense_type_id` (INTEGER) - FK to expense_types
- `category_id` (INTEGER) - FK to categories  
- `payment_method_id` (INTEGER) - FK to payment_methods
- `description` (TEXT) - Optional description
- `amount` (REAL) - Expense amount
- `notes` (TEXT) - Optional notes
- `created_at` (DATETIME)

#### credit_card_payments
- `id` (INTEGER PRIMARY KEY)
- `date` (TEXT) - ISO date format
- `credit_card_name` (TEXT) - Name of credit card
- `payment_amount` (REAL) - Payment amount
- `notes` (TEXT) - Optional notes
- `created_at` (DATETIME)

## 4. API Endpoints

### Expense Types
- `GET /api/expense-types` - Get all expense types
- `POST /api/expense-types` - Create new expense type

### Categories (Expense Names)
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Payment Methods
- `GET /api/payment-methods` - Get all payment methods
- `POST /api/payment-methods` - Create new payment method
- `PUT /api/payment-methods/:id` - Update payment method
- `DELETE /api/payment-methods/:id` - Delete payment method (with usage validation)

### Expenses
- `GET /api/expenses` - Get expenses with optional filters (year, month, expense_type_id, category_id, payment_method_id)
- `POST /api/expenses` - Create new expense (auto-creates categories if needed)
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Credit Card Payments
- `GET /api/credit-card-payments` - Get payments with optional filters (year, month, credit_card_name)
- `POST /api/credit-card-payments` - Create new payment
- `PUT /api/credit-card-payments/:id` - Update payment
- `DELETE /api/credit-card-payments/:id` - Delete payment
- `GET /api/credit-cards` - Get unique credit card names

### Reports
- `GET /api/reports/yearly/:year` - Get yearly spending summary
- `GET /api/reports/monthly/:year/:month` - Get monthly summary with "Others" calculation
- `GET /api/reports/export/yearly/:year` - Export yearly report to Excel (.xlsx format)
- `GET /api/reports/export/monthly/:year/:month` - Export monthly report to Excel (.xlsx format)

### System
- `POST /api/exit` - Gracefully shutdown server

## 5. User Interface

### Navigation
Five main tabs with visual feedback for active section:
- **Add Expense** - Primary data entry for individual expenses
- **Credit Card Payments** - Dedicated entry for credit card payments  
- **View All** - Combined view of expenses and payments
- **Payment Methods** - Management of payment methods (create/edit/delete)
- **Reports** - Monthly and yearly spending analysis

### Add Expense Tab (Split Screen)
**Left Side: Entry Form**
- Date picker (defaults to today)
- Expense Type: Combo input (dropdown + text entry)
- Expense: Combo input for specific expense names
- Payment Method: **Dropdown only** (select from existing payment methods)
- Description: Optional text field
- Amount: Numeric input (required)
- Notes: Optional textarea
- Duplicate from Previous Month: Green section with year/month selectors

**Right Side: Recent Expenses**
- Real-time list of recent expenses (default: this month)
- Month filter dropdown
- Click to edit functionality
- Edit (✏️) and Delete (🗑️) buttons

### Credit Card Payments Tab (Split Screen)
**Left Side: Payment Form**
- Date picker (defaults to today)
- Credit Card: **Dropdown only** (select from existing credit card payment methods)
- Payment Amount: Numeric input
- Notes: Optional textarea
- Duplicate from Previous Month: Same green section

**Right Side: Recent Payments**
- Real-time list of recent payments
- Same interaction patterns as expenses

### Payment Methods Tab
**Payment Method Management Interface**
- Add New Payment Method form with name and type selection
- List of all existing payment methods with edit/delete buttons
- Type specification: Credit Card or Bank Account
- Usage validation: Cannot delete payment methods used in expenses
- Visual edit mode with cancel functionality

### View All Tab
**Expenses Section**
- Comprehensive filtering (year, month, expense type, expense name, payment method)
- Full expense list with edit/delete capabilities

**Credit Card Payments Section**
- Independent filtering for credit card payments
- Separate list below expenses

### Reports Tab
- Year/month selectors for report generation
- Automated "Others" calculation for credit cards
- Grouped by expense type with category and payment method details
- **Excel Export**: One-click export to .xlsx format with multiple sheets

## 6. Key Features

### Dynamic Data Creation
- **Auto-expanding dropdowns**: Type new values in Expense Type and Expense combo fields to add them permanently
- **Controlled payment methods**: Payment methods can only be created/modified in dedicated Payment Methods tab
- **Intelligent defaults**: Forms remember values for quick re-entry of similar items

### Edit/Delete Functionality
- **In-place editing**: Click any item to load it into the entry form
- **Visual edit mode**: Form title and button text change during editing
- **Confirmation dialogs**: Prevent accidental deletions

### Duplicate Functionality
- **Smart defaults**: Previous month automatically selected
- **Bulk duplication**: Copy entire month's worth of expenses/payments
- **Date normalization**: All duplicated items use today's date
- **Progress feedback**: Button states and success messages

### "Others" Calculation
**Purpose**: Track unrecorded credit card expenses
**Calculation**: `Others = Credit Card Payment - Sum of Individual Expenses`
**Implementation**: Automatically calculated in monthly reports

### Split-Screen Design
- **Efficient workflow**: Enter data on left, see results on right
- **Real-time updates**: New entries appear immediately
- **Context preservation**: Stay in current tab while editing

## 7. User Workflows

### Initial Setup
1. Launch application
2. **Set up payment methods**: Go to Payment Methods tab and add your credit cards and bank accounts
3. Add initial expense types and categories through combo inputs in Add Expense tab
4. Enter first month's expenses and credit card payments

### Monthly Entry Process
1. **Duplicate Previous Month** (30 seconds):
   - Go to Add Expense → Click "Duplicate Expenses"
   - Go to Credit Card Payments → Click "Duplicate Payments"

2. **Update Amounts** (5-10 minutes):
   - Click expenses on right panel to edit amounts
   - Delete any non-applicable expenses
   - Add any new expenses

3. **Generate Reports**:
   - View monthly report with automatic "Others" calculation
   - Export reports to Excel for further analysis
   - Analyze spending patterns by category

### Data Analysis
1. **View All**: See complete picture of expenses and payments
2. **Reports**: Generate monthly/yearly summaries with Excel export capability
3. **Excel Analysis**: Export to .xlsx for advanced analysis with pivot tables and formulas
4. **Filtering**: Analyze spending by various criteria

## 8. Technical Specifications

### Frontend Requirements
- **Browser**: Modern web browser with ES6+ support
- **JavaScript**: Vanilla ES6+ (no frameworks required)
- **CSS**: Responsive design with flexbox
- **Local Storage**: None required (all data server-side)

### Backend Requirements
- **Node.js**: Version 14+ 
- **Express.js**: RESTful API server
- **SQLite3**: Database with file persistence
- **XLSX**: Excel file generation library
- **CORS**: Cross-origin support for local development

### Data Validation
- **Client-side**: HTML5 validation and JavaScript checks
- **Server-side**: express-validator for API endpoint validation
- **Database**: Foreign key constraints and type checking

### Error Handling
- **Network errors**: User-friendly messages for connection issues
- **Validation errors**: Clear feedback for invalid input
- **Database errors**: Graceful handling with rollback support

## 9. Default Data

### Expense Types (13 items)
Utilities, House Maintenance, Activities, Child Care, Taxes, Insurance, Medical, Groceries, Transportation, Entertainment, Shopping, Dining, Travel

### Categories (4 initial items, expandable)
Water, DTE Heyward, DTE England, Consumer gas Heyward

### Payment Methods (4 items)
Bank Account, Credit Card 1, Credit Card 2, Credit Card 3

## 10. Data Relationships

### Expense Entry Hierarchy
```
Expense Type (What kind) 
    └── Category (Specific item)
        └── Payment Method (How paid)
```

### Credit Card "Others" Logic
```
For each credit card in monthly report:
    Total Payment = Sum of credit_card_payments for that card
    Tracked Expenses = Sum of expenses paid with that card  
    Others = Total Payment - Tracked Expenses
    
    If Others > 0:
        Add "Card Name - Others" line to report
```

## 11. Security Considerations

### Data Protection
- **Local storage**: All data stored locally in SQLite file
- **No external services**: No data transmitted outside local machine
- **File permissions**: Database file uses system default permissions

### Input Validation
- **SQL injection protection**: Parameterized queries throughout
- **XSS prevention**: Proper HTML escaping in frontend
- **Type validation**: Numeric amounts, date formats, required fields

## 12. Performance Considerations

### Database Optimization
- **Indexes**: Primary keys and foreign keys for join performance
- **Query optimization**: Efficient filtering with proper WHERE clauses
- **Connection management**: Single persistent connection with proper cleanup

### Frontend Optimization
- **Minimal DOM manipulation**: Efficient list rendering
- **Event delegation**: Proper event handling for dynamic content
- **Data caching**: Client-side storage of reference data

## 13. Extensibility

### Adding New Features
- **New expense fields**: Add columns to expenses table
- **Additional reports**: Create new API endpoints and frontend views
- **Export formats**: Excel export implemented, CSV/PDF can be added similarly

### Customization Options
- **Categories**: Fully user-customizable through combo inputs
- **Payment methods**: Dynamic addition with automatic type detection
- **Expense types**: Expandable through API

## 14. Deployment Options

### Standalone Executable
- **pkg package**: Single executable file containing Node.js runtime
- **No installation required**: Run directly on Windows/Mac/Linux
- **Portable**: Database file created in same directory

### Manual Installation
- **Node.js required**: Install dependencies with npm
- **Development mode**: Hot reload for modifications
- **Production mode**: Optimized for performance

## 15. Error Recovery

### Data Backup
- **SQLite file**: Backup spending.db file regularly
- **Excel export**: Generate .xlsx reports for external backup and analysis

### Common Issues
- **Port conflicts**: Server defaults to port 3001, configurable via environment
- **Browser compatibility**: Modern browsers required for datalist support
- **Database corruption**: Delete spending.db to reset (loses data)

## 16. Future Enhancement Ideas

### Advanced Features
- **Enhanced exports**: CSV and PDF export (Excel already implemented)
- **Budget tracking**: Set monthly budgets by category
- **Trend analysis**: Charts and graphs for spending patterns
- **Receipt photos**: Image upload and storage
- **Multi-user**: Support for household expense tracking

### Technical Improvements
- **Database migration system**: Automatic schema updates
- **Backup automation**: Scheduled data exports
- **Performance monitoring**: Query optimization and caching
- **Authentication**: Password protection for sensitive data

## 17. Maintenance

### Regular Tasks
- **Database cleanup**: Archive old data annually
- **Performance monitoring**: Check query response times
- **Security updates**: Update Node.js dependencies

### Troubleshooting
- **Reset application**: Delete spending.db and restart
- **Clear cache**: Refresh browser or restart application
- **Debug mode**: Check browser console for JavaScript errors

---

*This specification document serves as the complete design reference for recreating the Personal Spending Tracker application.*
