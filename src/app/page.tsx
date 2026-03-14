'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useWallets,
  useTransactions,
  useBudgets,
  useGoals,
  useDebts,
  useCategories,
  useSettings,
} from '@/hooks/use-ruvi'
import {
  transactionApi,
  walletApi,
  budgetApi,
  goalApi,
  debtApi,
  userApi,
  settingsApi,
} from '@/lib/api'
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  Settings,
  Bell,
  Moon,
  Sun,
  Target,
  PiggyBank,
  CreditCard,
  BarChart3,
  Receipt,
  Menu,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  Palette,
  Globe,
  Save,
  ChevronLeft,
  ChevronRight,
  Building,
  Banknote,
  Smartphone,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  TransactionModal,
  WalletModal,
  TransferModal,
  BudgetModal,
  GoalModal,
  DebtModal,
  PaymentModal,
  DeleteConfirmModal,
  ContributionModal,
  BudgetExpenseModal,
} from '@/components/ruvi/modals'
import type { Wallet as WalletType, Transaction, Budget, Goal, Debt } from '@/stores/ruvi-store'

// Demo user
const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@ruvi.app',
}

export default function DashboardPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Data hooks
  const { wallets, totalBalance, isLoading: walletsLoading, mutate: mutateWallets } = useWallets()
  const { transactions, summary, isLoading: transactionsLoading, mutate: mutateTransactions } = useTransactions({})
  const { categories, mutate: mutateCategories } = useCategories()
  const { budgets, isLoading: budgetsLoading, mutate: mutateBudgets } = useBudgets(true)
  const { goals, isLoading: goalsLoading, mutate: mutateGoals } = useGoals()
  const { debts, summary: debtSummary, mutate: mutateDebts } = useDebts()
  const { settings, mutate: mutateSettings } = useSettings()

  // Modal states
  const [transactionModal, setTransactionModal] = useState(false)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [walletModal, setWalletModal] = useState(false)
  const [editWallet, setEditWallet] = useState<WalletType | null>(null)
  const [transferModal, setTransferModal] = useState(false)
  const [budgetModal, setBudgetModal] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [goalModal, setGoalModal] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [debtModal, setDebtModal] = useState(false)
  const [editDebt, setEditDebt] = useState<Debt | null>(null)
  const [paymentModal, setPaymentModal] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [contributionModal, setContributionModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [budgetExpenseModal, setBudgetExpenseModal] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterWallet, setFilterWallet] = useState<string>('all')
  const [txPage, setTxPage] = useState(1)

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    currency: 'IDR',
  })

  // Client-side mount detection
  useEffect(() => {
    setMounted(true)
  }, [])

  // Splash screen timer
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 3000) // 3 seconds splash screen
      return () => clearTimeout(timer)
    }
  }, [mounted])

  useEffect(() => {
    setSettingsForm({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      currency: settings?.currency || 'IDR',
    })
  }, [settings])

  const monthlyIncome = summary?.income || 0
  const monthlyExpense = summary?.expense || 0

  const refreshAll = () => {
    mutateWallets()
    mutateTransactions()
    mutateBudgets()
    mutateGoals()
    mutateDebts()
    mutateCategories()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      switch (deleteTarget.type) {
        case 'transaction':
          await transactionApi.delete(deleteTarget.id)
          mutateTransactions()
          break
        case 'wallet':
          await walletApi.delete(deleteTarget.id)
          mutateWallets()
          break
        case 'budget':
          await budgetApi.delete(deleteTarget.id)
          mutateBudgets()
          break
        case 'goal':
          await goalApi.delete(deleteTarget.id)
          mutateGoals()
          break
        case 'debt':
          await debtApi.delete(deleteTarget.id)
          mutateDebts()
          break
      }
      toast.success('Berhasil dihapus')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus')
    } finally {
      setDeleteLoading(false)
      setDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  const handleSaveSettings = async () => {
    try {
      await userApi.update({ name: settingsForm.name })
      await settingsApi.update({ currency: settingsForm.currency })
      mutateSettings()
      toast.success('Pengaturan berhasil disimpan')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan pengaturan')
    }
  }

  // Show splash screen
  if (!mounted || showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#384959] via-[#6A89A7] to-[#88BDF2] overflow-hidden relative">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#88BDF2]/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#BDDDFC]/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[
            { left: '10%', top: '20%', delay: '0s', duration: '4s' },
            { left: '80%', top: '15%', delay: '0.5s', duration: '5s' },
            { left: '25%', top: '70%', delay: '1s', duration: '4.5s' },
            { left: '70%', top: '80%', delay: '1.5s', duration: '3.5s' },
            { left: '15%', top: '45%', delay: '2s', duration: '5s' },
            { left: '85%', top: '55%', delay: '0.3s', duration: '4s' },
            { left: '45%', top: '10%', delay: '0.8s', duration: '4.5s' },
            { left: '55%', top: '90%', delay: '1.2s', duration: '5s' },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: pos.left,
                top: pos.top,
                animationDelay: pos.delay,
                animationDuration: pos.duration,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          {/* Logo text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            {/* Decorative rings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="absolute inset-0 w-48 h-48 -m-8 rounded-full border-2 border-white/10 animate-spin-slow"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute inset-0 w-64 h-64 -m-16 rounded-full border border-white/5 animate-spin-slow animation-delay-1000"
              style={{ animationDirection: 'reverse' }}
            />

            {/* Logo text container */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-center gap-2"
            >
              <h1 
                className="text-6xl md:text-7xl font-black text-white tracking-wider"
                style={{ 
                  fontFamily: "'Inter', system-ui, sans-serif",
                  textShadow: '0 4px 30px rgba(255,255,255,0.3)'
                }}
              >
                RUVI
              </h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-white/60 text-sm md:text-base tracking-[0.3em] uppercase font-medium"
              >
                Rupiah Visual
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Welcome text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col items-center gap-3 mt-4"
          >
            <h2 className="text-xl md:text-2xl text-white font-semibold">
              Kelola Keuangan Dengan Cerdas
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-sm leading-relaxed">
              Ruvi membantu Anda melacak pengeluaran, mengatur budget, dan mencapai tujuan keuangan dengan mudah.
            </p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex items-center gap-3 mt-6"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 bg-white/70 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <span className="text-white/50 text-sm">Memuat aplikasi...</span>
          </motion.div>
        </div>

        {/* Custom animations */}
        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -30px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(30px, 10px) scale(1.05); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-blob { animation: blob 8s ease-in-out infinite; }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 15s linear infinite; }
          .animation-delay-1000 { animation-delay: 1s; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
      </div>
    )
  }

  // Dashboard content
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'wallets', label: 'Dompet', icon: Wallet },
    { id: 'budgets', label: 'Anggaran', icon: Target },
    { id: 'debts', label: 'Hutang', icon: CreditCard },
    { id: 'goals', label: 'Tujuan', icon: PiggyBank },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ]

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'cash': return Banknote
      case 'bank': return Building
      case 'e-wallet': return Smartphone
      case 'credit': return CreditCard
      case 'investment': return TrendingUp
      default: return Wallet
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <div className="flex flex-col">
              <h1 
                className="text-2xl font-black tracking-wider bg-gradient-to-r from-[#6A89A7] to-[#88BDF2] bg-clip-text text-transparent"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                RUVI
              </h1>
              <p className="text-xs text-muted-foreground tracking-widest">Rupiah Visual</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-[#6A89A7] to-[#88BDF2] text-white shadow-lg shadow-[#6A89A7]/25'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6A89A7] to-[#88BDF2] flex items-center justify-center text-white font-semibold">
                {DEMO_USER.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{DEMO_USER.name}</div>
                <div className="text-xs text-muted-foreground truncate">{DEMO_USER.email}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-muted rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold">{navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}</h1>
              <p className="text-sm text-muted-foreground">
                {currentPage === 'dashboard' && `Selamat datang, ${DEMO_USER.name}!`}
                {currentPage === 'transactions' && 'Kelola semua transaksi Anda'}
                {currentPage === 'wallets' && 'Kelola dompet dan rekening Anda'}
                {currentPage === 'budgets' && 'Atur anggaran bulanan Anda'}
                {currentPage === 'debts' && 'Kelola hutang dan piutang'}
                {currentPage === 'goals' && 'Tetapkan dan capai tujuan keuangan Anda'}
                {currentPage === 'settings' && 'Pengaturan akun dan preferensi'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl"><TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
                      <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"><ArrowUpRight className="w-3 h-3 mr-1" />+12.5%</Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pemasukan Bulan Ini</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(monthlyIncome)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-100 dark:border-red-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl"><TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
                      <Badge className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"><ArrowDownRight className="w-3 h-3 mr-1" />-5.2%</Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pengeluaran Bulan Ini</div>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(monthlyExpense)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[#BDDDFC]/30 to-[#88BDF2]/20 dark:from-[#6A89A7]/20 dark:to-[#384959]/20 border-[#88BDF2]/50 dark:border-[#6A89A7]/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-[#88BDF2]/30 dark:bg-[#6A89A7]/30 rounded-xl"><Wallet className="w-6 h-6 text-[#384959] dark:text-[#88BDF2]" /></div>
                      <Badge className="bg-[#BDDDFC] dark:bg-[#6A89A7] text-[#384959] dark:text-white">{wallets.length} Dompet</Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Saldo</div>
                    <div className="text-2xl font-bold text-[#384959] dark:text-white">{formatCurrency(totalBalance)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Aksi Cepat</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => { setEditTransaction(null); setTransactionModal(true) }}>
                      <Plus className="w-5 h-5" /><span className="text-xs">Transaksi Baru</span>
                    </Button>
                    <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => { setEditGoal(null); setGoalModal(true) }}>
                      <PiggyBank className="w-5 h-5" /><span className="text-xs">Tambah Tujuan</span>
                    </Button>
                    <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => { setEditBudget(null); setBudgetModal(true) }}>
                      <Target className="w-5 h-5" /><span className="text-xs">Atur Budget</span>
                    </Button>
                    <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => setTransferModal(true)}>
                      <RefreshCw className="w-5 h-5" /><span className="text-xs">Transfer</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Transaksi Terakhir</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage('transactions')}>Lihat Semua</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px]">
                    {transactionsLoading ? (
                      <div className="p-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                            <Skeleton className="h-4 w-24" />
                          </div>
                        ))}
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p>Belum ada transaksi</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => { setEditTransaction(null); setTransactionModal(true) }}>Tambah Transaksi</Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {transactions.slice(0, 5).map((tx: any) => (
                          <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : tx.type === 'transfer' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
                              {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : tx.type === 'transfer' ? <RefreshCw className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{tx.description || tx.category?.name || 'Transaksi'}</div>
                              <div className="text-sm text-muted-foreground">{tx.wallet?.name} • {formatDate(tx.date)}</div>
                            </div>
                            <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : tx.type === 'transfer' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {budgets.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Progress Anggaran</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {budgets.slice(0, 3).map((budget: any) => (
                      <div key={budget.id}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{budget.name}</span>
                          <span className="text-muted-foreground">{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
                        </div>
                        <Progress value={budget.percentage || 0} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Transactions Page */}
          {currentPage === 'transactions' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Cari transaksi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tipe" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="income">Pemasukan</SelectItem>
                        <SelectItem value="expense">Pengeluaran</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterWallet} onValueChange={setFilterWallet}>
                      <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Dompet" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Dompet</SelectItem>
                        {wallets.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => { setEditTransaction(null); setTransactionModal(true) }} className="bg-gradient-to-r from-[#6A89A7] to-[#88BDF2] hover:opacity-90 w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />Tambah
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">Belum ada transaksi</p>
                      <p className="text-sm mt-1">Mulai catat transaksi pertama Anda</p>
                      <Button className="mt-4 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditTransaction(null); setTransactionModal(true) }}>
                        <Plus className="w-4 h-4 mr-2" />Tambah Transaksi
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Mobile View - Card Layout */}
                      <div className="lg:hidden divide-y divide-border">
                        {transactions.filter((tx: any) => {
                          if (searchQuery && !tx.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
                          if (filterType !== 'all' && tx.type !== filterType) return false
                          if (filterWallet !== 'all' && tx.walletId !== filterWallet) return false
                          return true
                        }).slice((txPage - 1) * 10, txPage * 10).map((tx: any) => (
                          <div key={tx.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : tx.type === 'transfer' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
                                  {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : tx.type === 'transfer' ? <RefreshCw className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{tx.description || tx.category?.name || 'Transaksi'}</div>
                                  <div className="text-xs text-muted-foreground">{formatShortDate(tx.date)}</div>
                                </div>
                              </div>
                              <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : tx.type === 'transfer' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-sm">
                              <div className="flex items-center gap-2">
                                {tx.category && <Badge variant="outline" className="text-xs">{tx.category.name}</Badge>}
                                <Badge className={tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : tx.type === 'transfer' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'}>{tx.type === 'income' ? 'Masuk' : tx.type === 'transfer' ? 'Transfer' : 'Keluar'}</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditTransaction(tx); setTransactionModal(true) }}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => { setDeleteTarget({ type: 'transaction', id: tx.id, name: tx.description || 'Transaksi' }); setDeleteModal(true) }}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Desktop View - Table Layout */}
                      <div className="hidden lg:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Deskripsi</TableHead>
                              <TableHead>Kategori</TableHead>
                              <TableHead>Dompet</TableHead>
                              <TableHead>Tipe</TableHead>
                              <TableHead className="text-right">Jumlah</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.filter((tx: any) => {
                              if (searchQuery && !tx.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
                              if (filterType !== 'all' && tx.type !== filterType) return false
                              if (filterWallet !== 'all' && tx.walletId !== filterWallet) return false
                              return true
                            }).slice((txPage - 1) * 10, txPage * 10).map((tx: any) => (
                              <TableRow key={tx.id}>
                                <TableCell className="text-sm">{formatShortDate(tx.date)}</TableCell>
                                <TableCell><div className="font-medium truncate max-w-[200px]">{tx.description || tx.category?.name || 'Transaksi'}</div></TableCell>
                                <TableCell>{tx.category ? <Badge variant="outline" className="text-xs">{tx.category.name}</Badge> : <span className="text-muted-foreground text-sm">-</span>}</TableCell>
                                <TableCell><span className="text-sm">{tx.wallet?.name || '-'}</span></TableCell>
                                <TableCell><Badge className={tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : tx.type === 'transfer' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'}>{tx.type === 'income' ? 'Masuk' : tx.type === 'transfer' ? 'Transfer' : 'Keluar'}</Badge></TableCell>
                                <TableCell className={`text-right font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : tx.type === 'transfer' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditTransaction(tx); setTransactionModal(true) }}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => { setDeleteTarget({ type: 'transaction', id: tx.id, name: tx.description || 'Transaksi' }); setDeleteModal(true) }}><Trash2 className="w-4 h-4" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Wallets Page */}
          {currentPage === 'wallets' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-semibold">Dompet Saya</h2><p className="text-sm text-muted-foreground">Kelola semua dompet dan rekening Anda</p></div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setTransferModal(true)}><RefreshCw className="w-4 h-4 mr-2" />Transfer</Button>
                  <Button className="bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditWallet(null); setWalletModal(true) }}><Plus className="w-4 h-4 mr-2" />Tambah Dompet</Button>
                </div>
              </div>
              {wallets.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">Belum ada dompet</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditWallet(null); setWalletModal(true) }}><Plus className="w-4 h-4 mr-2" />Tambah Dompet</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wallets.map((wallet) => {
                    const WalletIcon = getWalletIcon(wallet.type)
                    return (
                      <Card key={wallet.id} className="group hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: wallet.color || '#8B5CF6' }}><WalletIcon className="w-6 h-6 text-white" /></div>
                            {wallet.isDefault && <Badge variant="secondary" className="text-xs">Utama</Badge>}
                          </div>
                          <div className="mb-4"><div className="font-medium text-lg">{wallet.name}</div><div className="text-2xl font-bold">{formatCurrency(wallet.balance)}</div></div>
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => { setEditWallet(wallet); setWalletModal(true) }}><Edit className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Edit</span></Button>
                            <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => setCurrentPage('transactions')}><Eye className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Riwayat</span></Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Budgets Page */}
          {currentPage === 'budgets' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-semibold">Anggaran Bulanan</h2><p className="text-sm text-muted-foreground">Kelola anggaran dan batasi pengeluaran</p></div>
                <Button className="bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditBudget(null); setBudgetModal(true) }}><Plus className="w-4 h-4 mr-2" />Tambah Anggaran</Button>
              </div>
              {budgets.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">Belum ada anggaran</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditBudget(null); setBudgetModal(true) }}><Plus className="w-4 h-4 mr-2" />Buat Anggaran</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgets.map((budget: any) => (
                    <Card key={budget.id} className="group hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6A89A7] to-[#88BDF2] flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{budget.name}</h3>
                              <p className="text-sm text-muted-foreground">{budget.category?.name || 'Semua Kategori'}</p>
                            </div>
                          </div>
                          <Badge variant={budget.percentage > 80 ? 'destructive' : budget.percentage > 50 ? 'default' : 'secondary'} className="text-xs">
                            {budget.period === 'monthly' ? 'Bulanan' : budget.period === 'weekly' ? 'Mingguan' : 'Tahunan'}
                          </Badge>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Terpakai</span>
                            <span className="font-medium">{formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}</span>
                          </div>
                          <Progress value={budget.percentage || 0} className="h-2" />
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>{budget.percentage?.toFixed(0) || 0}%</span>
                            <span>Sisa: {formatCurrency(budget.amount - (budget.spent || 0))}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => { setEditBudget(budget); setBudgetModal(true) }}>
                            <Edit className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 min-w-0 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]"
                            onClick={() => { setSelectedBudget(budget); setBudgetExpenseModal(true) }}
                          >
                            <Plus className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Pengeluaran</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 min-w-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => { setDeleteTarget({ type: 'budget', id: budget.id, name: budget.name }); setDeleteModal(true) }}>
                            <Trash2 className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Hapus</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Debts Page */}
          {currentPage === 'debts' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-semibold">Hutang & Piutang</h2><p className="text-sm text-muted-foreground">Kelola hutang dan piutang Anda</p></div>
                <Button className="bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditDebt(null); setDebtModal(true) }}><Plus className="w-4 h-4 mr-2" />Tambah</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-100 dark:border-red-900">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl"><TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
                      <div><div className="text-sm text-muted-foreground">Total Hutang</div><div className="text-xl font-bold text-red-700 dark:text-red-400">{formatCurrency(debtSummary?.totalDebt || 0)}</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl"><TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
                      <div><div className="text-sm text-muted-foreground">Total Piutang</div><div className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(debtSummary?.totalReceivable || 0)}</div></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {debts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">Tidak ada hutang atau piutang</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditDebt(null); setDebtModal(true) }}><Plus className="w-4 h-4 mr-2" />Tambah Hutang/Piutang</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {debts.map((debt: any) => {
                    const remainingAmount = debt.totalAmount - debt.paidAmount
                    const progressPercent = (debt.paidAmount / debt.totalAmount) * 100
                    return (
                      <Card key={debt.id} className="group hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${debt.type === 'my_debt' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'}`}>
                                {debt.type === 'my_debt' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{debt.name}</h3>
                                  {debt.isPaid && <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs">Lunas</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{debt.contact || '-'} • {debt.type === 'my_debt' ? 'Hutang' : 'Piutang'}</p>
                              </div>
                            </div>
                            <div className="flex-1 max-w-xs">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Dibayar</span>
                                <span className="font-medium">{formatCurrency(debt.paidAmount)} / {formatCurrency(debt.totalAmount)}</span>
                              </div>
                              <Progress value={progressPercent} className="h-2" />
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-lg ${debt.type === 'my_debt' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {formatCurrency(remainingAmount)}
                              </div>
                              <div className="text-xs text-muted-foreground">Sisa {debt.type === 'my_debt' ? 'hutang' : 'piutang'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => { setEditDebt(debt); setDebtModal(true) }}>
                              <Edit className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Edit</span>
                            </Button>
                            {!debt.isPaid && (
                              <Button 
                                size="sm" 
                                className="flex-1 min-w-0 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]"
                                onClick={() => { setSelectedDebt(debt); setPaymentModal(true) }}
                              >
                                <CreditCard className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">{debt.type === 'my_debt' ? 'Bayar' : 'Terima'}</span>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="flex-1 min-w-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => { setDeleteTarget({ type: 'debt', id: debt.id, name: debt.name }); setDeleteModal(true) }}>
                              <Trash2 className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Hapus</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Goals Page */}
          {currentPage === 'goals' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-semibold">Tujuan Keuangan</h2><p className="text-sm text-muted-foreground">Tetapkan dan capai tujuan keuangan Anda</p></div>
                <Button className="bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditGoal(null); setGoalModal(true) }}><Plus className="w-4 h-4 mr-2" />Tambah Tujuan</Button>
              </div>
              {goals.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <PiggyBank className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">Belum ada tujuan keuangan</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={() => { setEditGoal(null); setGoalModal(true) }}><Plus className="w-4 h-4 mr-2" />Buat Tujuan</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goals.map((goal: any) => {
                    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100
                    return (
                      <Card key={goal.id} className={`group hover:shadow-lg transition-all duration-200 ${goal.isCompleted ? 'opacity-70' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#6A89A7] to-[#88BDF2]">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{goal.name}</h3>
                                  {goal.isCompleted && <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs">Tercapai</Badge>}
                                </div>
                                {goal.targetDate && <p className="text-xs text-muted-foreground">Target: {formatDate(goal.targetDate)}</p>}
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Terkumpul</span>
                              <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                            </div>
                            <Progress value={progressPercent || 0} className="h-3" />
                          </div>
                          <div className="flex justify-between text-sm mb-4">
                            <span className="font-semibold text-lg">{formatCurrency(goal.currentAmount || 0)}</span>
                            <span className="text-muted-foreground">dari {formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => { setEditGoal(goal); setGoalModal(true) }}>
                                <Edit className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Edit</span>
                              </Button>
                              {!goal.isCompleted && (
                                <Button 
                                  size="sm" 
                                  className="flex-1 min-w-0 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]"
                                  onClick={() => { setSelectedGoal(goal); setContributionModal(true) }}
                                >
                                  <PiggyBank className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Tambah</span>
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="flex-1 min-w-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => { setDeleteTarget({ type: 'goal', id: goal.id, name: goal.name }); setDeleteModal(true) }}>
                                <Trash2 className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Hapus</span>
                              </Button>
                            </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Reports Page */}
          {currentPage === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Laporan Keuangan</h2>
                  <p className="text-sm text-muted-foreground">Analisis dan visualisasi keuangan Anda</p>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Waktu</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                    <SelectItem value="week">Minggu Ini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Pemasukan</div>
                        <div className="text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(monthlyIncome)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-100 dark:border-red-900">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Pengeluaran</div>
                        <div className="text-lg font-bold text-red-700 dark:text-red-400">{formatCurrency(monthlyExpense)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[#BDDDFC]/30 to-[#88BDF2]/20 border-[#88BDF2]/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#88BDF2]/30 rounded-lg">
                        <Wallet className="w-5 h-5 text-[#384959]" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Saldo</div>
                        <div className="text-lg font-bold text-[#384959] dark:text-white">{formatCurrency(totalBalance)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-100 dark:border-purple-900">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Transaksi</div>
                        <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{transactions.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pemasukan vs Pengeluaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-full h-full flex items-end justify-around gap-4 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 sm:w-24 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500" style={{ height: `${Math.min((monthlyIncome / (monthlyIncome + monthlyExpense || 1)) * 150 + 50, 200)}px` }} />
                          <span className="text-xs text-muted-foreground">Pemasukan</span>
                          <span className="text-sm font-semibold text-green-600">{formatCurrency(monthlyIncome)}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 sm:w-24 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-500" style={{ height: `${Math.min((monthlyExpense / (monthlyIncome + monthlyExpense || 1)) * 150 + 50, 200)}px` }} />
                          <span className="text-xs text-muted-foreground">Pengeluaran</span>
                          <span className="text-sm font-semibold text-red-600">{formatCurrency(monthlyExpense)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Wallet Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribusi Dompet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      {wallets.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                          <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada dompet</p>
                        </div>
                      ) : (
                        <div className="w-full space-y-3">
                          {wallets.map((wallet, index) => {
                            const percentage = totalBalance > 0 ? (wallet.balance / totalBalance) * 100 : 0
                            const colors = ['bg-[#6A89A7]', 'bg-[#88BDF2]', 'bg-[#BDDDFC]', 'bg-[#384959]', 'bg-emerald-500', 'bg-amber-500']
                            return (
                              <div key={wallet.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium truncate max-w-[60%]">{wallet.name}</span>
                                  <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className={`h-full ${colors[index % colors.length]} rounded-full`}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progress Anggaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 overflow-y-auto pr-2">
                      {budgets.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada anggaran</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {budgets.map((budget: any) => (
                            <div key={budget.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{budget.name}</span>
                                <span className={budget.percentage > 80 ? 'text-red-500' : 'text-muted-foreground'}>
                                  {budget.percentage?.toFixed(0) || 0}%
                                </span>
                              </div>
                              <Progress 
                                value={budget.percentage || 0} 
                                className={`h-2 ${budget.percentage > 80 ? '[&>div]:bg-red-500' : budget.percentage > 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatCurrency(budget.spent || 0)} terpakai</span>
                                <span>{formatCurrency(budget.amount - (budget.spent || 0))} sisa</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Debt Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status Hutang & Piutang</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-full space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Hutang</span>
                            <span className="font-semibold text-red-600">{formatCurrency(debtSummary?.totalDebt || 0)}</span>
                          </div>
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: debtSummary?.totalDebt ? '100%' : '0%' }} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Piutang</span>
                            <span className="font-semibold text-green-600">{formatCurrency(debtSummary?.totalReceivable || 0)}</span>
                          </div>
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: debtSummary?.totalReceivable ? '100%' : '0%' }} />
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Selisih</span>
                            <span className={`text-lg font-bold ${(debtSummary?.totalReceivable || 0) - (debtSummary?.totalDebt || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs((debtSummary?.totalReceivable || 0) - (debtSummary?.totalDebt || 0)))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px]">
                    {transactions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada transaksi</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {transactions.slice(0, 10).map((tx: any) => (
                          <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : tx.type === 'transfer' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
                              {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : tx.type === 'transfer' ? <RefreshCw className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{tx.description || tx.category?.name || 'Transaksi'}</div>
                              <div className="text-sm text-muted-foreground">{tx.wallet?.name} • {formatDate(tx.date)}</div>
                            </div>
                            <div className={`font-semibold shrink-0 ${tx.type === 'income' ? 'text-green-600' : tx.type === 'transfer' ? 'text-blue-600' : 'text-red-600'}`}>
                              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Settings Page */}
          {currentPage === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Profil</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="name">Nama</Label><Input id="name" value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={settingsForm.email} disabled className="bg-gray-50" /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" />Tampilan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5"><Label>Mode Gelap</Label><p className="text-sm text-muted-foreground">Aktifkan tema gelap</p></div>
                    <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Preferensi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mata Uang</Label>
                    <Select value={settingsForm.currency} onValueChange={(v) => setSettingsForm({ ...settingsForm, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDR">IDR - Rupiah Indonesia</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              <Button className="w-full bg-gradient-to-r from-[#6A89A7] to-[#88BDF2]" onClick={handleSaveSettings}><Save className="w-4 h-4 mr-2" />Simpan Pengaturan</Button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modals */}
      <TransactionModal
        open={transactionModal}
        onOpenChange={(open) => { setTransactionModal(open); if (!open) setEditTransaction(null) }}
        transaction={editTransaction}
        wallets={wallets}
        onSuccess={() => { mutateTransactions(); mutateWallets() }}
      />
      <WalletModal
        open={walletModal}
        onOpenChange={(open) => { setWalletModal(open); if (!open) setEditWallet(null) }}
        wallet={editWallet}
        onSuccess={() => mutateWallets()}
      />
      <TransferModal
        open={transferModal}
        onOpenChange={setTransferModal}
        wallets={wallets}
        onSuccess={() => { mutateTransactions(); mutateWallets() }}
      />
      <BudgetModal
        open={budgetModal}
        onOpenChange={(open) => { setBudgetModal(open); if (!open) setEditBudget(null) }}
        budget={editBudget}
        categories={categories}
        onSuccess={() => mutateBudgets()}
      />
      <GoalModal
        open={goalModal}
        onOpenChange={(open) => { setGoalModal(open); if (!open) setEditGoal(null) }}
        goal={editGoal}
        onSuccess={() => mutateGoals()}
      />
      <DebtModal
        open={debtModal}
        onOpenChange={(open) => { setDebtModal(open); if (!open) setEditDebt(null) }}
        debt={editDebt}
        onSuccess={() => mutateDebts()}
      />
      <PaymentModal
        open={paymentModal}
        onOpenChange={(open) => { setPaymentModal(open); if (!open) setSelectedDebt(null) }}
        debt={selectedDebt}
        onSuccess={() => mutateDebts()}
      />
      <ContributionModal
        open={contributionModal}
        onOpenChange={(open) => { setContributionModal(open); if (!open) setSelectedGoal(null) }}
        goal={selectedGoal}
        onSuccess={() => mutateGoals()}
      />
      <BudgetExpenseModal
        open={budgetExpenseModal}
        onOpenChange={(open) => { setBudgetExpenseModal(open); if (!open) setSelectedBudget(null) }}
        budget={selectedBudget}
        onSuccess={() => mutateBudgets()}
      />
      <DeleteConfirmModal
        open={deleteModal}
        onOpenChange={(open) => { setDeleteModal(open); if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title={`Hapus ${deleteTarget?.type === 'transaction' ? 'Transaksi' : deleteTarget?.type === 'wallet' ? 'Dompet' : deleteTarget?.type === 'budget' ? 'Anggaran' : deleteTarget?.type === 'goal' ? 'Tujuan' : 'Hutang'}`}
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  )
}
