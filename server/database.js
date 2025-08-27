const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// For executable: use current working directory, for development: use server directory
const dbPath = process.pkg 
  ? path.join(process.cwd(), 'spending.db')  // When running as executable
  : path.join(__dirname, 'spending.db');     // When running from source

console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.log('Attempted path:', dbPath);
    console.log('Current working directory:', process.cwd());
    console.log('__dirname:', __dirname);
  } else {
    console.log('Database connected successfully');
  }
});

// Initialize database schema
db.serialize(() => {
  // Expense types table
  db.run(`CREATE TABLE IF NOT EXISTS expense_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Categories table (updated schema without type field)
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Payment methods table
  db.run(`CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('credit_card', 'bank_account')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Expenses table
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    expense_type_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    payment_method_id INTEGER NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_type_id) REFERENCES expense_types (id),
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id)
  )`);

  // Credit card payments table
  db.run(`CREATE TABLE IF NOT EXISTS credit_card_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    credit_card_name TEXT NOT NULL,
    payment_amount REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default data
  // Insert default expense types
  const defaultExpenseTypes = [
    'Utilities',
    'House Maintenance', 
    'Activities',
    'Child Care',
    'Taxes',
    'Insurance',
    'Medical',
    'Groceries',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Dining',
    'Travel'
  ];

  const expenseTypeStmt = db.prepare(`INSERT OR IGNORE INTO expense_types (name) VALUES (?)`);
  defaultExpenseTypes.forEach(name => {
    expenseTypeStmt.run(name);
  });
  expenseTypeStmt.finalize();

  // Insert default categories (now called expenses)
  const defaultCategories = [
    'Water',
    'DTE Heyward',
    'DTE England',
    'Consumer gas Heyward'
  ];

  const categoryStmt = db.prepare(`INSERT OR IGNORE INTO categories (name) VALUES (?)`);
  defaultCategories.forEach(name => {
    categoryStmt.run(name);
  });
  categoryStmt.finalize();

  // Insert default payment methods
  const defaultPaymentMethods = [
    ['Bank Account', 'bank_account'],
    ['Credit Card 1', 'credit_card'],
    ['Credit Card 2', 'credit_card'],
    ['Credit Card 3', 'credit_card']
  ];

  const paymentStmt = db.prepare(`INSERT OR IGNORE INTO payment_methods (name, type) VALUES (?, ?)`);
  defaultPaymentMethods.forEach(([name, type]) => {
    paymentStmt.run(name, type);
  });
  paymentStmt.finalize();
});

module.exports = db;
