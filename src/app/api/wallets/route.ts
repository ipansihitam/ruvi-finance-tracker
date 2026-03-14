import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/wallets - Get all user wallets
export async function GET() {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const wallets = await db.wallet.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: {
        _count: { select: { transactions: true } },
      },
    })

    // Calculate total balance
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

    return NextResponse.json({
      wallets,
      totalBalance,
      count: wallets.length,
    })
  } catch (error) {
    console.error('Get wallets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/wallets - Create new wallet
export async function POST(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, type, balance, number, color, icon, isDefault } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nama dan jenis dompet harus diisi' },
        { status: 400 }
      )
    }

    // Check if wallet with same name exists
    const existing = await db.wallet.findFirst({
      where: { userId, name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Dompet dengan nama tersebut sudah ada' },
        { status: 400 }
      )
    }

    // If this is default, remove default from other wallets
    if (isDefault) {
      await db.wallet.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const wallet = await db.wallet.create({
      data: {
        userId,
        name,
        type,
        balance: balance || 0,
        number,
        color,
        icon,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({
      message: 'Dompet berhasil dibuat',
      wallet,
    })
  } catch (error) {
    console.error('Create wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
