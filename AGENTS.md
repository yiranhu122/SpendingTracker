# SpendingTracker Development Guide

## Commands
- **Start dev**: `npm run dev` (runs both server and client)
- **Server only**: `npm run server` (uses nodemon)
- **Network mode**: `npm run nas` (for NAS deployment)
- **Build client**: `npm run build`
- **Package executables**: `npm run package-win`, `npm run package-linux`, `npm run package-mac`
- **Update all distributions**: `npm run update-dist` (Windows) or `npm run update-dist-unix` (Linux/macOS)
- **Docker**: `npm run docker:compose`, `npm run docker:logs`, `npm run docker:stop`
- **Install all deps**: `npm install-all`

## Architecture
- **Full-stack Node.js app**: Express server + vanilla HTML/CSS/JS frontend
- **Database**: SQLite (`server/spending.db`) with tables: expenses, expense_types, categories, payment_methods, credit_cards, credit_card_payments
- **API**: REST endpoints at `/api/*` (expenses, payments, reports, Excel export, database management)
- **Client-server**: Frontend at `client/`, served statically by Express
- **Port**: Server runs on 3001, client accesses via localhost:3001 or network IP
- **Seven tabs**: Add Expense, Credit Card Payments, View Expenses, View Payments, Payment Methods, Reports, Database
- **Network support**: Dynamic API URLs work for both localhost and network access
- **Docker ready**: Containerized deployment for NAS systems

## Code Style
- **Variables**: camelCase (`expenseTypes`, `paymentMethods`)
- **Constants**: UPPER_CASE (`API_BASE`, `PORT`)
- **Functions**: async/await pattern with try/catch blocks
- **Error handling**: `console.error()` for logging, `res.status(500).json({ error: err.message })` for API responses
- **Database**: Prepared statements, proper error handling with callbacks/promises
- **Validation**: express-validator for input validation
- **No tests**: Project has no test framework configured
