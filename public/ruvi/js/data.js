// ===== DATA STORE =====
const dataStore = {
  transactions: [
    { id: 1, name: 'Gaji Bulanan', category: 'Gaji', wallet: 'BCA', type: 'income', amount: 10000000, date: '2024-06-15', icon: 'briefcase' },
    { id: 2, name: 'Belanja Groceries', category: 'Belanja', wallet: 'GoPay', type: 'expense', amount: 850000, date: '2024-06-14', icon: 'shopping-cart' },
    { id: 3, name: 'Makan Siang', category: 'Makanan', wallet: 'OVO', type: 'expense', amount: 125000, date: '2024-06-14', icon: 'utensils' },
    { id: 4, name: 'Transport Gojek', category: 'Transportasi', wallet: 'GoPay', type: 'expense', amount: 75000, date: '2024-06-13', icon: 'car' },
    { id: 5, name: 'Freelance Project', category: 'Bonus', wallet: 'Mandiri', type: 'income', amount: 2500000, date: '2024-06-12', icon: 'gift' },
    { id: 6, name: 'Tagihan Listrik', category: 'Tagihan', wallet: 'BCA', type: 'expense', amount: 450000, date: '2024-06-10', icon: 'zap' },
    { id: 7, name: 'Nonton Bioskop', category: 'Hiburan', wallet: 'Tunai', type: 'expense', amount: 150000, date: '2024-06-09', icon: 'film' },
    { id: 8, name: 'Beli Buku', category: 'Pendidikan', wallet: 'Tunai', type: 'expense', amount: 350000, date: '2024-06-08', icon: 'book' },
    { id: 9, name: 'Investasi Reksadana', category: 'Investasi', wallet: 'BCA', type: 'expense', amount: 1000000, date: '2024-06-07', icon: 'trending-up' },
    { id: 10, name: 'Obat-obatan', category: 'Kesehatan', wallet: 'Tunai', type: 'expense', amount: 280000, date: '2024-06-06', icon: 'pill' },
    { id: 11, name: 'Kopi Starbucks', category: 'Makanan', wallet: 'GoPay', type: 'expense', amount: 85000, date: '2024-06-05', icon: 'coffee' },
    { id: 12, name: 'Transfer ke OVO', category: 'Transfer', wallet: 'BCA', type: 'transfer', amount: 500000, date: '2024-06-04', icon: 'repeat' }
  ],
  wallets: [
    { id: 1, name: 'BCA', type: 'Bank', balance: 28500000, number: '**** 4521', class: 'bca' },
    { id: 2, name: 'Mandiri', type: 'Bank', balance: 12350000, number: '**** 7892', class: 'mandiri' },
    { id: 3, name: 'GoPay', type: 'E-Wallet', balance: 1250000, number: '+62812****5678', class: 'gopay' },
    { id: 4, name: 'OVO', type: 'E-Wallet', balance: 750000, number: '+62812****9012', class: 'ovo' },
    { id: 5, name: 'DANA', type: 'E-Wallet', balance: 500000, number: '+62812****3456', class: 'dana' },
    { id: 6, name: 'Tunai', type: 'Tunai', balance: 2500000, number: '-', class: 'cash' }
  ],
  budgets: [
    { id: 1, name: 'Makanan & Minuman', icon: 'utensils', spent: 2850000, limit: 4000000 },
    { id: 2, name: 'Transportasi', icon: 'car', spent: 1200000, limit: 1500000 },
    { id: 3, name: 'Belanja', icon: 'shopping-cart', spent: 1850000, limit: 2000000 },
    { id: 4, name: 'Hiburan', icon: 'film', spent: 650000, limit: 1000000 },
    { id: 5, name: 'Tagihan', icon: 'zap', spent: 1250000, limit: 1500000 },
    { id: 6, name: 'Kesehatan', icon: 'pill', spent: 480000, limit: 500000 }
  ],
  goals: [
    { id: 1, name: 'Beli Laptop Baru', target: 15000000, current: 9500000 },
    { id: 2, name: 'Liburan ke Bali', target: 8000000, current: 3200000 },
    { id: 3, name: 'Dana Darurat', target: 50000000, current: 35500000 }
  ],
  myDebts: [
    { id: 1, name: 'Budi Santoso', amount: 5000000, dueDate: '2024-07-15', paid: 2000000 },
    { id: 2, name: 'Siti Rahma', amount: 2500000, dueDate: '2024-08-01', paid: 0 }
  ],
  othersDebts: [
    { id: 1, name: 'Ahmad Fadli', amount: 3000000, dueDate: '2024-07-20', paid: 1000000 },
    { id: 2, name: 'Dewi Lestari', amount: 1500000, dueDate: '2024-07-10', paid: 0 },
    { id: 3, name: 'Rudi Hermawan', amount: 2000000, dueDate: '2024-08-05', paid: 500000 }
  ]
};

let currentTransactionType = 'income';
let charts = {};
