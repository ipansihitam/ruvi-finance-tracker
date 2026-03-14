// ===== CHARTS =====
function initCharts() {
  try {
    initIncomeExpenseChart();
    initExpenseDistributionChart();
    initCategoryComparisonChart();
    initBudgetVsActualChart();
    initDebtChart();
    initGoalsChart();
  } catch (e) {
    console.error('Error initializing charts:', e);
  }
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

function initIncomeExpenseChart() {
  const ctx = document.getElementById('incomeExpenseChart');
  if (!ctx) return;
  
  const labels = [];
  const incomeData = [];
  const expenseData = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.getDate().toString());
    incomeData.push(Math.floor(Math.random() * 500000) + 100000);
    expenseData.push(Math.floor(Math.random() * 400000) + 50000);
  }

  charts.incomeExpense = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          borderColor: '#F43F5E',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 20, font: { family: 'Plus Jakarta Sans', size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            callback: function(v) { return 'Rp ' + (v / 1000) + 'K'; }, 
            font: { family: 'Plus Jakarta Sans', size: 11 } 
          },
          grid: { color: 'rgba(139, 92, 246, 0.08)' }
        },
        x: { 
          ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }, 
          grid: { display: false } 
        }
      }
    }
  });
}

function initExpenseDistributionChart() {
  const ctx = document.getElementById('expenseDistributionChart');
  if (!ctx) return;
  
  charts.expenseDist = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'],
      datasets: [{
        data: [2850, 1200, 1850, 650, 1250, 950],
        backgroundColor: ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F43F5E', '#6B7280'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 12, font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      }
    }
  });
}

function initCategoryComparisonChart() {
  const ctx = document.getElementById('categoryComparisonChart');
  if (!ctx) return;
  
  charts.categoryComp = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      datasets: [
        { label: 'Makanan', data: [2800, 3100, 2500, 2900, 3200, 2850], backgroundColor: '#10B981' },
        { label: 'Transportasi', data: [1500, 1200, 1800, 1400, 1100, 1200], backgroundColor: '#F59E0B' },
        { label: 'Belanja', data: [2000, 1800, 2200, 1900, 2100, 1850], backgroundColor: '#8B5CF6' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 20, font: { family: 'Plus Jakarta Sans', size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            callback: function(v) { return 'Rp ' + v + 'K'; }, 
            font: { family: 'Plus Jakarta Sans', size: 11 } 
          },
          grid: { color: 'rgba(139, 92, 246, 0.08)' }
        },
        x: { 
          ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }, 
          grid: { display: false } 
        }
      }
    }
  });
}

function initBudgetVsActualChart() {
  const ctx = document.getElementById('budgetVsActualChart');
  if (!ctx) return;
  
  const budgetData = dataStore.budgets || [];
  
  charts.budgetActual = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: budgetData.map(b => b.name.split(' ')[0]),
      datasets: [
        { 
          label: 'Anggaran', 
          data: budgetData.map(b => b.limit / 1000), 
          backgroundColor: 'rgba(139, 92, 246, 0.5)', 
          borderColor: '#8B5CF6', 
          borderWidth: 2 
        },
        { 
          label: 'Terpakai', 
          data: budgetData.map(b => b.spent / 1000), 
          backgroundColor: 'rgba(236, 72, 153, 0.5)', 
          borderColor: '#EC4899', 
          borderWidth: 2 
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 20, font: { family: 'Plus Jakarta Sans', size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            callback: function(v) { return 'Rp ' + v + 'K'; }, 
            font: { family: 'Plus Jakarta Sans', size: 11 } 
          },
          grid: { color: 'rgba(139, 92, 246, 0.08)' }
        },
        x: { 
          ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }, 
          grid: { display: false } 
        }
      }
    }
  });
}

function initDebtChart() {
  const ctx = document.getElementById('debtChart');
  if (!ctx) return;
  
  const myDebts = dataStore.myDebts || [];
  const othersDebts = dataStore.othersDebts || [];
  
  charts.debt = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Hutang Saya', 'Piutang Orang'],
      datasets: [
        { 
          label: 'Total', 
          data: [
            myDebts.reduce((s, d) => s + d.amount, 0) / 1000000,
            othersDebts.reduce((s, d) => s + d.amount, 0) / 1000000
          ], 
          backgroundColor: '#F43F5E' 
        },
        { 
          label: 'Sudah Bayar', 
          data: [
            myDebts.reduce((s, d) => s + d.paid, 0) / 1000000,
            othersDebts.reduce((s, d) => s + d.paid, 0) / 1000000
          ], 
          backgroundColor: '#10B981' 
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 20, font: { family: 'Plus Jakarta Sans', size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            callback: function(v) { return 'Rp ' + v + 'jt'; }, 
            font: { family: 'Plus Jakarta Sans', size: 11 } 
          },
          grid: { color: 'rgba(139, 92, 246, 0.08)' }
        },
        x: { 
          ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }, 
          grid: { display: false } 
        }
      }
    }
  });
}

function initGoalsChart() {
  const ctx = document.getElementById('goalsChart');
  if (!ctx) return;
  
  const goalsData = dataStore.goals || [];
  
  charts.goals = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: goalsData.map(g => g.name.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        label: 'Progress (%)',
        data: goalsData.map(g => Math.round((g.current / g.target) * 100)),
        backgroundColor: ['rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)', 'rgba(16, 185, 129, 0.7)'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const goal = goalsData[ctx.dataIndex];
              if (goal) {
                return goal.current.toLocaleString('id-ID') + ' / ' + goal.target.toLocaleString('id-ID');
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { 
            callback: function(v) { return v + '%'; }, 
            font: { family: 'Plus Jakarta Sans', size: 11 } 
          },
          grid: { color: 'rgba(139, 92, 246, 0.08)' }
        },
        y: { 
          ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }, 
          grid: { display: false } 
        }
      }
    }
  });
}
