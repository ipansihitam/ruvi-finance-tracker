'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useCategories } from '@/hooks/use-ruvi'
import {
  transactionApi,
  walletApi,
  budgetApi,
  goalApi,
  debtApi,
  userApi,
} from '@/lib/api'
import type { Wallet, Transaction, Budget, Goal, Debt } from '@/stores/ruvi-store'

// Common Types
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ============== Transaction Modal ==============
interface TransactionModalProps extends ModalProps {
  transaction?: Transaction | null
  wallets: Wallet[]
  onSuccess: () => void
}

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  wallets,
  onSuccess,
}: TransactionModalProps) {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [walletId, setWalletId] = useState(transaction?.walletId || wallets[0]?.id || '')
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || '')
  const [date, setDate] = useState<Date>(transaction?.date ? new Date(transaction.date) : new Date())
  const [notes, setNotes] = useState(transaction?.notes || '')

  const { categories } = useCategories(type)

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setDescription(transaction.description || '')
      setWalletId(transaction.walletId)
      setCategoryId(transaction.categoryId || '')
      setDate(new Date(transaction.date))
      setNotes(transaction.notes || '')
    } else {
      resetForm()
    }
  }, [transaction, open])

  const resetForm = () => {
    setType('expense')
    setAmount('')
    setDescription('')
    setWalletId(wallets[0]?.id || '')
    setCategoryId('')
    setDate(new Date())
    setNotes('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!walletId) {
      toast.error('Pilih dompet terlebih dahulu')
      return
    }
    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      toast.error('Jumlah harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const data = {
        type,
        amount: parseFloat(amount),
        description: description?.trim() || undefined,
        walletId,
        categoryId: categoryId || undefined,
        date: date.toISOString(),
        notes: notes?.trim() || undefined,
      }

      if (transaction) {
        await transactionApi.update(transaction.id, data)
        toast.success('Transaksi berhasil diperbarui')
      } else {
        await transactionApi.create(data)
        toast.success('Transaksi berhasil ditambahkan')
      }

      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (error: any) {
      console.error('Transaction modal error:', error)
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </DialogTitle>
          <DialogDescription>
            {transaction ? 'Perbarui detail transaksi' : 'Tambahkan transaksi baru'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet">Dompet</Label>
            <Select value={walletId} onValueChange={setWalletId}>
              <SelectTrigger id="wallet">
                <SelectValue placeholder="Pilih dompet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({formatCurrency(wallet.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              placeholder="Deskripsi transaksi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pilih tanggal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Wallet Modal ==============
interface WalletModalProps extends ModalProps {
  wallet?: Wallet | null
  onSuccess: () => void
}

const WALLET_TYPES = [
  { value: 'cash', label: 'Tunai' },
  { value: 'bank', label: 'Rekening Bank' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'credit', label: 'Kartu Kredit' },
  { value: 'investment', label: 'Investasi' },
  { value: 'other', label: 'Lainnya' },
]

const WALLET_COLORS = [
  '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
  '#6366F1', '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#A855F7',
]

export function WalletModal({ open, onOpenChange, wallet, onSuccess }: WalletModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(wallet?.name || '')
  const [type, setType] = useState(wallet?.type || 'cash')
  const [balance, setBalance] = useState(wallet?.balance?.toString() || '0')
  const [number, setNumber] = useState(wallet?.number || '')
  const [color, setColor] = useState(wallet?.color || WALLET_COLORS[0])
  const [isDefault, setIsDefault] = useState(wallet?.isDefault || false)

  useEffect(() => {
    if (wallet) {
      setName(wallet.name)
      setType(wallet.type)
      setBalance(wallet.balance.toString())
      setNumber(wallet.number || '')
      setColor(wallet.color || WALLET_COLORS[0])
      setIsDefault(wallet.isDefault)
    } else {
      resetForm()
    }
  }, [wallet, open])

  const resetForm = () => {
    setName('')
    setType('cash')
    setBalance('0')
    setNumber('')
    setColor(WALLET_COLORS[0])
    setIsDefault(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !name.trim()) {
      toast.error('Nama dompet wajib diisi')
      return
    }

    setLoading(true)
    try {
      const data = {
        name: name.trim(),
        type,
        balance: parseFloat(balance) || 0,
        number: number?.trim() || undefined,
        color,
        isDefault,
      }

      if (wallet) {
        await walletApi.update(wallet.id, data)
        toast.success('Dompet berhasil diperbarui')
      } else {
        await walletApi.create(data)
        toast.success('Dompet berhasil ditambahkan')
      }

      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (error: any) {
      console.error('Wallet modal error:', error)
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{wallet ? 'Edit Dompet' : 'Tambah Dompet'}</DialogTitle>
          <DialogDescription>
            {wallet ? 'Perbarui detail dompet' : 'Tambahkan dompet baru'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Dompet</Label>
            <Input
              id="name"
              placeholder="Contoh: BCA, GoPay, Tunai"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="walletType">Tipe</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="walletType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WALLET_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="walletBalance">Saldo Awal</Label>
              <Input
                id="walletBalance"
                type="number"
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Nomor Rekening/E-Wallet (Opsional)</Label>
            <Input
              id="number"
              placeholder="Contoh: 1234567890"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform',
                    color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {wallet ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Transfer Modal ==============
interface TransferModalProps extends ModalProps {
  wallets: Wallet[]
  onSuccess: () => void
}

export function TransferModal({ open, onOpenChange, wallets, onSuccess }: TransferModalProps) {
  const [loading, setLoading] = useState(false)
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '')
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || wallets[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date>(new Date())

  const fromWallet = wallets.find((w) => w.id === fromWalletId)

  useEffect(() => {
    if (wallets.length > 0 && !fromWalletId) {
      setFromWalletId(wallets[0].id)
      setToWalletId(wallets[1]?.id || wallets[0].id)
    }
  }, [wallets, fromWalletId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromWalletId || !toWalletId) {
      toast.error('Pilih dompet asal dan tujuan')
      return
    }
    if (fromWalletId === toWalletId) {
      toast.error('Dompet asal dan tujuan tidak boleh sama')
      return
    }
    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      toast.error('Jumlah transfer harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      await transactionApi.create({
        type: 'transfer',
        amount: parseFloat(amount),
        walletId: fromWalletId,
        toWalletId,
        description: description?.trim() || 'Transfer antar dompet',
        date: date.toISOString(),
      })

      toast.success('Transfer berhasil')
      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (error: any) {
      console.error('Transfer modal error:', error)
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setDate(new Date())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Antar Dompet</DialogTitle>
          <DialogDescription>Pindahkan dana antar dompet Anda</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dari Dompet</Label>
              <Select value={fromWalletId} onValueChange={setFromWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dompet asal" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromWallet && (
                <p className="text-xs text-muted-foreground">
                  Saldo: {formatCurrency(fromWallet.balance)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Ke Dompet</Label>
              <Select value={toWalletId} onValueChange={setToWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dompet tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {wallets
                    .filter((w) => w.id !== fromWalletId)
                    .map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferAmount">Jumlah (Rp)</Label>
            <Input
              id="transferAmount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferDesc">Deskripsi (Opsional)</Label>
            <Input
              id="transferDesc"
              placeholder="Catatan transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Budget Modal ==============
interface BudgetModalProps extends ModalProps {
  budget?: Budget | null
  categories: any[]
  onSuccess: () => void
}

export function BudgetModal({
  open,
  onOpenChange,
  budget,
  categories,
  onSuccess,
}: BudgetModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(budget?.name || '')
  const [amount, setAmount] = useState(budget?.amount?.toString() || '')
  const [categoryId, setCategoryId] = useState(budget?.categoryId || '')
  const [period, setPeriod] = useState(budget?.period || 'monthly')

  useEffect(() => {
    if (budget) {
      setName(budget.name)
      setAmount(budget.amount.toString())
      setCategoryId(budget.categoryId || '')
      setPeriod(budget.period)
    } else {
      resetForm()
    }
  }, [budget, open])

  const resetForm = () => {
    setName('')
    setAmount('')
    setCategoryId('')
    setPeriod('monthly')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !name.trim()) {
      toast.error('Nama anggaran harus diisi')
      return
    }
    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      toast.error('Jumlah anggaran harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const data = {
        name: name.trim(),
        amount: parseFloat(amount),
        categoryId: categoryId || undefined,
        period,
      }

      if (budget) {
        await budgetApi.update(budget.id, data)
        toast.success('Anggaran berhasil diperbarui')
      } else {
        await budgetApi.create(data)
        toast.success('Anggaran berhasil ditambahkan')
      }

      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (error: any) {
      console.error('Budget modal error:', error)
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Anggaran' : 'Tambah Anggaran'}</DialogTitle>
          <DialogDescription>
            {budget ? 'Perbarui detail anggaran' : 'Atur anggaran bulanan Anda'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budgetName">Nama Anggaran</Label>
            <Input
              id="budgetName"
              placeholder="Contoh: Belanja Bulanan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetAmount">Jumlah Anggaran (Rp)</Label>
            <Input
              id="budgetAmount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetCategory">Kategori (Opsional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="budgetCategory">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetPeriod">Periode</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="budgetPeriod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {budget ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Goal Modal ==============
interface GoalModalProps extends ModalProps {
  goal?: Goal | null
  onSuccess: () => void
}

const GOAL_CATEGORIES = [
  { value: 'emergency', label: 'Dana Darurat' },
  { value: 'vacation', label: 'Liburan' },
  { value: 'gadget', label: 'Gadget' },
  { value: 'vehicle', label: 'Kendaraan' },
  { value: 'house', label: 'Rumah' },
  { value: 'education', label: 'Pendidikan' },
  { value: 'wedding', label: 'Pernikahan' },
  { value: 'investment', label: 'Investasi' },
  { value: 'other', label: 'Lainnya' },
]

const GOAL_PRIORITIES = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
]

export function GoalModal({ open, onOpenChange, goal, onSuccess }: GoalModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(goal?.name || '')
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '')
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount?.toString() || '0')
  const [category, setCategory] = useState(goal?.category || 'other')
  const [priority, setPriority] = useState(goal?.priority || 'medium')
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal?.targetDate ? new Date(goal.targetDate) : undefined
  )

  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setTargetAmount(goal.targetAmount.toString())
      setCurrentAmount(goal.currentAmount.toString())
      setCategory(goal.category || 'other')
      setPriority(goal.priority || 'medium')
      setTargetDate(goal.targetDate ? new Date(goal.targetDate) : undefined)
    } else {
      resetForm()
    }
  }, [goal, open])

  const resetForm = () => {
    setName('')
    setTargetAmount('')
    setCurrentAmount('0')
    setCategory('other')
    setPriority('medium')
    setTargetDate(undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !name.trim()) {
      toast.error('Nama tujuan harus diisi')
      return
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0 || isNaN(parseFloat(targetAmount))) {
      toast.error('Target jumlah harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const data = {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        category,
        priority,
        targetDate: targetDate?.toISOString(),
      }

      if (goal) {
        await goalApi.update(goal.id, data)
        toast.success('Tujuan berhasil diperbarui')
      } else {
        await goalApi.create(data)
        toast.success('Tujuan berhasil ditambahkan')
      }

      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (error: any) {
      console.error('Goal modal error:', error)
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Tujuan' : 'Tambah Tujuan Keuangan'}</DialogTitle>
          <DialogDescription>
            {goal ? 'Perbarui detail tujuan' : 'Tetapkan target tabungan Anda'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalName">Nama Tujuan</Label>
            <Input
              id="goalName"
              placeholder="Contoh: Dana Darurat 6 Bulan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target (Rp)</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Terkumpul (Rp)</Label>
              <Input
                id="currentAmount"
                type="number"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goalCategory">Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="goalCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalPriority">Prioritas</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="goalPriority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Tanggal (Opsional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, 'PPP') : 'Pilih tanggal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goal ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Debt Modal ==============
interface DebtModalProps extends ModalProps {
  debt?: Debt | null
  onSuccess: () => void
}

export function DebtModal({ open, onOpenChange, debt, onSuccess }: DebtModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(debt?.name || '')
  const [type, setType] = useState<'my_debt' | 'others_debt'>(debt?.type || 'my_debt')
  const [totalAmount, setTotalAmount] = useState(debt?.totalAmount?.toString() || '')
  const [paidAmount, setPaidAmount] = useState(debt?.paidAmount?.toString() || '0')
  const [dueDate, setDueDate] = useState<Date | undefined>(
    debt?.dueDate ? new Date(debt.dueDate) : undefined
  )
  const [interestRate, setInterestRate] = useState(debt?.interestRate?.toString() || '')
  const [contact, setContact] = useState(debt?.contact || '')
  const [description, setDescription] = useState(debt?.description || '')

  useEffect(() => {
    if (debt) {
      setName(debt.name)
      setType(debt.type)
      setTotalAmount(debt.totalAmount.toString())
      setPaidAmount(debt.paidAmount.toString())
      setDueDate(debt.dueDate ? new Date(debt.dueDate) : undefined)
      setInterestRate(debt.interestRate?.toString() || '')
      setContact(debt.contact || '')
      setDescription(debt.description || '')
    } else {
      resetForm()
    }
  }, [debt, open])

  const resetForm = () => {
    setName('')
    setType('my_debt')
    setTotalAmount('')
    setPaidAmount('0')
    setDueDate(undefined)
    setInterestRate('')
    setContact('')
    setDescription('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!name || !name.trim()) {
      toast.error('Nama kreditur/debitur harus diisi')
      return
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0 || isNaN(parseFloat(totalAmount))) {
      toast.error('Jumlah hutang harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const data = {
        name: name.trim(),
        type,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount) || 0,
        dueDate: dueDate?.toISOString(),
        interestRate: interestRate ? parseFloat(interestRate) : 0,
        contact: contact?.trim() || undefined,
        description: description?.trim() || undefined,
      }

      if (debt) {
        await debtApi.update(debt.id, data)
        toast.success('Hutang/Piutang berhasil diperbarui')
      } else {
        await debtApi.create(data)
        toast.success('Hutang/Piutang berhasil ditambahkan')
      }

      // Close modal and reset form FIRST, then call onSuccess
      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (error: any) {
      console.error('Debt modal error:', error)
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{debt ? 'Edit Hutang/Piutang' : 'Tambah Hutang/Piutang'}</DialogTitle>
          <DialogDescription>
            {debt ? 'Perbarui detail' : 'Catat hutang atau piutang Anda'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debtType">Tipe</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'my_debt' | 'others_debt')}>
                <SelectTrigger id="debtType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="my_debt">Hutang Saya</SelectItem>
                  <SelectItem value="others_debt">Piutang Orang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="debtName">Nama {type === 'my_debt' ? 'Kreditur' : 'Debitur'}</Label>
              <Input
                id="debtName"
                placeholder="Nama orang/instansi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalDebt">Total Jumlah (Rp)</Label>
              <Input
                id="totalDebt"
                type="number"
                placeholder="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidDebt">Sudah Dibayar (Rp)</Label>
              <Input
                id="paidDebt"
                type="number"
                placeholder="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest">Bunga (%/bulan)</Label>
              <Input
                id="interest"
                type="number"
                placeholder="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Jatuh Tempo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Kontak (Opsional)</Label>
            <Input
              id="contact"
              placeholder="No. HP atau kontak lainnya"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debtDesc">Catatan (Opsional)</Label>
            <Textarea
              id="debtDesc"
              placeholder="Catatan tambahan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {debt ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Payment Modal ==============
interface PaymentModalProps extends ModalProps {
  debt: Debt | null
  onSuccess: () => void
}

export function PaymentModal({ open, onOpenChange, debt, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (debt) {
      const remaining = debt.totalAmount - debt.paidAmount
      setAmount(remaining.toString())
    }
    setNotes('')
  }, [debt, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !debt) {
      toast.error('Mohon masukkan jumlah pembayaran')
      return
    }

    setLoading(true)
    try {
      const newPaidAmount = debt.paidAmount + parseFloat(amount)
      await debtApi.update(debt.id, {
        paidAmount: newPaidAmount,
        isPaid: newPaidAmount >= debt.totalAmount,
      })

      toast.success('Pembayaran berhasil dicatat')
      onSuccess()
      onOpenChange(false)
      setAmount('')
      setNotes('')
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!debt) return null

  const remaining = debt.totalAmount - debt.paidAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pembayaran</DialogTitle>
          <DialogDescription>
            {debt.type === 'my_debt' ? 'Bayar hutang ke' : 'Terima pembayaran dari'} {debt.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatCurrency(debt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terbayar</span>
              <span className="font-medium text-green-600">{formatCurrency(debt.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sisa</span>
              <span className="font-medium text-orange-600">{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Jumlah Pembayaran (Rp)</Label>
            <Input
              id="paymentAmount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={remaining}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNotes">Catatan (Opsional)</Label>
            <Textarea
              id="paymentNotes"
              placeholder="Catatan pembayaran"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Catat Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Delete Confirm Modal ==============
interface DeleteConfirmModalProps extends ModalProps {
  title: string
  description: string
  onConfirm: () => void
  loading?: boolean
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============== Goal Contribution Modal ==============
interface ContributionModalProps extends ModalProps {
  goal: Goal | null
  onSuccess: () => void
}

export function ContributionModal({ open, onOpenChange, goal, onSuccess }: ContributionModalProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    setAmount('')
  }, [goal, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !goal) {
      toast.error('Mohon masukkan jumlah setoran')
      return
    }

    setLoading(true)
    try {
      const newAmount = goal.currentAmount + parseFloat(amount)
      await goalApi.update(goal.id, {
        currentAmount: newAmount,
        isCompleted: newAmount >= goal.targetAmount,
      })

      toast.success('Setoran berhasil dicatat')
      onSuccess()
      onOpenChange(false)
      setAmount('')
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!goal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Setoran</DialogTitle>
          <DialogDescription>Tambah setoran untuk tujuan: {goal.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terkumpul</span>
              <span className="font-medium text-green-600">{formatCurrency(goal.currentAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kekurangan</span>
              <span className="font-medium text-orange-600">{formatCurrency(goal.remaining || goal.targetAmount - goal.currentAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contributionAmount">Jumlah Setoran (Rp)</Label>
            <Input
              id="contributionAmount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Setoran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== Budget Expense Modal ==============
interface BudgetExpenseModalProps extends ModalProps {
  budget: Budget | null
  onSuccess: () => void
}

export function BudgetExpenseModal({ open, onOpenChange, budget, onSuccess }: BudgetExpenseModalProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    setAmount('')
    setDescription('')
  }, [budget, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !budget) {
      toast.error('Mohon masukkan jumlah pengeluaran')
      return
    }

    setLoading(true)
    try {
      const newSpent = (budget.spent || 0) + parseFloat(amount)
      await budgetApi.update(budget.id, {
        spent: newSpent,
      })

      toast.success('Pengeluaran berhasil dicatat')
      onSuccess()
      onOpenChange(false)
      setAmount('')
      setDescription('')
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!budget) return null

  const remaining = budget.amount - (budget.spent || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pengeluaran</DialogTitle>
          <DialogDescription>Catat pengeluaran untuk anggaran: {budget.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Anggaran</span>
              <span className="font-medium">{formatCurrency(budget.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terpakai</span>
              <span className="font-medium text-red-600">{formatCurrency(budget.spent || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sisa</span>
              <span className="font-medium text-green-600">{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenseAmount">Jumlah Pengeluaran (Rp)</Label>
            <Input
              id="expenseAmount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenseDesc">Deskripsi (Opsional)</Label>
            <Input
              id="expenseDesc"
              placeholder="Contoh: Belanja mingguan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Catat Pengeluaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
