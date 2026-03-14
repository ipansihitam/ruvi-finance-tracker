// ===== RENDER FUNCTIONS =====

function renderAll() {
  renderRecentTransactions();
  renderTransactionTable();
  renderWallets();
  renderBudgets();
  renderGoals();
  renderDebts();
}

// ===== RENDER RECENT TRANSACTIONS =====
function renderRecentTransactions() {
  const container = document.getElementById('recentTransactions');
  if (!container) return;
  
  const transactions = dataStore.transactions.slice(0, 5);
  container.innerHTML = transactions.map(t => 
    '<div class="transaction-item">' +
      '<div class="transaction-icon ' + t.type + '">' + getIconSVG(t.icon) + '</div>' +
      '<div class="transaction-details">' +
        '<div class="transaction-name">' + t.name + '</div>' +
        '<div class="transaction-category">' + t.category + ' - ' + t.wallet + '</div>' +
      '</div>' +
      '<div class="transaction-meta">' +
        '<div class="transaction-amount ' + t.type + '">' + (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount) + '</div>' +
        '<div class="transaction-date">' + formatDate(t.date) + '</div>' +
      '</div>' +
    '</div>'
  ).join('');
}

// ===== RENDER TRANSACTION TABLE =====
function renderTransactionTable(filter = '') {
  const container = document.getElementById('transactionTableBody');
  if (!container) return;
  
  let transactions = dataStore.transactions;
  
  if (filter) {
    const search = filter.toLowerCase();
    transactions = transactions.filter(t => 
      t.name.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search) ||
      t.wallet.toLowerCase().includes(search)
    );
  }

  if (transactions.length === 0) {
    container.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">Tidak ada transaksi ditemukan</td></tr>';
    return;
  }

  container.innerHTML = transactions.map(t => 
    '<tr>' +
      '<td>' + formatDate(t.date) + '</td>' +
      '<td><div style="display: flex; align-items: center; gap: 10px;"><span class="table-icon ' + t.type + '">' + getIconSVG(t.icon) + '</span>' + t.name + '</div></td>' +
      '<td>' + t.category + '</td>' +
      '<td>' + t.wallet + '</td>' +
      '<td><span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ' + 
        (t.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : t.type === 'expense' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(139, 92, 246, 0.15)') + 
        '; color: ' + (t.type === 'income' ? 'var(--income-green)' : t.type === 'expense' ? 'var(--expense-red)' : 'var(--accent-primary)') + 
        ';">' + (t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer') + '</span></td>' +
      '<td style="text-align: right; font-weight: 700; color: ' + (t.type === 'income' ? 'var(--income-green)' : 'var(--expense-red)') + ';">' + 
        (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount) + '</td>' +
      '<td><div class="action-btns">' +
        '<button class="action-btn edit" onclick="openTransactionModal(' + t.id + ')" title="Edit">' + 
          '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
        '</button>' +
        '<button class="action-btn delete" onclick="deleteTransaction(' + t.id + ')" title="Hapus">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
        '</button>' +
      '</div></td>' +
    '</tr>'
  ).join('');
}

// ===== RENDER WALLETS =====
function renderWallets() {
  const container = document.getElementById('walletsGrid');
  if (!container) return;
  
  container.innerHTML = dataStore.wallets.map(w => 
    '<div class="wallet-card ' + w.class + '">' +
      '<div class="wallet-header">' +
        '<div class="wallet-logo">' + w.name + '</div>' +
        '<div class="wallet-type">' + w.type + '</div>' +
      '</div>' +
      '<div class="wallet-balance">' + formatCurrency(w.balance) + '</div>' +
      '<div class="wallet-number">' + w.number + '</div>' +
      '<div class="wallet-actions">' +
        '<button class="wallet-action-btn" onclick="openTransferModal(' + w.id + ')">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>' +
          ' Transfer' +
        '</button>' +
        '<button class="wallet-action-btn" onclick="showWalletHistory(' + w.id + ')">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>' +
          ' Riwayat' +
        '</button>' +
        '<button class="wallet-action-btn" onclick="openWalletModal(' + w.id + ')">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
          ' Edit' +
        '</button>' +
      '</div>' +
    '</div>'
  ).join('');
}

function showWalletHistory(walletId) {
  const wallet = dataStore.wallets.find(w => w.id === walletId);
  const history = dataStore.transactions.filter(t => t.wallet === wallet.name);
  
  if (history.length === 0) {
    showToast('Belum ada riwayat transaksi untuk ' + wallet.name, 'success');
    return;
  }
  
  let message = 'Riwayat transaksi ' + wallet.name + ':\n\n';
  history.slice(0, 10).forEach(t => {
    const sign = t.type === 'income' ? '+' : '-';
    message += formatDate(t.date) + ' | ' + t.name + '\n' + sign + formatCurrency(t.amount) + '\n\n';
  });
  alert(message);
}

// ===== RENDER BUDGETS =====
function renderBudgets() {
  const container = document.getElementById('budgetList');
  if (!container) return;
  
  container.innerHTML = dataStore.budgets.map(b => {
    const percentage = Math.round((b.spent / b.limit) * 100);
    let progressClass = 'safe';
    if (percentage >= 80) progressClass = 'danger';
    else if (percentage >= 60) progressClass = 'warning';

    return '<div class="budget-item">' +
      '<div class="budget-header">' +
        '<div class="budget-info">' +
          '<div class="budget-icon">' + getIconSVG(b.icon) + '</div>' +
          '<div>' +
            '<div class="budget-name">' + b.name + '</div>' +
            '<div class="budget-amounts">' + formatCurrency(b.spent) + ' dari ' + formatCurrency(b.limit) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="budget-actions">' +
          '<button class="btn btn-secondary btn-sm" onclick="addBudgetSpent(' + b.id + ')">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
            ' Tambah' +
          '</button>' +
          '<button class="btn btn-secondary btn-sm" onclick="openBudgetModal(' + b.id + ')">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
          '</button>' +
          '<button class="btn btn-secondary btn-sm" onclick="deleteBudget(' + b.id + ')">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="budget-progress-container">' +
        '<div class="budget-progress">' +
          '<div class="budget-progress-bar ' + progressClass + '" style="width: ' + Math.min(percentage, 100) + '%"></div>' +
        '</div>' +
        '<div class="budget-percentage">' + percentage + '%</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ===== RENDER GOALS =====
function renderGoals() {
  const container = document.getElementById('goalsGrid');
  if (!container) return;
  
  container.innerHTML = dataStore.goals.map(g => {
    const percentage = Math.round((g.current / g.target) * 100);
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (percentage / 100) * circumference;

    return '<div class="goal-card">' +
      '<div class="goal-progress-circle">' +
        '<svg width="120" height="120">' +
          '<circle class="goal-progress-bg" cx="60" cy="60" r="52"></circle>' +
          '<circle class="goal-progress-fill" cx="60" cy="60" r="52" style="stroke-dasharray: ' + circumference + '; stroke-dashoffset: ' + offset + ';"></circle>' +
        '</svg>' +
        '<div class="goal-progress-text">' + percentage + '%</div>' +
      '</div>' +
      '<div class="goal-name">' + g.name + '</div>' +
      '<div class="goal-target">Target: ' + formatCurrency(g.target) + '</div>' +
      '<div class="goal-amounts">' +
        '<span class="goal-current">' + formatCurrency(g.current) + '</span>' +
        '<span class="goal-total">/ ' + formatCurrency(g.target) + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ===== RENDER DEBTS =====
function renderDebts() {
  const myDebtsContainer = document.getElementById('myDebtsList');
  const othersDebtsContainer = document.getElementById('othersDebtsList');

  if (myDebtsContainer) {
    if (dataStore.myDebts.length === 0) {
      myDebtsContainer.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><div>Belum ada hutang! Mantap!</div></div>';
    } else {
      myDebtsContainer.innerHTML = dataStore.myDebts.map(d => 
        '<div class="debt-item">' +
          '<div class="debt-avatar">' + d.name.split(' ').map(n => n[0]).join('') + '</div>' +
          '<div class="debt-info">' +
            '<div class="debt-name">' + d.name + '</div>' +
            '<div class="debt-meta">Sisa: ' + formatCurrency(d.amount - d.paid) + '</div>' +
          '</div>' +
          '<div class="debt-amount">' +
            '<div class="debt-value owed">' + formatCurrency(d.amount) + '</div>' +
            '<div class="debt-due">Jatuh tempo: ' + formatDate(d.dueDate) + '</div>' +
          '</div>' +
          '<div class="debt-actions">' +
            '<button class="btn btn-primary btn-sm" onclick="openPayModal(' + d.id + ', \'my\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>' +
              ' Bayar' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" onclick="deleteDebt(' + d.id + ', \'my\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>'
      ).join('');
    }
  }

  if (othersDebtsContainer) {
    if (dataStore.othersDebts.length === 0) {
      othersDebtsContainer.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><div>Belum ada piutang</div></div>';
    } else {
      othersDebtsContainer.innerHTML = dataStore.othersDebts.map(d => 
        '<div class="debt-item">' +
          '<div class="debt-avatar">' + d.name.split(' ').map(n => n[0]).join('') + '</div>' +
          '<div class="debt-info">' +
            '<div class="debt-name">' + d.name + '</div>' +
            '<div class="debt-meta">Sisa: ' + formatCurrency(d.amount - d.paid) + '</div>' +
          '</div>' +
          '<div class="debt-amount">' +
            '<div class="debt-value owes">' + formatCurrency(d.amount) + '</div>' +
            '<div class="debt-due">Jatuh tempo: ' + formatDate(d.dueDate) + '</div>' +
          '</div>' +
          '<div class="debt-actions">' +
            '<button class="btn btn-primary btn-sm" onclick="openPayModal(' + d.id + ', \'others\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>' +
              ' Terima' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" onclick="deleteDebt(' + d.id + ', \'others\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>'
      ).join('');
    }
  }
}

// ===== UPDATE DASHBOARD =====
function updateDashboard() {
  const income = dataStore.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = dataStore.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = dataStore.wallets.reduce((sum, w) => sum + w.balance, 0);

  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpenseEl = document.getElementById('totalExpense');
  const remainingBalanceEl = document.getElementById('remainingBalance');
  const netWorthValueEl = document.getElementById('netWorthValue');

  if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(income);
  if (totalExpenseEl) totalExpenseEl.textContent = formatCurrency(expense);
  if (remainingBalanceEl) remainingBalanceEl.textContent = formatCurrency(income - expense);
  if (netWorthValueEl) netWorthValueEl.textContent = formatCurrency(totalBalance);
}
