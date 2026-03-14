import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatter for Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Parse currency string to number
export function parseCurrency(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, '')) || 0
}

// Date formatter
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

// Short date formatter
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

// Relative time formatter
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) return formatDate(d)
  if (days > 0) return `${days} hari lalu`
  if (hours > 0) return `${hours} jam lalu`
  if (minutes > 0) return `${minutes} menit lalu`
  return 'Baru saja'
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Get greeting based on time
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[month - 1] || ''
}

// Get category icon
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Gaji': 'briefcase',
    'Bonus': 'gift',
    'Investasi': 'trending-up',
    'Makanan': 'utensils',
    'Transportasi': 'car',
    'Belanja': 'shopping-cart',
    'Hiburan': 'film',
    'Tagihan': 'zap',
    'Kesehatan': 'heart',
    'Pendidikan': 'book',
    'Lainnya': 'package',
  }
  return icons[category] || 'circle'
}

// Get category color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Gaji': '#10B981',
    'Bonus': '#8B5CF6',
    'Investasi': '#F59E0B',
    'Makanan': '#EF4444',
    'Transportasi': '#3B82F6',
    'Belanja': '#EC4899',
    'Hiburan': '#8B5CF6',
    'Tagihan': '#F97316',
    'Kesehatan': '#EF4444',
    'Pendidikan': '#3B82F6',
    'Lainnya': '#6B7280',
  }
  return colors[category] || '#6B7280'
}
