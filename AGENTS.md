# SpendingTracker Development Guide

## Commands
- **Start dev**: `npm run dev` (runs both server and client)
- **Server only**: `npm run server` (uses nodemon)
- **Client only**: `npm run client` 
- **Build client**: `npm run build`
- **Package executable**: `npm run package` or `npm run package-win`
- **Install all deps**: `npm install-all`

## Architecture
- **Full-stack Node.js app**: Express server + vanilla HTML/CSS/JS frontend
- **Database**: SQLite (`server/spending.db`) with tables: expenses, expense_types, categories, payment_methods, credit_cards, credit_card_payments
- **API**: REST endpoints at `/api/*` (expenses, payments, reports, Excel export)
- **Client-server**: Frontend at `client/`, served statically by Express
- **Port**: Server runs on 3001, client accesses via localhost:3001

## Code Style
- **Variables**: camelCase (`expenseTypes`, `paymentMethods`)
- **Constants**: UPPER_CASE (`API_BASE`, `PORT`)
- **Functions**: async/await pattern with try/catch blocks
- **Error handling**: `console.error()` for logging, `res.status(500).json({ error: err.message })` for API responses
- **Database**: Prepared statements, proper error handling with callbacks/promises
- **Validation**: express-validator for input validation
- **No tests**: Project has no test framework configured
