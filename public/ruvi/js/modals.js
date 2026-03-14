// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// ===== TRANSACTION MODAL =====
function openTransactionModal(editId = null) {
  const title = document.getElementById('transactionModalTitle');
  
  // Populate wallet dropdown
  const walletSelect = document.getElementById('transactionWallet');
  walletSelect.innerHTML = '<option value="">Pilih dompet</option>';
  dataStore.wallets.forEach(w => {
    walletSelect.innerHTML += '<option value="' + w.name + '">' + w.name + '</option>';
  });

  if (editId) {
    const transaction = dataStore.transactions.find(t => t.id === editId);
    if (transaction) {
      title.textContent = 'Edit Transaksi';
      document.getElementById('editTransactionId').value = editId;
      document.getElementById('transactionAmount').value = transaction.amount;
      document.getElementById('transactionName').value = transaction.name;
      document.getElementById('transactionCategory').value = transaction.category;
      document.getElementById('transactionWallet').value = transaction.wallet;
      document.getElementById('transactionDate').value = transaction.date;
      
      currentTransactionType = transaction.type;
      document.querySelectorAll('.type-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.type === transaction.type) opt.classList.add('active');
      });
    }
  } else {
    title.textContent = 'Tambah Transaksi';
    document.getElementById('transactionForm').reset();
    document.getElementById('editTransactionId').value = '';
    document.getElementById('transactionDate').valueAsDate = new Date();
    currentTransactionType = 'income';
    document.querySelectorAll('.type-option').forEach(opt => {
      opt.classList.remove('active');
      if (opt.dataset.type === 'income') opt.classList.add('active');
    });
  }
  
  openModal('transactionModal');
}

function saveTransaction() {
  const editId = document.getElementById('editTransactionId').value;
  const amount = parseCurrency(document.getElementById('transactionAmount').value);
  const name = document.getElementById('transactionName').value;
  const category = document.getElementById('transactionCategory').value;
  const wallet = document.getElementById('transactionWallet').value;
  const date = document.getElementById('transactionDate').value;

  if (!amount || !name || !category || !wallet || !date) {
    showToast('Mohon lengkapi semua field!', 'error');
    return;
  }

  const icons = {
    'Gaji': 'briefcase', 'Bonus': 'gift', 'Makanan': 'utensils', 'Transportasi': 'car',
    'Belanja': 'shopping-cart', 'Tagihan': 'zap', 'Hiburan': 'film', 'Kesehatan': 'pill',
    'Pendidikan': 'book', 'Investasi': 'trending-up', 'Lainnya': 'package'
  };

  if (editId) {
    const idx = dataStore.transactions.findIndex(t => t.id === parseInt(editId));
    if (idx !== -1) {
      dataStore.transactions[idx] = {
        ...dataStore.transactions[idx],
        name, category, wallet, date, amount, type: currentTransactionType,
        icon: icons[category] || 'package'
      };
    }
    showToast('Transaksi berhasil diperbarui!', 'success');
  } else {
    dataStore.transactions.unshift({
      id: generateId(),
      name, category, wallet, date, amount, type: currentTransactionType,
      icon: icons[category] || 'package'
    });
    showToast('Transaksi berhasil ditambahkan!', 'success');
  }

  closeModal('transactionModal');
  updateDashboard();
  renderAll();
  refreshCharts();
}

function deleteTransaction(id) {
  if (confirm('Yakin ingin menghapus transaksi ini?')) {
    dataStore.transactions = dataStore.transactions.filter(t => t.id !== id);
    showToast('Transaksi berhasil dihapus!', 'success');
    renderAll();
    refreshCharts();
  }
}

// ===== WALLET MODAL =====
function openWalletModal(editId = null) {
  const title = document.getElementById('walletModalTitle');
  
  if (editId) {
    const wallet = dataStore.wallets.find(w => w.id === editId);
    if (wallet) {
      title.textContent = 'Edit Dompet';
      document.getElementById('editWalletId').value = editId;
      document.getElementById('walletName').value = wallet.name;
      document.getElementById('walletType').value = wallet.type;
      document.getElementById('walletBalance').value = wallet.balance;
      document.getElementById('walletNumber').value = wallet.number === '-' ? '' : wallet.number;
    }
  } else {
    title.textContent = 'Tambah Dompet';
    document.getElementById('walletForm').reset();
    document.getElementById('editWalletId').value = '';
  }
  
  openModal('walletModal');
}

function saveWallet() {
  const editId = document.getElementById('editWalletId').value;
  const name = document.getElementById('walletName').value;
  const type = document.getElementById('walletType').value;
  const balance = parseCurrency(document.getElementById('walletBalance').value);
  const number = document.getElementById('walletNumber').value || '-';

  if (!name || !type) {
    showToast('Mohon lengkapi nama dan jenis dompet!', 'error');
    return;
  }

  const classes = { 'BCA': 'bca', 'Mandiri': 'mandiri', 'GoPay': 'gopay', 'OVO': 'ovo', 'DANA': 'dana' };

  if (editId) {
    const idx = dataStore.wallets.findIndex(w => w.id === parseInt(editId));
    if (idx !== -1) {
      dataStore.wallets[idx] = {
        ...dataStore.wallets[idx],
        name, type, balance, number,
        class: classes[name] || 'cash'
      };
    }
    showToast('Dompet berhasil diperbarui!', 'success');
  } else {
    dataStore.wallets.push({
      id: generateId(),
      name, type, balance, number,
      class: classes[name] || 'cash'
    });
    showToast('Dompet berhasil ditambahkan!', 'success');
  }

  closeModal('walletModal');
  renderWallets();
  updateDashboard();
}

function deleteWallet(id) {
  if (confirm('Yakin ingin menghapus dompet ini?')) {
    dataStore.wallets = dataStore.wallets.filter(w => w.id !== id);
    showToast('Dompet berhasil dihapus!', 'success');
    renderWallets();
    updateDashboard();
  }
}

// ===== TRANSFER MODAL =====
function openTransferModal(walletId) {
  const wallet = dataStore.wallets.find(w => w.id === walletId);
  if (wallet) {
    document.getElementById('transferFrom').value = walletId;
    document.getElementById('transferFromName').value = wallet.name + ' - ' + formatCurrency(wallet.balance);
    
    const toSelect = document.getElementById('transferTo');
    toSelect.innerHTML = '<option value="">Pilih dompet tujuan</option>';
    dataStore.wallets.filter(w => w.id !== walletId).forEach(w => {
      toSelect.innerHTML += '<option value="' + w.id + '">' + w.name + '</option>';
    });
    
    document.getElementById('transferAmount').value = '';
    openModal('transferModal');
  }
}

function processTransfer() {
  const fromId = parseInt(document.getElementById('transferFrom').value);
  const toId = parseInt(document.getElementById('transferTo').value);
  const amount = parseCurrency(document.getElementById('transferAmount').value);

  if (!toId || !amount) {
    showToast('Mohon lengkapi semua field!', 'error');
    return;
  }

  const fromWallet = dataStore.wallets.find(w => w.id === fromId);
  const toWallet = dataStore.wallets.find(w => w.id === toId);

  if (fromWallet.balance < amount) {
    showToast('Saldo tidak mencukupi!', 'error');
    return;
  }

  fromWallet.balance -= amount;
  toWallet.balance += amount;

  dataStore.transactions.unshift({
    id: generateId(),
    name: 'Transfer ke ' + toWallet.name,
    category: 'Transfer',
    wallet: fromWallet.name,
    type: 'transfer',
    amount: amount,
    date: new Date().toISOString().split('T')[0],
    icon: 'repeat'
  });

  showToast('Transfer berhasil!', 'success');
  closeModal('transferModal');
  renderWallets();
  updateDashboard();
  renderAll();
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

// ===== BUDGET MODAL =====
function openBudgetModal(editId = null) {
  const title = document.getElementById('budgetModalTitle');
  
  if (editId) {
    const budget = dataStore.budgets.find(b => b.id === editId);
    if (budget) {
      title.textContent = 'Edit Anggaran';
      document.getElementById('editBudgetId').value = editId;
      document.getElementById('budgetName').value = budget.name;
      document.getElementById('budgetIcon').value = budget.icon;
      document.getElementById('budgetLimit').value = budget.limit;
      document.getElementById('budgetSpent').value = budget.spent;
    }
  } else {
    title.textContent = 'Tambah Anggaran';
    document.getElementById('budgetForm').reset();
    document.getElementById('editBudgetId').value = '';
  }
  
  openModal('budgetModal');
}

function saveBudget() {
  const editId = document.getElementById('editBudgetId').value;
  const name = document.getElementById('budgetName').value;
  const icon = document.getElementById('budgetIcon').value || 'pie-chart';
  const limit = parseCurrency(document.getElementById('budgetLimit').value);
  const spent = parseCurrency(document.getElementById('budgetSpent').value) || 0;

  if (!name || !limit) {
    showToast('Mohon lengkapi nama dan batas anggaran!', 'error');
    return;
  }

  if (editId) {
    const idx = dataStore.budgets.findIndex(b => b.id === parseInt(editId));
    if (idx !== -1) {
      dataStore.budgets[idx] = { ...dataStore.budgets[idx], name, icon, limit, spent };
    }
    showToast('Anggaran berhasil diperbarui!', 'success');
  } else {
    dataStore.budgets.push({ id: generateId(), name, icon, limit, spent });
    showToast('Anggaran berhasil ditambahkan!', 'success');
  }

  closeModal('budgetModal');
  renderBudgets();
  refreshCharts();
}

function deleteBudget(id) {
  if (confirm('Yakin ingin menghapus anggaran ini?')) {
    dataStore.budgets = dataStore.budgets.filter(b => b.id !== id);
    showToast('Anggaran berhasil dihapus!', 'success');
    renderBudgets();
    refreshCharts();
  }
}

function addBudgetSpent(budgetId) {
  const budget = dataStore.budgets.find(b => b.id === budgetId);
  const amount = prompt('Masukkan jumlah pengeluaran untuk ' + budget.name + ':');
  if (amount) {
    const parsed = parseCurrency(amount);
    budget.spent += parsed;
    showToast('Pengeluaran ditambahkan ke anggaran!', 'success');
    renderBudgets();
    refreshCharts();
  }
}

// ===== DEBT MODAL =====
function openDebtModal(type) {
  const title = document.getElementById('debtModalTitle');
  title.textContent = type === 'my' ? 'Tambah Hutang' : 'Tambah Piutang';
  document.getElementById('debtForm').reset();
  document.getElementById('editDebtId').value = '';
  document.getElementById('debtType').value = type;
  openModal('debtModal');
}

function saveDebt() {
  const type = document.getElementById('debtType').value;
  const name = document.getElementById('debtName').value;
  const amount = parseCurrency(document.getElementById('debtAmount').value);
  const dueDate = document.getElementById('debtDueDate').value;
  const paid = parseCurrency(document.getElementById('debtPaid').value) || 0;

  if (!name || !amount || !dueDate) {
    showToast('Mohon lengkapi semua field!', 'error');
    return;
  }

  const debt = { id: generateId(), name, amount, dueDate, paid };
  
  if (type === 'my') {
    dataStore.myDebts.push(debt);
    showToast('Hutang berhasil ditambahkan!', 'success');
  } else {
    dataStore.othersDebts.push(debt);
    showToast('Piutang berhasil ditambahkan!', 'success');
  }

  closeModal('debtModal');
  renderDebts();
  refreshCharts();
}

function deleteDebt(id, type) {
  if (confirm('Yakin ingin menghapus ini?')) {
    if (type === 'my') {
      dataStore.myDebts = dataStore.myDebts.filter(d => d.id !== id);
    } else {
      dataStore.othersDebts = dataStore.othersDebts.filter(d => d.id !== id);
    }
    showToast('Berhasil dihapus!', 'success');
    renderDebts();
    refreshCharts();
  }
}

// ===== PAY MODAL =====
let currentPayDebtId = null;
let currentPayDebtType = null;
let currentPayDebtRemaining = 0;

function openPayModal(debtId, type) {
  const debts = type === 'my' ? dataStore.myDebts : dataStore.othersDebts;
  const debt = debts.find(d => d.id === debtId);
  
  if (debt) {
    currentPayDebtId = debtId;
    currentPayDebtType = type;
    currentPayDebtRemaining = debt.amount - debt.paid;
    
    document.getElementById('payDebtId').value = debtId;
    document.getElementById('payDebtType').value = type;
    document.getElementById('payRemaining').value = formatCurrency(currentPayDebtRemaining);
    document.getElementById('payAmount').value = '';
    document.getElementById('payNewRemaining').value = formatCurrency(currentPayDebtRemaining);
    document.getElementById('payModalTitle').textContent = type === 'my' ? 'Bayar Hutang' : 'Terima Pembayaran';
    
    // Add input listener for real-time update
    const payAmountInput = document.getElementById('payAmount');
    payAmountInput.oninput = function() {
      const payAmount = parseCurrency(this.value) || 0;
      const newRemaining = currentPayDebtRemaining - payAmount;
      document.getElementById('payNewRemaining').value = formatCurrency(Math.max(0, newRemaining));
    };
    
    openModal('payModal');
  }
}

function processPayment() {
  const debtId = currentPayDebtId;
  const type = currentPayDebtType;
  const payAmount = parseCurrency(document.getElementById('payAmount').value);

  if (!payAmount || payAmount <= 0) {
    showToast('Masukkan jumlah pembayaran yang valid!', 'error');
    return;
  }

  if (payAmount > currentPayDebtRemaining) {
    showToast('Jumlah melebihi sisa hutang!', 'error');
    return;
  }

  const debts = type === 'my' ? dataStore.myDebts : dataStore.othersDebts;
  const idx = debts.findIndex(d => d.id === debtId);

  if (idx !== -1) {
    debts[idx].paid += payAmount;
    
    if (debts[idx].paid >= debts[idx].amount) {
      debts.splice(idx, 1);
      showToast('Hutang lunas!', 'success');
    } else {
      showToast('Pembayaran berhasil!', 'success');
    }
  }

  closeModal('payModal');
  renderDebts();
  refreshCharts();
}

// ===== NOTIFICATION MODAL =====
function openNotificationModal() {
  openModal('notificationModal');
}

// ===== RENDER MODALS HTML =====
function renderModalsHTML() {
  const container = document.getElementById('modals-container');
  container.innerHTML = `
    <!-- Transaction Modal -->
    <div class="modal-overlay" id="transactionModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="transactionModalTitle">Tambah Transaksi</h3>
          <button class="modal-close" onclick="closeModal('transactionModal')">✕</button>
        </div>
        <div class="modal-body">
          <form id="transactionForm">
            <input type="hidden" id="editTransactionId">
            <div class="form-group">
              <label class="form-label">Jenis Transaksi</label>
              <div class="type-selector">
                <div class="type-option income active" data-type="income">Pemasukan</div>
                <div class="type-option expense" data-type="expense">Pengeluaran</div>
                <div class="type-option transfer" data-type="transfer">Transfer</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Nominal (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan nominal" id="transactionAmount">
            </div>
            <div class="form-group">
              <label class="form-label">Deskripsi</label>
              <input type="text" class="form-input" placeholder="Contoh: Gaji Bulanan" id="transactionName">
            </div>
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <select class="form-select" id="transactionCategory">
                <option value="">Pilih kategori</option>
                <option value="Gaji">Gaji</option>
                <option value="Bonus">Bonus</option>
                <option value="Makanan">Makanan</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Belanja">Belanja</option>
                <option value="Tagihan">Tagihan</option>
                <option value="Hiburan">Hiburan</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Investasi">Investasi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Dompet</label>
              <select class="form-select" id="transactionWallet">
                <option value="">Pilih dompet</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal</label>
              <input type="date" class="form-input" id="transactionDate">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('transactionModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveTransaction()">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Wallet Modal -->
    <div class="modal-overlay" id="walletModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="walletModalTitle">Tambah Dompet</h3>
          <button class="modal-close" onclick="closeModal('walletModal')">✕</button>
        </div>
        <div class="modal-body">
          <form id="walletForm">
            <input type="hidden" id="editWalletId">
            <div class="form-group">
              <label class="form-label">Nama Dompet</label>
              <input type="text" class="form-input" placeholder="Contoh: BCA, GoPay" id="walletName">
            </div>
            <div class="form-group">
              <label class="form-label">Jenis Dompet</label>
              <select class="form-select" id="walletType">
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Tunai">Tunai</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Saldo Awal (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan saldo awal" id="walletBalance">
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Rekening (Opsional)</label>
              <input type="text" class="form-input" placeholder="Masukkan nomor rekening" id="walletNumber">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('walletModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveWallet()">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Budget Modal -->
    <div class="modal-overlay" id="budgetModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="budgetModalTitle">Tambah Anggaran</h3>
          <button class="modal-close" onclick="closeModal('budgetModal')">✕</button>
        </div>
        <div class="modal-body">
          <form id="budgetForm">
            <input type="hidden" id="editBudgetId">
            <div class="form-group">
              <label class="form-label">Nama Kategori</label>
              <input type="text" class="form-input" placeholder="Contoh: Makanan & Minuman" id="budgetName">
            </div>
            <div class="form-group">
              <label class="form-label">Icon</label>
              <select class="form-select" id="budgetIcon">
                <option value="utensils">Makanan</option>
                <option value="car">Transportasi</option>
                <option value="shopping-cart">Belanja</option>
                <option value="film">Hiburan</option>
                <option value="zap">Tagihan</option>
                <option value="pill">Kesehatan</option>
                <option value="book">Pendidikan</option>
                <option value="trending-up">Investasi</option>
                <option value="pie-chart">Lainnya</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Batas Anggaran (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan batas anggaran" id="budgetLimit">
            </div>
            <div class="form-group">
              <label class="form-label">Sudah Terpakai (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan nominal terpakai" id="budgetSpent">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('budgetModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveBudget()">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Debt Modal -->
    <div class="modal-overlay" id="debtModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="debtModalTitle">Tambah Hutang</h3>
          <button class="modal-close" onclick="closeModal('debtModal')">✕</button>
        </div>
        <div class="modal-body">
          <form id="debtForm">
            <input type="hidden" id="editDebtId">
            <input type="hidden" id="debtType">
            <div class="form-group">
              <label class="form-label">Nama</label>
              <input type="text" class="form-input" placeholder="Nama pemberi/penerima hutang" id="debtName">
            </div>
            <div class="form-group">
              <label class="form-label">Jumlah (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan jumlah" id="debtAmount">
            </div>
            <div class="form-group">
              <label class="form-label">Jatuh Tempo</label>
              <input type="date" class="form-input" id="debtDueDate">
            </div>
            <div class="form-group">
              <label class="form-label">Sudah Dibayar (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan nominal yang sudah dibayar" id="debtPaid">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('debtModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveDebt()">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Pay Modal -->
    <div class="modal-overlay" id="payModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="payModalTitle">Bayar Hutang</h3>
          <button class="modal-close" onclick="closeModal('payModal')">✕</button>
        </div>
        <div class="modal-body">
          <form id="payForm">
            <input type="hidden" id="payDebtId">
            <input type="hidden" id="payDebtType">
            <div class="form-group">
              <label class="form-label">Sisa Hutang Saat Ini</label>
              <input type="text" class="form-input" id="payRemaining" readonly style="background: var(--bg-tertiary); font-weight: 700; color: var(--expense-red);">
            </div>
            <div class="form-group">
              <label class="form-label">Jumlah Bayar (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan jumlah bayar" id="payAmount">
            </div>
            <div class="form-group">
              <label class="form-label">Sisa Hutang Setelah Bayar</label>
              <input type="text" class="form-input" id="payNewRemaining" readonly style="background: var(--bg-tertiary); font-weight: 700; color: var(--income-green);">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('payModal')">Batal</button>
          <button class="btn btn-primary" onclick="processPayment()">Bayar</button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div class="modal-overlay" id="transferModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Transfer Antar Dompet</h3>
          <button class="modal-close" onclick="closeModal('transferModal')">✕</button>
        </div>
        <div class="modal-body">
          <form id="transferForm">
            <input type="hidden" id="transferFrom">
            <div class="form-group">
              <label class="form-label">Dari Dompet</label>
              <input type="text" class="form-input" id="transferFromName" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Ke Dompet</label>
              <select class="form-select" id="transferTo"></select>
            </div>
            <div class="form-group">
              <label class="form-label">Jumlah (Rp)</label>
              <input type="text" class="form-input" placeholder="Masukkan jumlah transfer" id="transferAmount">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('transferModal')">Batal</button>
          <button class="btn btn-primary" onclick="processTransfer()">Transfer</button>
        </div>
      </div>
    </div>

    <!-- Notification Modal -->
    <div class="modal-overlay" id="notificationModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Notifikasi</h3>
          <button class="modal-close" onclick="closeModal('notificationModal')">✕</button>
        </div>
        <div class="modal-body" style="padding: 0;">
          <div class="notification-list">
            <div class="notification-item unread">
              <div class="notification-icon income">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
              </div>
              <div class="notification-content">
                <div class="notification-title">Gaji Bulanan Diterima</div>
                <div class="notification-desc">Pemasukan sebesar Rp 10.000.000 telah diterima</div>
                <div class="notification-time">2 jam yang lalu</div>
              </div>
            </div>
            <div class="notification-item unread">
              <div class="notification-icon warning">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              </div>
              <div class="notification-content">
                <div class="notification-title">Anggaran Hampir Habis</div>
                <div class="notification-desc">Anggaran Makanan & Minuman sudah 85% terpakai</div>
                <div class="notification-time">5 jam yang lalu</div>
              </div>
            </div>
            <div class="notification-item">
              <div class="notification-icon info">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <div class="notification-content">
                <div class="notification-title">Jatuh Tempo Hutang</div>
                <div class="notification-desc">Hutang ke Budi Santoso jatuh tempo dalam 7 hari</div>
                <div class="notification-time">1 hari yang lalu</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
