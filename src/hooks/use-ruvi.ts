import useSWR from 'swr'
import { useRuviStore, Wallet, Category, Transaction, Budget, Goal, Debt, Notification } from '@/stores/ruvi-store'

// Generic fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'An error occurred')
  }
  return res.json()
}

// Wallet hooks
export function useWallets() {
  const setWallets = useRuviStore(s => s.setWallets)
  
  const { data, error, isLoading, mutate } = useSWR(
    '/api/wallets',
    fetcher
  )
  
  // Update store when data changes
  if (data?.wallets) {
    setWallets(data.wallets)
  }
  
  return {
    wallets: data?.wallets || [],
    totalBalance: data?.totalBalance || 0,
    isLoading,
    error,
    mutate,
  }
}

// Transaction hooks
export function useTransactions(filters?: {
  type?: string
  walletId?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}) {
  const setTransactions = useRuviStore(s => s.setTransactions)
  
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.walletId) params.set('walletId', filters.walletId)
  if (filters?.categoryId) params.set('categoryId', filters.categoryId)
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.page) params.set('page', filters.page.toString())
  if (filters?.limit) params.set('limit', filters.limit.toString())
  
  const queryString = params.toString()
  const url = queryString ? `/api/transactions?${queryString}` : '/api/transactions'
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher
  )
  
  if (data?.transactions) {
    setTransactions(data.transactions)
  }
  
  return {
    transactions: data?.transactions || [],
    pagination: data?.pagination,
    summary: data?.summary,
    isLoading,
    error,
    mutate,
  }
}

// Category hooks
export function useCategories(type?: 'income' | 'expense') {
  const setCategories = useRuviStore(s => s.setCategories)
  
  const url = type ? `/api/categories?type=${type}` : '/api/categories'
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher
  )
  
  if (data?.categories) {
    setCategories(data.categories)
  }
  
  return {
    categories: data?.categories || [],
    grouped: data?.grouped,
    isLoading,
    error,
    mutate,
  }
}

// Budget hooks
export function useBudgets(isActive?: boolean) {
  const setBudgets = useRuviStore(s => s.setBudgets)
  
  const url = isActive !== undefined ? `/api/budgets?isActive=${isActive}` : '/api/budgets'
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher
  )
  
  if (data?.budgets) {
    setBudgets(data.budgets)
  }
  
  return {
    budgets: data?.budgets || [],
    isLoading,
    error,
    mutate,
  }
}

// Goal hooks
export function useGoals(isCompleted?: boolean) {
  const setGoals = useRuviStore(s => s.setGoals)
  
  const url = isCompleted !== undefined ? `/api/goals?isCompleted=${isCompleted}` : '/api/goals'
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher
  )
  
  if (data?.goals) {
    setGoals(data.goals)
  }
  
  return {
    goals: data?.goals || [],
    activeCount: data?.activeCount,
    completedCount: data?.completedCount,
    isLoading,
    error,
    mutate,
  }
}

// Debt hooks
export function useDebts(type?: 'my_debt' | 'others_debt', isPaid?: boolean) {
  const setDebts = useRuviStore(s => s.setDebts)
  
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (isPaid !== undefined) params.set('isPaid', isPaid.toString())
  
  const queryString = params.toString()
  const url = queryString ? `/api/debts?${queryString}` : '/api/debts'
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher
  )
  
  if (data?.debts) {
    setDebts(data.debts)
  }
  
  return {
    debts: data?.debts || [],
    grouped: data?.grouped,
    summary: data?.summary,
    isLoading,
    error,
    mutate,
  }
}

// User settings
export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/settings',
    fetcher
  )
  
  return {
    settings: data?.settings,
    isLoading,
    error,
    mutate,
  }
}

// User profile
export function useUser() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/user',
    fetcher
  )
  
  return {
    user: data?.user,
    stats: data?.stats,
    isLoading,
    error,
    mutate,
  }
}
