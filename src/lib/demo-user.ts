import { db } from './db'

const DEMO_USER_ID = 'demo-user-001'

export async function getDemoUser() {
  // Try to find existing demo user
  let user = await db.user.findUnique({
    where: { id: DEMO_USER_ID },
  })

  // Create demo user if not exists
  if (!user) {
    user = await db.user.create({
      data: {
        id: DEMO_USER_ID,
        name: 'Demo User',
        email: 'demo@ruvi.app',
        password: 'demo-password',
      },
    })

    // Create user settings
    await db.userSettings.create({
      data: {
        userId: DEMO_USER_ID,
        currency: 'IDR',
        language: 'id',
        theme: 'light',
      },
    })

    // Create default wallets
    const defaultWallets = [
      { name: 'Tunai', type: 'Cash', balance: 500000, isDefault: true, color: '#10B981' },
      { name: 'Bank BCA', type: 'Bank', balance: 2500000, color: '#3B82F6' },
      { name: 'GoPay', type: 'E-Wallet', balance: 150000, color: '#8B5CF6' },
    ]

    for (const wallet of defaultWallets) {
      await db.wallet.create({
        data: {
          userId: DEMO_USER_ID,
          name: wallet.name,
          type: wallet.type,
          balance: wallet.balance,
          isDefault: wallet.isDefault || false,
          color: wallet.color,
        },
      })
    }

    // Create default categories
    const defaultCategories = [
      { name: 'Gaji', type: 'income', icon: 'briefcase', color: '#10B981' },
      { name: 'Bonus', type: 'income', icon: 'gift', color: '#8B5CF6' },
      { name: 'Investasi', type: 'income', icon: 'trending-up', color: '#F59E0B' },
      { name: 'Makanan', type: 'expense', icon: 'utensils', color: '#EF4444' },
      { name: 'Transportasi', type: 'expense', icon: 'car', color: '#3B82F6' },
      { name: 'Belanja', type: 'expense', icon: 'shopping-cart', color: '#EC4899' },
      { name: 'Hiburan', type: 'expense', icon: 'film', color: '#8B5CF6' },
      { name: 'Tagihan', type: 'expense', icon: 'zap', color: '#F97316' },
      { name: 'Kesehatan', type: 'expense', icon: 'heart', color: '#EF4444' },
      { name: 'Pendidikan', type: 'expense', icon: 'book', color: '#3B82F6' },
    ]

    for (const category of defaultCategories) {
      await db.category.create({
        data: {
          userId: DEMO_USER_ID,
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
        },
      })
    }
  }

  return user
}

export function getDemoUserId() {
  return DEMO_USER_ID
}
