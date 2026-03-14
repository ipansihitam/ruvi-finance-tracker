// API helper functions for CRUD operations

async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'An error occurred')
  }
  
  return res.json()
}

// Wallet API
export const walletApi = {
  getAll: () => apiRequest<{ wallets: any[]; totalBalance: number }>('/api/wallets'),
  getById: (id: string) => apiRequest<{ wallet: any }>(`/api/wallets/${id}`),
  create: (data: any) => apiRequest<{ wallet: any; message: string }>('/api/wallets', 'POST', data),
  update: (id: string, data: any) => apiRequest<{ wallet: any; message: string }>(`/api/wallets/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<{ message: string }>(`/api/wallets/${id}`, 'DELETE'),
}

// Transaction API
export const transactionApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiRequest<{ transactions: any[]; pagination: any; summary: any }>(`/api/transactions${query}`)
  },
  getById: (id: string) => apiRequest<{ transaction: any }>(`/api/transactions/${id}`),
  create: (data: any) => apiRequest<{ transaction: any; message: string }>('/api/transactions', 'POST', data),
  update: (id: string, data: any) => apiRequest<{ transaction: any; message: string }>(`/api/transactions/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<{ message: string }>(`/api/transactions/${id}`, 'DELETE'),
}

// Category API
export const categoryApi = {
  getAll: (type?: string) => {
    const query = type ? `?type=${type}` : ''
    return apiRequest<{ categories: any[]; grouped: any }>(`/api/categories${query}`)
  },
  create: (data: any) => apiRequest<{ category: any; message: string }>('/api/categories', 'POST', data),
  update: (id: string, data: any) => apiRequest<{ category: any; message: string }>(`/api/categories/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<{ message: string }>(`/api/categories/${id}`, 'DELETE'),
}

// Budget API
export const budgetApi = {
  getAll: (isActive?: boolean) => {
    const query = isActive !== undefined ? `?isActive=${isActive}` : ''
    return apiRequest<{ budgets: any[] }>(`/api/budgets${query}`)
  },
  create: (data: any) => apiRequest<{ budget: any; message: string }>('/api/budgets', 'POST', data),
  update: (id: string, data: any) => apiRequest<{ budget: any; message: string }>(`/api/budgets/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<{ message: string }>(`/api/budgets/${id}`, 'DELETE'),
}

// Goal API
export const goalApi = {
  getAll: (isCompleted?: boolean) => {
    const query = isCompleted !== undefined ? `?isCompleted=${isCompleted}` : ''
    return apiRequest<{ goals: any[] }>(`/api/goals${query}`)
  },
  create: (data: any) => apiRequest<{ goal: any; message: string }>('/api/goals', 'POST', data),
  update: (id: string, data: any) => apiRequest<{ goal: any; message: string }>(`/api/goals/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<{ message: string }>(`/api/goals/${id}`, 'DELETE'),
}

// Debt API
export const debtApi = {
  getAll: (type?: string, isPaid?: boolean) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (isPaid !== undefined) params.set('isPaid', isPaid.toString())
    const query = params.toString()
    return apiRequest<{ debts: any[]; grouped: any; summary: any }>(`/api/debts${query ? `?${query}` : ''}`)
  },
  create: (data: any) => apiRequest<{ debt: any; message: string }>('/api/debts', 'POST', data),
  update: (id: string, data: any) => apiRequest<{ debt: any; message: string }>(`/api/debts/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<{ message: string }>(`/api/debts/${id}`, 'DELETE'),
}

// Settings API
export const settingsApi = {
  get: () => apiRequest<{ settings: any }>('/api/settings'),
  update: (data: any) => apiRequest<{ settings: any; message: string }>('/api/settings', 'PUT', data),
}

// User API
export const userApi = {
  get: () => apiRequest<{ user: any; stats: any }>('/api/user'),
  update: (data: any) => apiRequest<{ user: any; message: string }>('/api/user', 'PUT', data),
  delete: () => apiRequest<{ message: string }>('/api/user', 'DELETE'),
}
