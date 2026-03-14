// ===== APP INITIALIZATION =====
function initApp() {
  // Render modals HTML first
  renderModalsHTML();
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleTheme);
  }

  // Notification button
  const notificationBtn = document.getElementById('notificationBtn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      openModal('notificationModal');
    });
  }

  // Transaction type selector
  document.querySelectorAll('.type-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.type-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      currentTransactionType = option.dataset.type;
    });
  });

  // Debt tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabContent = document.getElementById('tab-' + btn.dataset.tab);
      if (tabContent) tabContent.classList.add('active');
    });
  });

  // Search transaction
  const searchInput = document.getElementById('searchTransaction');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderTransactionTable(e.target.value);
    });
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Close modals on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });

  // Initialize everything
  renderAll();
  updateDashboard();
  
  // Initialize charts after a short delay to ensure DOM is ready
  setTimeout(() => {
    initCharts();
  }, 100);
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// ===== HELPER FUNCTIONS =====
function openNotificationModal() {
  openModal('notificationModal');
}

function refreshCharts() {
  // Destroy existing charts
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
    }
  });
  charts = {};
  
  // Reinitialize charts
  setTimeout(() => {
    initCharts();
  }, 50);
}
