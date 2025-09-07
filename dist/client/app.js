// Dynamic API base URL - works for both localhost and network access
const API_BASE = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;

// Debug logging for container deployment
console.log('API_BASE URL:', API_BASE);
console.log('Current location:', window.location.href);

let expenseTypes = [];
let expenseNames = []; // Changed from categories to expenseNames
let paymentMethods = [];
let creditCards = [];
let expenses = [];
let creditCardPayments = [];
let editingExpense = null;
let editingPayment = null;
let editingPaymentMethod = null;

// Helper function to format date without timezone issues
function formatDateDisplay(dateString) {
    if (!dateString) return '';
    // Parse the date string as local date to avoid timezone conversion
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
    const day = parseInt(parts[2]);
    const date = new Date(year, month, day);
    return date.toLocaleDateString();
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Setup event listeners first so navigation always works
    setupEventListeners();
    populateYearSelectors();
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('cc-date').valueAsDate = new Date();
    
    // Load data with error handling
    try {
        await loadExpenseTypes();
        await loadExpenseNames();
        await loadPaymentMethods();
        await loadCreditCards();
        await loadExpenses();
        await loadCreditCardPayments();
        await loadRecentExpenses();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Warning: Some data failed to load. Navigation still works.', 'warning', 3000);
    }
});

// Event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('add-expense-btn').addEventListener('click', () => showSection('add-expense'));
    document.getElementById('cc-payments-btn').addEventListener('click', () => showSection('cc-payments'));
    document.getElementById('view-expenses-btn').addEventListener('click', () => showSection('view-expenses'));
    document.getElementById('view-payments-btn').addEventListener('click', () => showSection('view-payments'));
    document.getElementById('payment-methods-btn').addEventListener('click', () => showSection('payment-methods'));
    document.getElementById('reports-btn').addEventListener('click', () => showSection('reports'));
    document.getElementById('database-btn').addEventListener('click', () => showSection('database'));
    document.getElementById('exit-btn').addEventListener('click', handleExit);
    
    // Forms
    document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('clear-form-btn').addEventListener('click', clearForm);
    document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
    document.getElementById('cc-payment-form').addEventListener('submit', handleCCPaymentSubmit);
    document.getElementById('clear-cc-form-btn').addEventListener('click', clearCCForm);
    document.getElementById('cancel-cc-edit-btn').addEventListener('click', cancelCCEdit);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('apply-cc-filters').addEventListener('click', applyCCFilters);
    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('export-excel').addEventListener('click', exportToExcel);
    document.getElementById('refresh-recent').addEventListener('click', loadRecentExpenses);
    document.getElementById('recent-filter-month').addEventListener('change', loadRecentExpenses);
    document.getElementById('refresh-cc-recent').addEventListener('click', loadRecentCCPayments);
    document.getElementById('cc-filter-month').addEventListener('change', loadRecentCCPayments);
    document.getElementById('duplicate-expenses-btn').addEventListener('click', duplicateExpenses);
    document.getElementById('duplicate-cc-btn').addEventListener('click', duplicateCCPayments);
    document.getElementById('payment-method-form').addEventListener('submit', handlePaymentMethodSubmit);
    document.getElementById('pm-cancel-btn').addEventListener('click', cancelPaymentMethodEdit);
    
    // Database management
    document.getElementById('backup-db-btn').addEventListener('click', backupDatabase);
    document.getElementById('import-file').addEventListener('change', handleFileSelect);
    document.getElementById('import-db-btn').addEventListener('click', importDatabase);
    document.getElementById('clear-db-btn').addEventListener('click', clearDatabase);
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    document.getElementById(`${sectionId}-btn`).classList.add('active');
    
    if (sectionId === 'view-expenses') {
        displayExpenses();
    } else if (sectionId === 'view-payments') {
        displayCCPayments();
    } else if (sectionId === 'add-expense') {
        loadRecentExpenses();
    } else if (sectionId === 'cc-payments') {
        loadRecentCCPayments();
    } else if (sectionId === 'payment-methods') {
        displayPaymentMethods();
    }
}

// Load expense types from API
async function loadExpenseTypes() {
    try {
        console.log('Loading expense types from:', `${API_BASE}/expense-types`);
        const response = await fetch(`${API_BASE}/expense-types`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        expenseTypes = await response.json();
        console.log('Loaded expense types:', expenseTypes.length);
        populateExpenseTypeSelectors();
    } catch (error) {
        console.error('Error loading expense types:', error);
        alert('Could not connect to server. Please make sure the backend is running.');
    }
}

// Load expense names from API
async function loadExpenseNames() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        expenseNames = await response.json();
        populateExpenseSelectors();
    } catch (error) {
        console.error('Error loading expense names:', error);
    }
}

// Load payment methods from API
async function loadPaymentMethods() {
    try {
        const response = await fetch(`${API_BASE}/payment-methods`);
        paymentMethods = await response.json();
        populatePaymentMethodSelectors();
    } catch (error) {
        console.error('Error loading payment methods:', error);
    }
}

// Load credit cards from API
async function loadCreditCards() {
    try {
        const response = await fetch(`${API_BASE}/credit-cards`);
        creditCards = await response.json();
        populateCreditCardSelectors();
    } catch (error) {
        console.error('Error loading credit cards:', error);
    }
}

// Load credit card payments from API
async function loadCreditCardPayments() {
    try {
        const response = await fetch(`${API_BASE}/credit-card-payments`);
        creditCardPayments = await response.json();
    } catch (error) {
        console.error('Error loading credit card payments:', error);
    }
}

// Load expenses from API
async function loadExpenses() {
    try {
        const response = await fetch(`${API_BASE}/expenses`);
        expenses = await response.json();
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

// Populate expense type selectors
function populateExpenseTypeSelectors() {
    const expenseTypeDatalist = document.getElementById('expense-type-options');
    const filterExpenseTypeSelect = document.getElementById('filter-expense-type');
    
    expenseTypeDatalist.innerHTML = '';
    filterExpenseTypeSelect.innerHTML = '<option value="">All Expense Types</option>';
    
    expenseTypes.forEach(type => {
        // Add to datalist for combo input
        const option1 = document.createElement('option');
        option1.value = type.name;
        expenseTypeDatalist.appendChild(option1);
        
        // Add to filter dropdown
        const option2 = document.createElement('option');
        option2.value = type.id;
        option2.textContent = type.name;
        filterExpenseTypeSelect.appendChild(option2);
    });
}

// Populate expense selectors
function populateExpenseSelectors() {
    const expenseDatalist = document.getElementById('expense-options');
    const filterExpenseSelect = document.getElementById('filter-expense');
    
    expenseDatalist.innerHTML = '';
    filterExpenseSelect.innerHTML = '<option value="">All Expenses</option>';
    
    expenseNames.forEach(expense => {
        // Add to datalist for combo input
        const option1 = document.createElement('option');
        option1.value = expense.name;
        expenseDatalist.appendChild(option1);
        
        // Add to filter dropdown
        const option2 = document.createElement('option');
        option2.value = expense.id;
        option2.textContent = expense.name;
        filterExpenseSelect.appendChild(option2);
    });
}

// Populate payment method selectors
function populatePaymentMethodSelectors() {
    const paymentMethodSelect = document.getElementById('payment-method');
    const filterPaymentMethodSelect = document.getElementById('filter-payment-method');
    
    if (paymentMethodSelect) {
        paymentMethodSelect.innerHTML = '<option value="">Select payment method</option>';
    }
    if (filterPaymentMethodSelect) {
        filterPaymentMethodSelect.innerHTML = '<option value="">All Payment Methods</option>';
    }
    
    paymentMethods.forEach(method => {
        // Add to payment method dropdown (Add Expense tab)
        if (paymentMethodSelect) {
            const option1 = document.createElement('option');
            option1.value = method.name;
            option1.textContent = method.name;
            paymentMethodSelect.appendChild(option1);
        }
        
        // Add to filter dropdown
        if (filterPaymentMethodSelect) {
            const option2 = document.createElement('option');
            option2.value = method.id;
            option2.textContent = method.name;
            filterPaymentMethodSelect.appendChild(option2);
        }
    });
}

// Populate credit card selectors
function populateCreditCardSelectors() {
    const ccSelect = document.getElementById('cc-name');
    const filterCCSelect = document.getElementById('cc-filter-card');
    
    // Populate CC payment form with only credit card payment methods
    if (ccSelect) {
        ccSelect.innerHTML = '<option value="">Select credit card</option>';
        const creditCardMethods = paymentMethods.filter(method => method.type === 'credit_card');
        creditCardMethods.forEach(method => {
            const option = document.createElement('option');
            option.value = method.name;
            option.textContent = method.name;
            ccSelect.appendChild(option);
        });
    }
    
    // Populate filter dropdown with all credit cards from various sources
    if (filterCCSelect) {
        filterCCSelect.innerHTML = '<option value="">All Credit Cards</option>';
        creditCards.forEach(cc => {
            const option = document.createElement('option');
            option.value = cc.name;
            option.textContent = cc.name;
            filterCCSelect.appendChild(option);
        });
    }
}

// Populate year selectors
function populateYearSelectors() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - i + 5);
    
    const selectors = ['filter-year', 'cc-filter-year', 'report-year', 'duplicate-year', 'duplicate-cc-year'];
    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        if (select) {
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                select.appendChild(option);
            });
        }
    });
    
    // Set duplicate month to previous month by default for both expense and CC selectors
    const currentMonth = new Date().getMonth(); // 0-based
    const prevMonth = currentMonth === 0 ? 12 : currentMonth;
    
    ['duplicate-month', 'duplicate-cc-month'].forEach(selectorId => {
        const duplicateMonthSelect = document.getElementById(selectorId);
        if (duplicateMonthSelect) {
            duplicateMonthSelect.value = String(prevMonth).padStart(2, '0');
            if (currentMonth === 0) {
                // If current month is January, set duplicate year to previous year
                const yearSelectorId = selectorId.replace('-month', '-year');
                const duplicateYearSelect = document.getElementById(yearSelectorId);
                if (duplicateYearSelect) {
                    duplicateYearSelect.value = currentYear - 1;
                }
            }
        }
    });
}

// Handle expense form submission
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = {
        date: document.getElementById('date').value,
        expense_type_name: document.getElementById('expense-type').value.trim(),
        category_name: document.getElementById('expense').value.trim(),
        payment_method_name: document.getElementById('payment-method').value,
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        notes: document.getElementById('notes').value
    };
    
    try {
        const url = editingExpense ? 
            `${API_BASE}/expenses/${editingExpense.id}` : 
            `${API_BASE}/expenses`;
        const method = editingExpense ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const wasEditing = editingExpense !== null;
            let savedPaymentMethod = '';
            
            if (wasEditing) {
                // Clear form completely after editing
                clearForm();
            } else {
                // Keep form values including payment method but clear amount and description for easy re-entry
                savedPaymentMethod = document.getElementById('payment-method').value;
                document.getElementById('amount').value = '';
                document.getElementById('description').value = '';
                document.getElementById('notes').value = '';
            }
            
            editingExpense = null;
            
            // Reload data in case new items were added
            await loadExpenseTypes();
            await loadExpenseNames();
            await loadPaymentMethods();
            await loadExpenses();
            
            // Restore payment method selection for new expenses only
            if (!wasEditing && savedPaymentMethod) {
                document.getElementById('payment-method').value = savedPaymentMethod;
            }
            
            // Update recent expenses list on the split screen
            await loadRecentExpenses();
            
            showNotification(wasEditing ? 'Expense updated!' : 'Expense added!');
        } else {
            const error = await response.json();
            showNotification('Error: ' + error.error, 'error');
        }
    } catch (error) {
        console.error('Error saving expense:', error);
        showNotification('Error saving expense. Please try again.', 'error');
    }
}

// Apply filters to expenses
async function applyFilters() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    const expense_type_id = document.getElementById('filter-expense-type').value;
    const category_id = document.getElementById('filter-expense').value;
    const payment_method_id = document.getElementById('filter-payment-method').value;
    
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (expense_type_id) params.append('expense_type_id', expense_type_id);
    if (category_id) params.append('category_id', category_id);
    if (payment_method_id) params.append('payment_method_id', payment_method_id);
    
    try {
        const response = await fetch(`${API_BASE}/expenses?${params}`);
        expenses = await response.json();
        displayExpenses();
    } catch (error) {
        console.error('Error filtering expenses:', error);
    }
}

// Apply filters to credit card payments
async function applyCCFilters() {
    const year = document.getElementById('cc-filter-year').value;
    const month = document.getElementById('cc-filter-month-view').value;
    const credit_card_name = document.getElementById('cc-filter-card').value;
    
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (credit_card_name) params.append('credit_card_name', credit_card_name);
    
    try {
        const response = await fetch(`${API_BASE}/credit-card-payments?${params}`);
        creditCardPayments = await response.json();
        displayCCPayments();
    } catch (error) {
        console.error('Error filtering credit card payments:', error);
    }
}

// Display expenses list
function displayExpenses() {
    const container = document.getElementById('expenses-list');
    const totalContainer = document.getElementById('expenses-total');
    container.innerHTML = '';
    
    // Calculate and display total
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    totalContainer.innerHTML = `<div class="expenses-total-amount"><strong>Total: $${total.toFixed(2)}</strong></div>`;
    
    if (expenses.length === 0) {
        container.innerHTML = '<p>No expenses found.</p>';
        totalContainer.innerHTML = '<div class="expenses-total-amount"><strong>Total: $0.00</strong></div>';
        return;
    }
    
    expenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="expense-details">
                <div class="expense-date">${formatDateDisplay(expense.date)}</div>
                <div class="expense-type">${expense.expense_type_name}</div>
                <div class="expense-name">${expense.category_name}</div>
                <div class="expense-payment-method">${expense.payment_method_name} (${expense.payment_method_type.replace('_', ' ')})</div>
                <div class="expense-description">${expense.description || 'No description'}</div>
                ${expense.notes ? `<div class="expense-notes"><small>${expense.notes}</small></div>` : ''}
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editExpense(${expense.id})">Edit</button>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Display credit card payments list
function displayCCPayments() {
    const container = document.getElementById('cc-payments-list');
    const totalContainer = document.getElementById('cc-payments-total');
    container.innerHTML = '';
    
    // Calculate and display total
    const total = creditCardPayments.reduce((sum, payment) => sum + parseFloat(payment.payment_amount), 0);
    totalContainer.innerHTML = `<div class="expenses-total-amount"><strong>Total: $${total.toFixed(2)}</strong></div>`;
    
    if (creditCardPayments.length === 0) {
        container.innerHTML = '<p>No credit card payments found.</p>';
        totalContainer.innerHTML = '<div class="expenses-total-amount"><strong>Total: $0.00</strong></div>';
        return;
    }
    
    creditCardPayments.forEach(payment => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="expense-details">
                <div class="expense-date">${formatDateDisplay(payment.date)}</div>
                <div class="expense-type">Credit Card Payment</div>
                <div class="expense-name">${payment.credit_card_name}</div>
                <div class="expense-description">Payment Amount</div>
                ${payment.notes ? `<div class="expense-notes"><small>${payment.notes}</small></div>` : ''}
            </div>
            <div class="expense-amount">$${payment.payment_amount.toFixed(2)}</div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editCCPayment(${payment.id})">Edit</button>
                <button class="btn-delete" onclick="deleteCCPayment(${payment.id})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Clear form
function clearForm() {
    document.getElementById('expense-form').reset();
    document.getElementById('date').valueAsDate = new Date();
    editingExpense = null;
    setEditMode(false);
}

// Clear credit card form
function clearCCForm() {
    document.getElementById('cc-payment-form').reset();
    document.getElementById('cc-date').valueAsDate = new Date();
    editingPayment = null;
    setCCEditMode(false);
}

// Cancel editing expense
function cancelEdit() {
    clearForm();
}

// Cancel editing credit card payment
function cancelCCEdit() {
    clearCCForm();
}

// Set edit mode for expense form
function setEditMode(isEdit) {
    const submitBtn = document.getElementById('expense-submit-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const formTitle = document.querySelector('#add-expense .split-left h2');
    
    if (isEdit) {
        submitBtn.textContent = 'Update Expense';
        cancelBtn.style.display = 'inline-block';
        formTitle.textContent = 'Edit Expense';
        formTitle.style.color = '#f39c12';
    } else {
        submitBtn.textContent = 'Add Expense';
        cancelBtn.style.display = 'none';
        formTitle.textContent = 'Add New Expense';
        formTitle.style.color = '#2c3e50';
    }
}

// Set edit mode for credit card form
function setCCEditMode(isEdit) {
    const submitBtn = document.getElementById('cc-submit-btn');
    const cancelBtn = document.getElementById('cancel-cc-edit-btn');
    const formTitle = document.querySelector('#cc-payments .split-left h2');
    
    if (isEdit) {
        submitBtn.textContent = 'Update Payment';
        cancelBtn.style.display = 'inline-block';
        formTitle.textContent = 'Edit Credit Card Payment';
        formTitle.style.color = '#f39c12';
    } else {
        submitBtn.textContent = 'Add Payment';
        cancelBtn.style.display = 'none';
        formTitle.textContent = 'Add Credit Card Payment';
        formTitle.style.color = '#2c3e50';
    }
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    
    editingExpense = expense;
    
    document.getElementById('date').value = expense.date;
    document.getElementById('expense-type').value = expense.expense_type_name;
    document.getElementById('expense').value = expense.category_name;
    document.getElementById('payment-method').value = expense.payment_method_name;
    document.getElementById('description').value = expense.description || '';
    document.getElementById('amount').value = expense.amount;
    document.getElementById('notes').value = expense.notes || '';
    
    setEditMode(true);
    showSection('add-expense');
}

// Handle credit card payment form submission
async function handleCCPaymentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        date: document.getElementById('cc-date').value,
        credit_card_name: document.getElementById('cc-name').value,
        payment_amount: parseFloat(document.getElementById('cc-amount').value),
        notes: document.getElementById('cc-notes').value
    };
    
    try {
        const url = editingPayment ? 
            `${API_BASE}/credit-card-payments/${editingPayment.id}` : 
            `${API_BASE}/credit-card-payments`;
        const method = editingPayment ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const wasEditing = editingPayment !== null;
            
            if (wasEditing) {
                // Clear form completely after editing
                clearCCForm();
            } else {
                // Keep form values but clear amount and notes for easy re-entry
                document.getElementById('cc-amount').value = '';
                document.getElementById('cc-notes').value = '';
            }
            
            editingPayment = null;
            
            // Reload data (no need to reload credit cards since they can't be created here anymore)
            await loadCreditCardPayments();
            await loadRecentCCPayments();
            
            showNotification(wasEditing ? 'Payment updated!' : 'Payment added!');
        } else {
            const error = await response.json();
            showNotification('Error: ' + error.error, 'error');
        }
    } catch (error) {
        console.error('Error saving payment:', error);
        showNotification('Error saving payment. Please try again.', 'error');
    }
}

// Handle exit button
async function handleExit() {
    if (confirm('Are you sure you want to exit the application?')) {
        try {
            await fetch(`${API_BASE}/exit`, {
                method: 'POST'
            });
            alert('Application is shutting down...');
        } catch (error) {
            console.log('Server already shut down');
            alert('Application closed');
        }
    }
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadExpenses();
            await loadRecentExpenses(); // Also refresh recent expenses
            displayExpenses();
            showNotification('Expense deleted!', 'info');
        } else {
            showNotification('Error deleting expense', 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification('Error deleting expense', 'error');
    }
}

// Generate report
async function generateReport() {
    const year = document.getElementById('report-year').value;
    const month = document.getElementById('report-month').value;
    
    if (!year) {
        alert('Please select a year');
        return;
    }
    
    try {
        const endpoint = month ? 
            `${API_BASE}/reports/monthly/${year}/${month}` : 
            `${API_BASE}/reports/yearly/${year}`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        displayReport(data, year, month);
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report');
    }
}

// Export report to Excel
async function exportToExcel() {
    const year = document.getElementById('report-year').value;
    const month = document.getElementById('report-month').value;
    
    if (!year) {
        alert('Please select a year first');
        return;
    }
    
    const exportBtn = document.getElementById('export-excel');
    exportBtn.disabled = true;
    exportBtn.textContent = 'Exporting...';
    
    try {
        const endpoint = month ? 
            `${API_BASE}/reports/export/monthly/${year}/${month}` : 
            `${API_BASE}/reports/export/yearly/${year}`;
        
        const response = await fetch(endpoint);
        
        if (response.ok) {
            const blob = await response.blob();
            const filename = month ? 
                `spending-report-${year}-${month.padStart(2, '0')}.xlsx` :
                `spending-report-${year}.xlsx`;
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            alert('Excel report exported successfully!');
        } else {
            const error = await response.json();
            alert('Error exporting report: ' + error.error);
        }
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Error exporting to Excel. Please try again.');
    } finally {
        exportBtn.disabled = false;
        exportBtn.textContent = 'Export to Excel';
    }
}

// Display report
function displayReport(data, year, month) {
    const container = document.getElementById('report-content');
    
    if (data.length === 0) {
        container.innerHTML = '<p>No data found for the selected period.</p>';
        return;
    }
    
    const total = data.reduce((sum, item) => sum + item.total, 0);
    const period = month ? 
        `${getMonthName(month)} ${year}` : 
        year;
    
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.expense_type]) acc[item.expense_type] = [];
        acc[item.expense_type].push(item);
        return acc;
    }, {});
    
    let html = `
        <div class="report-summary">
            <h3>Summary for ${period}</h3>
            <p><strong>Total Spending: $${total.toFixed(2)}</strong></p>
            <p>Total Transactions: ${data.reduce((sum, item) => sum + item.transaction_count, 0)}</p>
        </div>
    `;
    
    Object.entries(groupedData).forEach(([expenseType, items]) => {
        const expenseTypeTotal = items.reduce((sum, item) => sum + item.total, 0);
        html += `
            <div class="category-group">
                <h3>${expenseType} - $${expenseTypeTotal.toFixed(2)}</h3>
                ${items.map(item => `
                    <div class="category-item">
                        <span>${item.category} - ${item.payment_method} (${item.transaction_count} transactions)</span>
                        <span class="total-amount">$${item.total.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load recent expenses for split screen
async function loadRecentExpenses() {
    const filterMonth = document.getElementById('recent-filter-month').value;
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const params = new URLSearchParams();
    params.append('year', currentYear);
    
    if (filterMonth === 'all') {
        // Load all expenses, no month filter
        params.delete('year');
    } else if (filterMonth === '') {
        // Default: this month
        params.append('month', currentMonth);
    } else {
        // Specific month
        params.append('month', filterMonth);
    }
    
    try {
        const response = await fetch(`${API_BASE}/expenses?${params}`);
        const recentExpenses = await response.json();
        displayRecentExpenses(recentExpenses);
    } catch (error) {
        console.error('Error loading recent expenses:', error);
    }
}

// Display recent expenses in the right panel
function displayRecentExpenses(recentExpenses) {
    const container = document.getElementById('recent-expenses-list');
    container.innerHTML = '';
    
    if (recentExpenses.length === 0) {
        container.innerHTML = '<p>No recent expenses found.</p>';
        return;
    }
    
    recentExpenses.slice(0, 20).forEach(expense => { // Limit to 20 most recent
        const item = document.createElement('div');
        item.className = 'recent-expense-item';
        item.innerHTML = `
            <div class="recent-item-content">
                <div class="recent-expense-header">
                    <span class="recent-expense-date">${formatDateDisplay(expense.date)}</span>
                    <span class="recent-expense-amount">$${expense.amount.toFixed(2)}</span>
                </div>
                <div class="recent-expense-details">
                    <strong>${expense.category_name}</strong><br>
                    ${expense.expense_type_name} • ${expense.payment_method_name}
                    ${expense.description ? `<br><em>${expense.description}</em>` : ''}
                </div>
            </div>
            <div class="recent-item-actions">
                <button class="btn-edit-recent" onclick="editExpense(${expense.id})" title="Edit expense">✏️</button>
                <button class="btn-delete-recent" onclick="deleteExpense(${expense.id})" title="Delete expense">🗑️</button>
            </div>
        `;
        
        // Add click handler for editing (on the content area, not buttons)
        const contentArea = item.querySelector('.recent-item-content');
        contentArea.addEventListener('click', () => editExpense(expense.id));
        contentArea.style.cursor = 'pointer';
        contentArea.title = 'Click to edit this expense';
        
        container.appendChild(item);
    });
}

// Load recent credit card payments for split screen
async function loadRecentCCPayments() {
    const filterMonth = document.getElementById('cc-filter-month').value;
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const params = new URLSearchParams();
    params.append('year', currentYear);
    
    if (filterMonth === 'all') {
        params.delete('year');
    } else if (filterMonth === '') {
        params.append('month', currentMonth);
    } else {
        params.append('month', filterMonth);
    }
    
    try {
        const response = await fetch(`${API_BASE}/credit-card-payments?${params}`);
        const recentPayments = await response.json();
        displayRecentCCPayments(recentPayments);
    } catch (error) {
        console.error('Error loading recent credit card payments:', error);
    }
}

// Display recent credit card payments in the right panel
function displayRecentCCPayments(recentPayments) {
    const container = document.getElementById('cc-recent-payments-list');
    container.innerHTML = '';
    
    if (recentPayments.length === 0) {
        container.innerHTML = '<p>No recent payments found.</p>';
        return;
    }
    
    recentPayments.slice(0, 20).forEach(payment => {
        const item = document.createElement('div');
        item.className = 'recent-expense-item';
        item.innerHTML = `
            <div class="recent-item-content">
                <div class="recent-expense-header">
                    <span class="recent-expense-date">${formatDateDisplay(payment.date)}</span>
                    <span class="recent-expense-amount">$${payment.payment_amount.toFixed(2)}</span>
                </div>
                <div class="recent-expense-details">
                    <strong>${payment.credit_card_name}</strong><br>
                    Credit Card Payment
                    ${payment.notes ? `<br><em>${payment.notes}</em>` : ''}
                </div>
            </div>
            <div class="recent-item-actions">
                <button class="btn-edit-recent" onclick="editCCPayment(${payment.id})" title="Edit payment">✏️</button>
                <button class="btn-delete-recent" onclick="deleteCCPayment(${payment.id})" title="Delete payment">🗑️</button>
            </div>
        `;
        
        // Add click handler for editing (on the content area, not buttons)
        const contentArea = item.querySelector('.recent-item-content');
        contentArea.addEventListener('click', () => editCCPayment(payment.id));
        contentArea.style.cursor = 'pointer';
        contentArea.title = 'Click to edit this payment';
        
        container.appendChild(item);
    });
}

// Edit credit card payment
function editCCPayment(id) {
    const payment = creditCardPayments.find(p => p.id === id);
    if (!payment) return;
    
    editingPayment = payment;
    
    document.getElementById('cc-date').value = payment.date;
    document.getElementById('cc-name').value = payment.credit_card_name;
    document.getElementById('cc-amount').value = payment.payment_amount;
    document.getElementById('cc-notes').value = payment.notes || '';
    
    setCCEditMode(true);
    showSection('cc-payments');
}

// Delete credit card payment
async function deleteCCPayment(id) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/credit-card-payments/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadCreditCardPayments();
            await loadRecentCCPayments();
            displayCCPayments(); // Also refresh the view
            showNotification('Payment deleted!', 'info');
        } else {
            showNotification('Error deleting payment', 'error');
        }
    } catch (error) {
        console.error('Error deleting payment:', error);
        showNotification('Error deleting payment', 'error');
    }
}

// Duplicate expenses from selected month
async function duplicateExpenses() {
    const year = document.getElementById('duplicate-year').value;
    const month = document.getElementById('duplicate-month').value;
    
    if (!year || !month) {
        showNotification('Please select both year and month to duplicate from.', 'warning');
        return;
    }
    
    const confirmMessage = `This will duplicate all expenses from ${getMonthName(month)} ${year} to today's date. Continue?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const duplicateBtn = document.getElementById('duplicate-expenses-btn');
    duplicateBtn.disabled = true;
    duplicateBtn.textContent = 'Duplicating...';
    
    try {
        // Get expenses from selected month
        const params = new URLSearchParams();
        params.append('year', year);
        params.append('month', month);
        
        const response = await fetch(`${API_BASE}/expenses?${params}`);
        const expensesToDuplicate = await response.json();
        
        if (expensesToDuplicate.length === 0) {
            showNotification(`No expenses found for ${getMonthName(month)} ${year}.`, 'warning');
            return;
        }
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        let successCount = 0;
        let failCount = 0;
        
        // Duplicate each expense with today's date
        for (const expense of expensesToDuplicate) {
            try {
                const newExpense = {
                    date: today,
                    expense_type_name: expense.expense_type_name,
                    category_name: expense.category_name,
                    payment_method_name: expense.payment_method_name,
                    description: expense.description || '',
                    amount: expense.amount,
                    notes: expense.notes || ''
                };
                
                const duplicateResponse = await fetch(`${API_BASE}/expenses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newExpense)
                });
                
                if (duplicateResponse.ok) {
                    successCount++;
                } else {
                    failCount++;
                    console.error('Failed to duplicate expense:', expense);
                }
            } catch (error) {
                failCount++;
                console.error('Error duplicating expense:', expense, error);
            }
        }
        
        // Show results
        let message = `Successfully duplicated ${successCount} expenses to today's date.`;
        if (failCount > 0) {
            message += ` ${failCount} expenses failed to duplicate.`;
        }
        showNotification(message, successCount > 0 ? 'success' : 'warning', 2000);
        
        // Refresh data
        await loadExpenseTypes();
        await loadExpenseNames();
        await loadPaymentMethods();
        await loadExpenses();
        await loadRecentExpenses();
        
    } catch (error) {
        console.error('Error duplicating expenses:', error);
        showNotification('Error duplicating expenses. Please try again.', 'error');
    } finally {
        duplicateBtn.disabled = false;
        duplicateBtn.textContent = 'Duplicate Expenses';
    }
}

// Payment Methods Management

// Handle payment method form submission
async function handlePaymentMethodSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('pm-name').value.trim(),
        type: document.getElementById('pm-type').value
    };
    
    try {
        const url = editingPaymentMethod ? 
            `${API_BASE}/payment-methods/${editingPaymentMethod.id}` : 
            `${API_BASE}/payment-methods`;
        const method = editingPaymentMethod ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('payment-method-form').reset();
            editingPaymentMethod = null;
            setPaymentMethodEditMode(false);
            
            // Reload data
            await loadPaymentMethods();
            await loadCreditCards();
            displayPaymentMethods();
            
            showNotification(editingPaymentMethod ? 'Payment method updated!' : 'Payment method added!');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error saving payment method:', error);
        alert('Error saving payment method. Please try again.');
    }
}

// Display payment methods list
function displayPaymentMethods() {
    const container = document.getElementById('payment-methods-list');
    container.innerHTML = '';
    
    if (paymentMethods.length === 0) {
        container.innerHTML = '<p>No payment methods found.</p>';
        return;
    }
    
    paymentMethods.forEach(method => {
        const item = document.createElement('div');
        item.className = 'payment-method-item';
        item.innerHTML = `
            <div class="payment-method-details">
                <div class="payment-method-name">${method.name}</div>
                <div class="payment-method-type">${method.type.replace('_', ' ')}</div>
            </div>
            <div class="payment-method-actions">
                <button class="btn-edit" onclick="editPaymentMethod(${method.id})">Edit</button>
                <button class="btn-delete" onclick="deletePaymentMethod(${method.id})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Edit payment method
function editPaymentMethod(id) {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;
    
    editingPaymentMethod = method;
    
    document.getElementById('pm-name').value = method.name;
    document.getElementById('pm-type').value = method.type;
    
    setPaymentMethodEditMode(true);
}

// Cancel payment method editing
function cancelPaymentMethodEdit() {
    document.getElementById('payment-method-form').reset();
    editingPaymentMethod = null;
    setPaymentMethodEditMode(false);
}

// Set edit mode for payment method form
function setPaymentMethodEditMode(isEdit) {
    const submitBtn = document.getElementById('pm-submit-btn');
    const cancelBtn = document.getElementById('pm-cancel-btn');
    const formTitle = document.querySelector('.payment-method-form-section h3');
    
    if (isEdit) {
        submitBtn.textContent = 'Update Payment Method';
        cancelBtn.style.display = 'inline-block';
        formTitle.textContent = 'Edit Payment Method';
        formTitle.style.color = '#f39c12';
    } else {
        submitBtn.textContent = 'Add Payment Method';
        cancelBtn.style.display = 'none';
        formTitle.textContent = 'Add New Payment Method';
        formTitle.style.color = '#2c3e50';
    }
}

// Delete payment method
async function deletePaymentMethod(id) {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;
    
    if (!confirm(`Are you sure you want to delete "${method.name}"?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/payment-methods/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadPaymentMethods();
            await loadCreditCards();
            displayPaymentMethods();
            alert('Payment method deleted successfully');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting payment method:', error);
        alert('Error deleting payment method');
    }
}

// Duplicate credit card payments from selected month
async function duplicateCCPayments() {
    const year = document.getElementById('duplicate-cc-year').value;
    const month = document.getElementById('duplicate-cc-month').value;
    
    if (!year || !month) {
        showNotification('Please select both year and month to duplicate from.', 'warning');
        return;
    }
    
    const confirmMessage = `This will duplicate all credit card payments from ${getMonthName(month)} ${year} to today's date. Continue?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const duplicateBtn = document.getElementById('duplicate-cc-btn');
    duplicateBtn.disabled = true;
    duplicateBtn.textContent = 'Duplicating...';
    
    try {
        // Get credit card payments from selected month
        const params = new URLSearchParams();
        params.append('year', year);
        params.append('month', month);
        
        const response = await fetch(`${API_BASE}/credit-card-payments?${params}`);
        const paymentsToDuplicate = await response.json();
        
        if (paymentsToDuplicate.length === 0) {
            showNotification(`No credit card payments found for ${getMonthName(month)} ${year}.`, 'warning');
            return;
        }
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        let successCount = 0;
        let failCount = 0;
        
        // Duplicate each payment with today's date
        for (const payment of paymentsToDuplicate) {
            try {
                const newPayment = {
                    date: today,
                    credit_card_name: payment.credit_card_name,
                    payment_amount: payment.payment_amount,
                    notes: payment.notes || ''
                };
                
                const duplicateResponse = await fetch(`${API_BASE}/credit-card-payments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPayment)
                });
                
                if (duplicateResponse.ok) {
                    successCount++;
                } else {
                    failCount++;
                    console.error('Failed to duplicate payment:', payment);
                }
            } catch (error) {
                failCount++;
                console.error('Error duplicating payment:', payment, error);
            }
        }
        
        // Show results
        let message = `Successfully duplicated ${successCount} credit card payments to today's date.`;
        if (failCount > 0) {
            message += ` ${failCount} payments failed to duplicate.`;
        }
        showNotification(message, successCount > 0 ? 'success' : 'warning', 2000);
        
        // Refresh data
        await loadCreditCards();
        await loadCreditCardPayments();
        await loadRecentCCPayments();
        
    } catch (error) {
        console.error('Error duplicating credit card payments:', error);
        showNotification('Error duplicating credit card payments. Please try again.', 'error');
    } finally {
        duplicateBtn.disabled = false;
        duplicateBtn.textContent = 'Duplicate Payments';
    }
}

// Helper function to get month name
function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1];
}

// Notification System
function showNotification(message, type = 'success', duration = 1000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Database Management Functions
function backupDatabase() {
    try {
        // Create a link to download the backup
        const link = document.createElement('a');
        link.href = `${API_BASE}/database/backup`;
        link.download = `spending-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error backing up database:', error);
        showNotification('Error backing up database. Please try again.', 'error');
    }
}

function handleFileSelect() {
    const fileInput = document.getElementById('import-file');
    const importBtn = document.getElementById('import-db-btn');
    
    if (fileInput.files.length > 0) {
        importBtn.disabled = false;
    } else {
        importBtn.disabled = true;
    }
}

async function importDatabase() {
    const fileInput = document.getElementById('import-file');
    const importBtn = document.getElementById('import-db-btn');
    const statusDiv = document.getElementById('import-status');
    
    if (fileInput.files.length === 0) {
        showNotification('Please select a database file to import.', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!confirm('Are you sure you want to import this database? This will merge the data with your current database.')) {
        return;
    }
    
    try {
        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';
        statusDiv.innerHTML = '<p style="color: #f39c12;">Importing database...</p>';
        
        const formData = new FormData();
        formData.append('dbFile', file);
        
        const response = await fetch(`${API_BASE}/database/import`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            statusDiv.innerHTML = `<p style="color: #27ae60;">Import successful! Imported: ${JSON.stringify(result.imported)}</p>`;
            fileInput.value = '';
            
            // Refresh all data
            await loadExpenseTypes();
            await loadExpenseNames();
            await loadPaymentMethods();
            await loadCreditCards();
            await loadExpenses();
            await loadCreditCardPayments();
        } else {
            statusDiv.innerHTML = `<p style="color: #e74c3c;">Import failed: ${result.error}</p>`;
        }
    } catch (error) {
        console.error('Error importing database:', error);
        statusDiv.innerHTML = '<p style="color: #e74c3c;">Import failed. Please check the file and try again.</p>';
    } finally {
        importBtn.disabled = true;
        importBtn.textContent = 'Import Database';
    }
}

async function clearDatabase() {
    if (!confirm('WARNING: This will permanently delete ALL your data. This action cannot be undone. Are you absolutely sure?')) {
        return;
    }
    
    if (!confirm('Last chance! This will erase your entire database. Type "YES" to confirm.')) {
        return;
    }
    
    const clearBtn = document.getElementById('clear-db-btn');
    const statusDiv = document.getElementById('clear-status');
    
    try {
        clearBtn.disabled = true;
        clearBtn.textContent = 'Clearing...';
        statusDiv.innerHTML = '<p style="color: #f39c12;">Clearing database...</p>';
        
        const response = await fetch(`${API_BASE}/database/clear`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            statusDiv.innerHTML = '<p style="color: #27ae60;">Database cleared successfully!</p>';
            
            // Refresh all data
            await loadExpenseTypes();
            await loadExpenseNames();
            await loadPaymentMethods();
            await loadCreditCards();
            await loadExpenses();
            await loadCreditCardPayments();
            
            // Clear forms
            clearForm();
            clearCCForm();
        } else {
            statusDiv.innerHTML = `<p style="color: #e74c3c;">Clear failed: ${result.error}</p>`;
        }
    } catch (error) {
        console.error('Error clearing database:', error);
        statusDiv.innerHTML = '<p style="color: #e74c3c;">Clear failed. Please try again.</p>';
    } finally {
        clearBtn.disabled = false;
        clearBtn.textContent = 'Clear All Data';
    }
}
