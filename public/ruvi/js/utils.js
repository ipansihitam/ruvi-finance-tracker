// ===== UTILITY FUNCTIONS =====
function formatCurrency(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function parseCurrency(str) {
  if (typeof str === 'number') return str;
  return parseInt(str.replace(/[^0-9]/g, '')) || 0;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function generateId() {
  return Date.now();
}

// ===== NAVIGATION =====
function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) item.classList.add('active');
  });

  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  
  const pageSection = document.getElementById('page-' + page);
  if (pageSection) {
    pageSection.classList.add('active');
  }

  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Selamat datang kembali, Andi!' },
    transactions: { title: 'Transaksi', subtitle: 'Kelola semua transaksi kamu' },
    wallets: { title: 'Dompet', subtitle: 'Kelola saldo di berbagai dompet' },
    budget: { title: 'Anggaran', subtitle: 'Atur anggaran dan tujuan keuangan' },
    debts: { title: 'Hutang & Piutang', subtitle: 'Catat dan kelola hutang kamu' },
    reports: { title: 'Laporan', subtitle: 'Analisis keuangan lengkap' },
    settings: { title: 'Pengaturan', subtitle: 'Sesuaikan preferensi aplikasi' }
  };

  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (pageTitle && titles[page]) {
    pageTitle.textContent = titles[page].title;
  }
  if (pageSubtitle && titles[page]) {
    pageSubtitle.textContent = titles[page].subtitle;
  }
  
  closeSidebar();
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

// ===== THEME TOGGLE =====
let isDarkMode = false;

function toggleTheme() {
  isDarkMode = !isDarkMode;
  const html = document.documentElement;
  const darkModeToggle = document.getElementById('darkModeToggle');
  const themeIcon = document.getElementById('themeIcon');

  if (isDarkMode) {
    html.setAttribute('data-theme', 'dark');
    if (darkModeToggle) darkModeToggle.classList.add('active');
    if (themeIcon) {
      themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    }
  } else {
    html.removeAttribute('data-theme');
    if (darkModeToggle) darkModeToggle.classList.remove('active');
    if (themeIcon) {
      themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }
}

// ===== ICON SVG HELPER =====
function getIconSVG(iconName) {
  const icons = {
    'briefcase': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>',
    'gift': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>',
    'utensils': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
    'car': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
    'shopping-cart': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>',
    'zap': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>',
    'film': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
    'pill': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.22 11.29l4.95-4.95c.78-.78 2.05-.78 2.83 0l4.95 4.95c.78.78.78 2.05 0 2.83l-4.95 4.95c-.78.78-2.05.78-2.83 0l-4.95-4.95c-.78-.78-.78-2.05 0-2.83zm11.6-2.12l-5.66-5.66c-1.56-1.56-4.09-1.56-5.66 0L2.32 6.87c-.39.39-.39 1.02 0 1.41l5.66 5.66 7.84-7.77zm3.9 5.66l-1.41-1.41-7.84 7.78 1.41 1.41c1.56 1.56 4.09 1.56 5.66 0l2.18-2.18c1.56-1.56 1.56-4.09 0-5.66z"/></svg>',
    'book': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
    'trending-up': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>',
    'package': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/></svg>',
    'repeat': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
    'dollar': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>',
    'pie-chart': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/></svg>',
    'coffee': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-6c0-1.1-.9-2-2-2zm0 8c0 2.76-2.24 5-5 5s-5-2.24-5-5V5h10v6zm-13-4h-2v9c0 1.1.9 2 2 2h2v-2h-2V7zm15 4h2v5h-2z"/></svg>'
  };
  return icons[iconName] || icons['package'];
}
