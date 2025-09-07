const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const db = require('./database');
const path = require('path');
const open = require('open');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.use(cors());
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve documentation files
app.get('/docs/:filename', (req, res) => {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename.match(/^[a-zA-Z0-9_-]+\.md$/)) {
        return res.status(400).json({ error: 'Invalid filename format' });
    }
    
    const fs = require('fs');
    let docPath;
    
    // Determine documentation path based on deployment type
    if (process.pkg) {
        // Standalone executable - look in same directory as executable
        docPath = path.join(path.dirname(process.execPath), filename);
        console.log('Standalone mode: Looking for documentation at:', docPath);
    } else if (process.env.NAS_MODE || process.env.NODE_ENV === 'production') {
        // Container/NAS deployment - look in server folder
        docPath = path.join(__dirname, filename);
        console.log('Container mode: Looking for documentation at:', docPath);
    } else {
        // Development mode - look in parent directory
        docPath = path.join(__dirname, '..', filename);
        console.log('Development mode: Looking for documentation at:', docPath);
    }
    
    fs.readFile(docPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading documentation file:', err);
            console.error('Attempted path:', docPath);
            return res.status(404).json({ 
                error: 'Documentation file not found',
                path: docPath,
                deployment: process.pkg ? 'standalone' : (process.env.NAS_MODE ? 'container' : 'development')
            });
        }
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(data);
    });
});

// Helper function to find or create items in expense_types and categories tables
async function findOrCreateItem(tableName, itemName) {
  const findQuery = `SELECT id FROM ${tableName} WHERE name = ?`;
  const insertQuery = `INSERT INTO ${tableName} (name) VALUES (?)`;
  
  // Check if item exists
  const existing = await new Promise((resolve, reject) => {
    db.get(findQuery, [itemName], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (existing) {
    return existing.id;
  } else {
    // Create new item
    return await new Promise((resolve, reject) => {
      db.run(insertQuery, [itemName], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
}

// Helper function to find payment method ID by name (no auto-creation)
async function findPaymentMethodByName(paymentMethodName) {
  const findQuery = 'SELECT id FROM payment_methods WHERE name = ?';
  
  const existing = await new Promise((resolve, reject) => {
    db.get(findQuery, [paymentMethodName], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (existing) {
    return existing.id;
  } else {
    throw new Error(`Payment method '${paymentMethodName}' not found. Please create it in Payment Methods tab first.`);
  }
}

// Get all expense types
app.get('/api/expense-types', (req, res) => {
  db.all('SELECT * FROM expense_types ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all payment methods
app.get('/api/payment-methods', (req, res) => {
  db.all('SELECT * FROM payment_methods ORDER BY type, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new expense type
app.post('/api/expense-types', [
  body('name').notEmpty().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;
  db.run('INSERT INTO expense_types (name) VALUES (?)', [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name });
  });
});

// Add new category
app.post('/api/categories', [
  body('name').notEmpty().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;
  db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name });
  });
});

// Add new payment method
app.post('/api/payment-methods', [
  body('name').notEmpty().trim(),
  body('type').isIn(['credit_card', 'bank_account'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, type } = req.body;
  db.run('INSERT INTO payment_methods (name, type) VALUES (?, ?)', [name, type], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, type });
  });
});

// Update payment method
app.put('/api/payment-methods/:id', [
  body('name').notEmpty().trim(),
  body('type').isIn(['credit_card', 'bank_account'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, type } = req.body;
  
  db.run(
    'UPDATE payment_methods SET name = ?, type = ? WHERE id = ?',
    [name, type, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ updated: this.changes });
    }
  );
});

// Delete payment method
app.delete('/api/payment-methods/:id', (req, res) => {
  const { id } = req.params;
  
  // First check if payment method is used in expenses
  db.get('SELECT COUNT(*) as count FROM expenses WHERE payment_method_id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: 'Cannot delete payment method that is used in expenses' });
      return;
    }
    
    // Safe to delete
    db.run('DELETE FROM payment_methods WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: this.changes });
    });
  });
});

// Get all expenses with expense type, category and payment method info
app.get('/api/expenses', (req, res) => {
  const { year, month, expense_type_id, category_id, payment_method_id } = req.query;
  let query = `
    SELECT e.*, et.name as expense_type_name, c.name as category_name, pm.name as payment_method_name, pm.type as payment_method_type
    FROM expenses e 
    JOIN expense_types et ON e.expense_type_id = et.id
    JOIN categories c ON e.category_id = c.id
    JOIN payment_methods pm ON e.payment_method_id = pm.id
  `;
  let params = [];
  let conditions = [];

  if (year) {
    conditions.push("strftime('%Y', e.date) = ?");
    params.push(year);
  }
  if (month) {
    conditions.push("strftime('%m', e.date) = ?");
    params.push(month.padStart(2, '0'));
  }
  if (expense_type_id) {
    conditions.push("e.expense_type_id = ?");
    params.push(expense_type_id);
  }
  if (category_id) {
    conditions.push("e.category_id = ?");
    params.push(category_id);
  }
  if (payment_method_id) {
    conditions.push("e.payment_method_id = ?");
    params.push(payment_method_id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY e.date DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new expense
app.post('/api/expenses', [
  body('date').isISO8601(),
  body('expense_type_name').notEmpty().trim(),
  body('category_name').notEmpty().trim(),
  body('payment_method_name').notEmpty().trim(),
  body('amount').isFloat({ min: 0 }),
  body('description').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { date, expense_type_name, category_name, payment_method_name, description, amount, notes } = req.body;
  
  try {
    // Find or create expense type
    let expense_type_id = await findOrCreateItem('expense_types', expense_type_name);
    
    // Find or create category
    let category_id = await findOrCreateItem('categories', category_name);
    
    // Find payment method (must exist)
    let payment_method_id = await findPaymentMethodByName(payment_method_name);
    
    // Insert expense
    db.run(
      'INSERT INTO expenses (date, expense_type_id, category_id, payment_method_id, description, amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [date, expense_type_id, category_id, payment_method_id, description, amount, notes],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ 
          id: this.lastID, 
          date,
          expense_type_id, 
          expense_type_name,
          category_id, 
          category_name,
          payment_method_id,
          payment_method_name,
          description, 
          amount, 
          notes 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
app.put('/api/expenses/:id', [
  body('date').isISO8601(),
  body('expense_type_name').notEmpty().trim(),
  body('category_name').notEmpty().trim(),
  body('payment_method_name').notEmpty().trim(),
  body('amount').isFloat({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { date, expense_type_name, category_name, payment_method_name, description, amount, notes } = req.body;
  
  try {
    // Find or create expense type, category, and find payment method
    let expense_type_id = await findOrCreateItem('expense_types', expense_type_name);
    let category_id = await findOrCreateItem('categories', category_name);
    let payment_method_id = await findPaymentMethodByName(payment_method_name);
    
    db.run(
      'UPDATE expenses SET date = ?, expense_type_id = ?, category_id = ?, payment_method_id = ?, description = ?, amount = ?, notes = ? WHERE id = ?',
      [date, expense_type_id, category_id, payment_method_id, description, amount, notes, id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ updated: this.changes });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Get yearly summary with "untracked expenses" calculation
app.get('/api/reports/yearly/:year', (req, res) => {
  const { year } = req.params;
  
  // First get regular expenses for the year
  const expenseQuery = `
    SELECT 
      et.name as expense_type,
      c.name as category,
      pm.name as payment_method,
      pm.type as payment_method_type,
      SUM(e.amount) as total,
      COUNT(e.id) as transaction_count
    FROM expenses e
    JOIN expense_types et ON e.expense_type_id = et.id
    JOIN categories c ON e.category_id = c.id
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE strftime('%Y', e.date) = ?
    GROUP BY et.id, et.name, c.id, c.name, pm.id, pm.name, pm.type
    ORDER BY et.name, c.name, total DESC
  `;
  
  // Get credit card payments for the year
  const paymentsQuery = `
    SELECT credit_card_name, SUM(payment_amount) as total_payments
    FROM credit_card_payments 
    WHERE strftime('%Y', date) = ?
    GROUP BY credit_card_name
  `;
  
  // Get sum of expenses by credit card for the year
  const cardExpensesQuery = `
    SELECT pm.name as credit_card_name, SUM(e.amount) as total_expenses
    FROM expenses e
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE pm.type = 'credit_card' 
      AND strftime('%Y', e.date) = ?
    GROUP BY pm.name
  `;
  
  db.all(expenseQuery, [year], (err, expenseRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(paymentsQuery, [year], (err, paymentRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.all(cardExpensesQuery, [year], (err, cardExpenseRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Calculate "untracked expenses" for each credit card
        const untrackedData = [];
        paymentRows.forEach(payment => {
          const cardExpenses = cardExpenseRows.find(ce => ce.credit_card_name === payment.credit_card_name);
          const expenseTotal = cardExpenses ? cardExpenses.total_expenses : 0;
          const untrackedAmount = payment.total_payments - expenseTotal;
          
          if (untrackedAmount > 0) {
            untrackedData.push({
              expense_type: 'Untracked Expenses',
              category: `${payment.credit_card_name} - Untracked`,
              payment_method: payment.credit_card_name,
              payment_method_type: 'credit_card',
              total: untrackedAmount,
              transaction_count: 1
            });
          }
        });
        
        // Combine regular expenses with "untracked expenses"
        const combinedData = [...expenseRows, ...untrackedData];
        res.json(combinedData);
      });
    });
  });
});

// Get monthly summary with "untracked expenses" calculation
app.get('/api/reports/monthly/:year/:month', (req, res) => {
  const { year, month } = req.params;
  const paddedMonth = month.padStart(2, '0');
  
  // First get regular expenses
  const expenseQuery = `
    SELECT 
      et.name as expense_type,
      c.name as category,
      pm.name as payment_method,
      pm.type as payment_method_type,
      SUM(e.amount) as total,
      COUNT(e.id) as transaction_count
    FROM expenses e
    JOIN expense_types et ON e.expense_type_id = et.id
    JOIN categories c ON e.category_id = c.id
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE strftime('%Y', e.date) = ? AND strftime('%m', e.date) = ?
    GROUP BY et.id, et.name, c.id, c.name, pm.id, pm.name, pm.type
    ORDER BY et.name, c.name, total DESC
  `;
  
  // Get credit card payments for the month
  const paymentsQuery = `
    SELECT credit_card_name, SUM(payment_amount) as total_payments
    FROM credit_card_payments 
    WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
    GROUP BY credit_card_name
  `;
  
  // Get sum of expenses by credit card for the month
  const cardExpensesQuery = `
    SELECT pm.name as credit_card_name, SUM(e.amount) as total_expenses
    FROM expenses e
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE pm.type = 'credit_card' 
      AND strftime('%Y', e.date) = ? 
      AND strftime('%m', e.date) = ?
    GROUP BY pm.name
  `;
  
  db.all(expenseQuery, [year, paddedMonth], (err, expenseRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(paymentsQuery, [year, paddedMonth], (err, paymentRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.all(cardExpensesQuery, [year, paddedMonth], (err, cardExpenseRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Calculate "untracked expenses" for each credit card
        const untrackedData = [];
        paymentRows.forEach(payment => {
          const cardExpenses = cardExpenseRows.find(ce => ce.credit_card_name === payment.credit_card_name);
          const expenseTotal = cardExpenses ? cardExpenses.total_expenses : 0;
          const untrackedAmount = payment.total_payments - expenseTotal;
          
          if (untrackedAmount > 0) {
            untrackedData.push({
              expense_type: 'Untracked Expenses',
              category: `${payment.credit_card_name} - Untracked`,
              payment_method: payment.credit_card_name,
              payment_method_type: 'credit_card',
              total: untrackedAmount,
              transaction_count: 1
            });
          }
        });
        
        // Combine regular expenses with "untracked expenses"
        const combinedData = [...expenseRows, ...untrackedData];
        res.json(combinedData);
      });
    });
  });
});

// Get all credit card payments
app.get('/api/credit-card-payments', (req, res) => {
  const { year, month, credit_card_name } = req.query;
  let query = 'SELECT * FROM credit_card_payments';
  let params = [];
  let conditions = [];

  if (year) {
    conditions.push("strftime('%Y', date) = ?");
    params.push(year);
  }
  if (month) {
    conditions.push("strftime('%m', date) = ?");
    params.push(month.padStart(2, '0'));
  }
  if (credit_card_name) {
    conditions.push("credit_card_name = ?");
    params.push(credit_card_name);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY date DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new credit card payment
app.post('/api/credit-card-payments', [
  body('date').isISO8601(),
  body('credit_card_name').notEmpty().trim(),
  body('payment_amount').isFloat({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { date, credit_card_name, payment_amount, notes } = req.body;
  db.run(
    'INSERT INTO credit_card_payments (date, credit_card_name, payment_amount, notes) VALUES (?, ?, ?, ?)',
    [date, credit_card_name, payment_amount, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID, 
        date,
        credit_card_name,
        payment_amount,
        notes 
      });
    }
  );
});

// Update credit card payment
app.put('/api/credit-card-payments/:id', [
  body('date').isISO8601(),
  body('credit_card_name').notEmpty().trim(),
  body('payment_amount').isFloat({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { date, credit_card_name, payment_amount, notes } = req.body;
  
  db.run(
    'UPDATE credit_card_payments SET date = ?, credit_card_name = ?, payment_amount = ?, notes = ? WHERE id = ?',
    [date, credit_card_name, payment_amount, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ updated: this.changes });
    }
  );
});

// Delete credit card payment
app.delete('/api/credit-card-payments/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM credit_card_payments WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Get unique credit card names from payments and expenses
app.get('/api/credit-cards', (req, res) => {
  const query = `
    SELECT DISTINCT name FROM (
      SELECT credit_card_name as name FROM credit_card_payments
      UNION
      SELECT pm.name FROM payment_methods pm WHERE pm.type = 'credit_card'
    ) ORDER BY name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({ name: row.name })));
  });
});

// Export monthly report to Excel
app.get('/api/reports/export/monthly/:year/:month', (req, res) => {
  const { year, month } = req.params;
  const paddedMonth = month.padStart(2, '0');
  
  // Get the same data as the monthly report
  const expenseQuery = `
    SELECT 
      et.name as expense_type,
      c.name as category,
      pm.name as payment_method,
      pm.type as payment_method_type,
      SUM(e.amount) as total,
      COUNT(e.id) as transaction_count
    FROM expenses e
    JOIN expense_types et ON e.expense_type_id = et.id
    JOIN categories c ON e.category_id = c.id
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE strftime('%Y', e.date) = ? AND strftime('%m', e.date) = ?
    GROUP BY et.id, et.name, c.id, c.name, pm.id, pm.name, pm.type
    ORDER BY et.name, c.name, total DESC
  `;
  
  const paymentsQuery = `
    SELECT credit_card_name, SUM(payment_amount) as total_payments
    FROM credit_card_payments 
    WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
    GROUP BY credit_card_name
  `;
  
  const cardExpensesQuery = `
    SELECT pm.name as credit_card_name, SUM(e.amount) as total_expenses
    FROM expenses e
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE pm.type = 'credit_card' 
      AND strftime('%Y', e.date) = ? 
      AND strftime('%m', e.date) = ?
    GROUP BY pm.name
  `;
  
  db.all(expenseQuery, [year, paddedMonth], (err, expenseRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(paymentsQuery, [year, paddedMonth], (err, paymentRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.all(cardExpensesQuery, [year, paddedMonth], (err, cardExpenseRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Calculate "untracked expenses" for each credit card
        const untrackedData = [];
        paymentRows.forEach(payment => {
          const cardExpenses = cardExpenseRows.find(ce => ce.credit_card_name === payment.credit_card_name);
          const expenseTotal = cardExpenses ? cardExpenses.total_expenses : 0;
          const untrackedAmount = payment.total_payments - expenseTotal;
          
          if (untrackedAmount > 0) {
            untrackedData.push({
              expense_type: 'Untracked Expenses',
              category: `${payment.credit_card_name} - Untracked`,
              payment_method: payment.credit_card_name,
              payment_method_type: 'credit_card',
              total: untrackedAmount,
              transaction_count: 1
            });
          }
        });
        
        // Combine regular expenses with "untracked expenses"
        const combinedData = [...expenseRows, ...untrackedData];
        
        // Create Excel workbook
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
          ['Personal Spending Report'],
          [`Period: ${getMonthName(parseInt(month))} ${year}`],
          [`Generated: ${new Date().toLocaleDateString()}`],
          [''],
          ['SUMMARY'],
          ['Total Expenses:', `$${combinedData.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`],
          ['Total Transactions:', combinedData.reduce((sum, item) => sum + item.transaction_count, 0)],
          [''],
          ['BREAKDOWN BY EXPENSE TYPE'],
          ['Expense Type', 'Category', 'Payment Method', 'Amount', 'Transactions']
        ];
        
        combinedData.forEach(item => {
          summaryData.push([
            item.expense_type,
            item.category,
            item.payment_method,
            item.total,
            item.transaction_count
          ]);
        });
        
        const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
        
        // Set column widths
        ws_summary['!cols'] = [
          {wch: 20}, // Expense Type
          {wch: 25}, // Category
          {wch: 20}, // Payment Method
          {wch: 12}, // Amount
          {wch: 12}  // Transactions
        ];
        
        XLSX.utils.book_append_sheet(wb, ws_summary, 'Summary');
        
        // Create detailed sheets by expense type
        const groupedData = combinedData.reduce((acc, item) => {
          if (!acc[item.expense_type]) acc[item.expense_type] = [];
          acc[item.expense_type].push(item);
          return acc;
        }, {});
        
        Object.entries(groupedData).forEach(([expenseType, items]) => {
          const sheetData = [
            [expenseType.toUpperCase()],
            [''],
            ['Category', 'Payment Method', 'Amount', 'Transactions']
          ];
          
          items.forEach(item => {
            sheetData.push([
              item.category,
              item.payment_method,
              item.total,
              item.transaction_count
            ]);
          });
          
          const ws = XLSX.utils.aoa_to_sheet(sheetData);
          ws['!cols'] = [{wch: 25}, {wch: 20}, {wch: 12}, {wch: 12}];
          
          // Sanitize sheet name (Excel has restrictions)
          const sheetName = expenseType.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        
        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="spending-report-${year}-${paddedMonth}.xlsx"`);
        
        res.send(excelBuffer);
      });
    });
  });
});

// Export yearly report to Excel
app.get('/api/reports/export/yearly/:year', (req, res) => {
  const { year } = req.params;
  
  // Get the same data as the yearly report (with Others calculation)
  const expenseQuery = `
    SELECT 
      et.name as expense_type,
      c.name as category,
      pm.name as payment_method,
      pm.type as payment_method_type,
      SUM(e.amount) as total,
      COUNT(e.id) as transaction_count
    FROM expenses e
    JOIN expense_types et ON e.expense_type_id = et.id
    JOIN categories c ON e.category_id = c.id
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE strftime('%Y', e.date) = ?
    GROUP BY et.id, et.name, c.id, c.name, pm.id, pm.name, pm.type
    ORDER BY et.name, c.name, total DESC
  `;
  
  const paymentsQuery = `
    SELECT credit_card_name, SUM(payment_amount) as total_payments
    FROM credit_card_payments 
    WHERE strftime('%Y', date) = ?
    GROUP BY credit_card_name
  `;
  
  const cardExpensesQuery = `
    SELECT pm.name as credit_card_name, SUM(e.amount) as total_expenses
    FROM expenses e
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE pm.type = 'credit_card' 
      AND strftime('%Y', e.date) = ?
    GROUP BY pm.name
  `;
  
  db.all(expenseQuery, [year], (err, expenseRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(paymentsQuery, [year], (err, paymentRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.all(cardExpensesQuery, [year], (err, cardExpenseRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Calculate "untracked expenses" for each credit card
        const untrackedData = [];
        paymentRows.forEach(payment => {
          const cardExpenses = cardExpenseRows.find(ce => ce.credit_card_name === payment.credit_card_name);
          const expenseTotal = cardExpenses ? cardExpenses.total_expenses : 0;
          const untrackedAmount = payment.total_payments - expenseTotal;
          
          if (untrackedAmount > 0) {
            untrackedData.push({
              expense_type: 'Untracked Expenses',
              category: `${payment.credit_card_name} - Untracked`,
              payment_method: payment.credit_card_name,
              payment_method_type: 'credit_card',
              total: untrackedAmount,
              transaction_count: 1
            });
          }
        });
        
        // Combine regular expenses with "untracked expenses"
        const combinedData = [...expenseRows, ...untrackedData];
    
    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Personal Spending Report - Yearly'],
      [`Year: ${year}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['SUMMARY'],
      ['Total Expenses:', `$${combinedData.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`],
      ['Total Transactions:', combinedData.reduce((sum, item) => sum + item.transaction_count, 0)],
      [''],
      ['BREAKDOWN BY EXPENSE TYPE'],
      ['Expense Type', 'Category', 'Payment Method', 'Amount', 'Transactions']
    ];
    
    combinedData.forEach(item => {
      summaryData.push([
        item.expense_type,
        item.category,
        item.payment_method,
        item.total,
        item.transaction_count
      ]);
    });
    
    const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
    ws_summary['!cols'] = [{wch: 20}, {wch: 25}, {wch: 20}, {wch: 12}, {wch: 12}];
    XLSX.utils.book_append_sheet(wb, ws_summary, 'Summary');
    
    // Create detailed sheets by expense type
    const groupedData = combinedData.reduce((acc, item) => {
      if (!acc[item.expense_type]) acc[item.expense_type] = [];
      acc[item.expense_type].push(item);
      return acc;
    }, {});
    
    Object.entries(groupedData).forEach(([expenseType, items]) => {
      const sheetData = [
        [expenseType.toUpperCase()],
        [''],
        ['Category', 'Payment Method', 'Amount', 'Transactions']
      ];
      
      items.forEach(item => {
        sheetData.push([
          item.category,
          item.payment_method,
          item.total,
          item.transaction_count
        ]);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws['!cols'] = [{wch: 25}, {wch: 20}, {wch: 12}, {wch: 12}];
      
      const sheetName = expenseType.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="spending-report-${year}.xlsx"`);
    
    res.send(excelBuffer);
      });
    });
  });
});

// Helper function for month names
function getMonthName(monthNumber) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
}

// Database management endpoints
app.get('/api/database/backup', (req, res) => {
  const fs = require('fs');
  const { dbPath } = require('./database');
  
  try {
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `spending-backup-${timestamp}.db`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const readStream = fs.createReadStream(dbPath);
    readStream.pipe(res);
    
    readStream.on('error', (err) => {
      console.error('Error reading database file:', err);
      res.status(500).json({ error: 'Failed to read database file' });
    });
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/database/import', (req, res) => {
  const fs = require('fs');
  const multer = require('multer');
  const sqlite3 = require('sqlite3').verbose();
  
  // Configure multer for file upload
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  
  upload.single('dbFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Write uploaded file to temporary location
    const tempPath = `./temp-import-${Date.now()}.db`;
    fs.writeFileSync(tempPath, req.file.buffer);
    
    // Open the imported database
    const importDb = new sqlite3.Database(tempPath, (err) => {
      if (err) {
        fs.unlinkSync(tempPath);
        return res.status(400).json({ error: 'Invalid database file' });
      }
      
      // Import data from each table
      importData(importDb, tempPath, res);
    });
  });
});

app.delete('/api/database/clear', (req, res) => {
  const tables = ['expenses', 'credit_card_payments', 'expense_types', 'categories', 'payment_methods'];
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let completed = 0;
    const totalTables = tables.length;
    
    tables.forEach(table => {
      db.run(`DELETE FROM ${table}`, (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: `Failed to clear ${table}: ${err.message}` });
        }
        
        completed++;
        if (completed === totalTables) {
          db.run('COMMIT', (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to commit transaction' });
            }
            res.json({ message: 'Database cleared successfully' });
          });
        }
      });
    });
  });
});

// Helper function to import data from uploaded database
function importData(importDb, tempPath, res) {
  const fs = require('fs');
  const tables = ['expense_types', 'categories', 'payment_methods', 'expenses', 'credit_card_payments'];
  
  let completed = 0;
  let importedCounts = {};
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    function processTable(tableIndex) {
      if (tableIndex >= tables.length) {
        db.run('COMMIT', (err) => {
          // Close the imported database connection before deleting temp file
          importDb.close((closeErr) => {
            try {
              fs.unlinkSync(tempPath);
            } catch (unlinkErr) {
              console.warn('Warning: Could not delete temporary file:', unlinkErr.message);
            }
            
            if (err) {
              return res.status(500).json({ error: 'Failed to commit import transaction' });
            }
            res.json({ 
              message: 'Database imported successfully',
              imported: importedCounts
            });
          });
        });
        return;
      }
      
      const table = tables[tableIndex];
      
      importDb.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {
          importDb.close((closeErr) => {
            try {
              fs.unlinkSync(tempPath);
            } catch (unlinkErr) {
              console.warn('Warning: Could not delete temporary file:', unlinkErr.message);
            }
          });
          db.run('ROLLBACK');
          return res.status(500).json({ error: `Failed to read ${table} from import file` });
        }
        
        if (rows.length === 0) {
          importedCounts[table] = 0;
          processTable(tableIndex + 1);
          return;
        }
        
        // Insert rows with conflict resolution
        let insertedCount = 0;
        let processedCount = 0;
        
        if (table === 'expenses') {
          // Handle expenses with proper foreign key lookup
          let processedCount = 0;
          let insertedCount = 0;
          
          rows.forEach(async (row) => {
            try {
              // Get the names from the imported database first
              const expenseTypeName = await new Promise((resolve, reject) => {
                importDb.get('SELECT name FROM expense_types WHERE id = ?', [row.expense_type_id], (err, result) => {
                  if (err) reject(err);
                  else resolve(result ? result.name : null);
                });
              });
              
              const categoryName = await new Promise((resolve, reject) => {
                importDb.get('SELECT name FROM categories WHERE id = ?', [row.category_id], (err, result) => {
                  if (err) reject(err);
                  else resolve(result ? result.name : null);
                });
              });
              
              const paymentMethodName = await new Promise((resolve, reject) => {
                importDb.get('SELECT name FROM payment_methods WHERE id = ?', [row.payment_method_id], (err, result) => {
                  if (err) reject(err);
                  else resolve(result ? result.name : null);
                });
              });
              
              // Get the current database IDs by name
              const currentExpenseTypeId = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM expense_types WHERE name = ?', [expenseTypeName], (err, result) => {
                  if (err) reject(err);
                  else resolve(result ? result.id : null);
                });
              });
              
              const currentCategoryId = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM categories WHERE name = ?', [categoryName], (err, result) => {
                  if (err) reject(err);
                  else resolve(result ? result.id : null);
                });
              });
              
              const currentPaymentMethodId = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM payment_methods WHERE name = ?', [paymentMethodName], (err, result) => {
                  if (err) reject(err);
                  else resolve(result ? result.id : null);
                });
              });
              
              // Only insert if all IDs are found
              if (currentExpenseTypeId && currentCategoryId && currentPaymentMethodId) {
                db.run(
                  'INSERT INTO expenses (date, expense_type_id, category_id, payment_method_id, description, amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [row.date, currentExpenseTypeId, currentCategoryId, currentPaymentMethodId, row.description, row.amount, row.notes],
                  function(err) {
                    processedCount++;
                    if (!err && this.changes > 0) {
                      insertedCount++;
                    }
                    
                    if (processedCount === rows.length) {
                      importedCounts[table] = insertedCount;
                      processTable(tableIndex + 1);
                    }
                  }
                );
              } else {
                processedCount++;
                console.warn('Skipping expense import - missing reference data:', {
                  expenseTypeName, categoryName, paymentMethodName
                });
                
                if (processedCount === rows.length) {
                  importedCounts[table] = insertedCount;
                  processTable(tableIndex + 1);
                }
              }
            } catch (error) {
              processedCount++;
              console.error('Error processing expense row:', error);
              
              if (processedCount === rows.length) {
                importedCounts[table] = insertedCount;
                processTable(tableIndex + 1);
              }
            }
          });
        } else {
          // Handle other tables normally
          rows.forEach(row => {
            let insertQuery, values;
            
            if (table === 'expense_types' || table === 'categories') {
              insertQuery = `INSERT OR IGNORE INTO ${table} (name) VALUES (?)`;
              values = [row.name];
            } else if (table === 'payment_methods') {
              insertQuery = `INSERT OR IGNORE INTO ${table} (name, type) VALUES (?, ?)`;
              values = [row.name, row.type];
            } else if (table === 'credit_card_payments') {
              insertQuery = `INSERT INTO ${table} (date, credit_card_name, payment_amount, notes) VALUES (?, ?, ?, ?)`;
              values = [row.date, row.credit_card_name, row.payment_amount, row.notes];
            }
            
            db.run(insertQuery, values, function(err) {
              processedCount++;
              if (!err && this.changes > 0) {
                insertedCount++;
              }
              
              if (processedCount === rows.length) {
                importedCounts[table] = insertedCount;
                processTable(tableIndex + 1);
              }
            });
          });
        }
      });
    }
    
    processTable(0);
  });
}

// Exit endpoint to shutdown the server
app.post('/api/exit', (req, res) => {
  console.log('Shutdown request received');
  res.json({ message: 'Server shutting down' });

  // Give time for response to be sent, then exit
  setTimeout(() => {
    process.exit(0);
  }, 500);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Access Spending Tracker at http://localhost:${PORT}`);

  // Get network IP for remote access info
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  const networkIPs = [];
  
  Object.keys(networkInterfaces).forEach(key => {
    networkInterfaces[key].forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        networkIPs.push(details.address);
      }
    });
  });
  
  if (networkIPs.length > 0) {
    console.log(`Network access available at:`);
    networkIPs.forEach(ip => {
      console.log(`  http://${ip}:${PORT}`);
    });
  }

  // Only auto-open browser if not running in NAS mode
  if (!process.env.NAS_MODE) {
    setTimeout(() => {
      open(`http://localhost:${PORT}`);
    }, 1000);
  }
});
