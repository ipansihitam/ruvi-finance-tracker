import { create } from 'zustand'

// Types
export interface Wallet {
  id: string
  name: string
  type: string
  balance: number
  number?: string
  color?: string
  icon?: string
  isDefault: boolean
  _count?: { transactions: number }
}

export interface Category {
  id: string
  name: string
  type: string
  icon?: string
  color?: string
  budget?: number
  _count?: { transactions: number }
}

export interface Transaction {
  id: string
  walletId: string
  categoryId?: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description?: string
  date: Date
  notes?: string
  tags?: string
  wallet?: { id: string; name: string; icon?: string; color?: string }
  category?: { id: string; name: string; icon?: string; color?: string }
}

export interface Budget {
  id: string
  name: string
  categoryId?: string
  amount: number
  spent: number
  period: string
  isActive: boolean
  category?: { id: string; name: string; icon?: string; color?: string }
  percentage?: number
  remaining?: number
  status?: 'exceeded' | 'warning' | 'safe'
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: Date
  category?: string
  priority?: string
  isCompleted: boolean
  progress?: number
  remaining?: number
}

export interface Debt {
  id: string
  name: string
  type: 'my_debt' | 'others_debt'
  totalAmount: number
  paidAmount: number
  interestRate?: number
  dueDate?: Date
  description?: string
  contact?: string
  isPaid: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  isRead: boolean
  createdAt: Date
}

// Store State
interface RuviState {
  // Data
  wallets: Wallet[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  debts: Debt[]
  notifications: Notification[]
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Actions
  setWallets: (wallets: Wallet[]) => void
  setCategories: (categories: Category[]) => void
  setTransactions: (transactions: Transaction[]) => void
  setBudgets: (budgets: Budget[]) => void
  setGoals: (goals: Goal[]) => void
  setDebts: (debts: Debt[]) => void
  setNotifications: (notifications: Notification[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Computed
  getTotalBalance: () => number
  getMonthlyIncome: () => number
  getMonthlyExpense: () => number
}

export const useRuviStore = create<RuviState>((set, get) => ({
  // Initial state
  wallets: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  debts: [],
  notifications: [],
  isLoading: false,
  error: null,
  
  // Actions
  setWallets: (wallets) => set({ wallets }),
  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }),
  setBudgets: (budgets) => set({ budgets }),
  setGoals: (goals) => set({ goals }),
  setDebts: (debts) => set({ debts }),
  setNotifications: (notifications) => set({ notifications }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Computed
  getTotalBalance: () => {
    return get().wallets.reduce((sum, w) => sum + w.balance, 0)
  },
  
  getMonthlyIncome: () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return get().transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= firstDay)
      .reduce((sum, t) => sum + t.amount, 0)
  },
  
  getMonthlyExpense: () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return get().transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= firstDay)
      .reduce((sum, t) => sum + t.amount, 0)
  },
}))
