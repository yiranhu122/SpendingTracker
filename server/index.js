const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const db = require('./database');
const path = require('path');
const open = require('open');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

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

// Get yearly summary
app.get('/api/reports/yearly/:year', (req, res) => {
  const { year } = req.params;
  const query = `
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
  
  db.all(query, [year], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get monthly summary with "others" calculation
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
        
        // Calculate "others" for each credit card
        const othersData = [];
        paymentRows.forEach(payment => {
          const cardExpenses = cardExpenseRows.find(ce => ce.credit_card_name === payment.credit_card_name);
          const expenseTotal = cardExpenses ? cardExpenses.total_expenses : 0;
          const othersAmount = payment.total_payments - expenseTotal;
          
          if (othersAmount > 0) {
            othersData.push({
              expense_type: 'Others',
              category: `${payment.credit_card_name} - Others`,
              payment_method: payment.credit_card_name,
              payment_method_type: 'credit_card',
              total: othersAmount,
              transaction_count: 1
            });
          }
        });
        
        // Combine regular expenses with "others"
        const combinedData = [...expenseRows, ...othersData];
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
        
        // Calculate "others" for each credit card
        const othersData = [];
        paymentRows.forEach(payment => {
          const cardExpenses = cardExpenseRows.find(ce => ce.credit_card_name === payment.credit_card_name);
          const expenseTotal = cardExpenses ? cardExpenses.total_expenses : 0;
          const othersAmount = payment.total_payments - expenseTotal;
          
          if (othersAmount > 0) {
            othersData.push({
              expense_type: 'Others',
              category: `${payment.credit_card_name} - Others`,
              payment_method: payment.credit_card_name,
              payment_method_type: 'credit_card',
              total: othersAmount,
              transaction_count: 1
            });
          }
        });
        
        // Combine regular expenses with "others"
        const combinedData = [...expenseRows, ...othersData];
        
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
  const query = `
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
  
  db.all(query, [year], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Personal Spending Report - Yearly'],
      [`Year: ${year}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['SUMMARY'],
      ['Total Expenses:', `$${rows.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`],
      ['Total Transactions:', rows.reduce((sum, item) => sum + item.transaction_count, 0)],
      [''],
      ['BREAKDOWN BY EXPENSE TYPE'],
      ['Expense Type', 'Category', 'Payment Method', 'Amount', 'Transactions']
    ];
    
    rows.forEach(item => {
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
    const groupedData = rows.reduce((acc, item) => {
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

// Helper function for month names
function getMonthName(monthNumber) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Opening Spending Tracker at http://localhost:${PORT}`);
  
  // Automatically open browser (delay to ensure server is ready)
  setTimeout(() => {
    open(`http://localhost:${PORT}`);
  }, 1000);
});
