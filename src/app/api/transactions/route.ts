import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/transactions - Get all user transactions with filters
export async function GET(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const walletId = searchParams.get('walletId')
    const categoryId = searchParams.get('categoryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Prisma.TransactionWhereInput = {
      userId,
    }

    if (type) where.type = type
    if (walletId) where.walletId = walletId
    if (categoryId) where.categoryId = categoryId
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          wallet: { select: { id: true, name: true, icon: true, color: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      }),
      db.transaction.count({ where }),
    ])

    // Calculate totals
    const totals = await db.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    })

    const incomeTotal = totals.find(t => t.type === 'income')?._sum.amount || 0
    const expenseTotal = totals.find(t => t.type === 'expense')?._sum.amount || 0

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        income: incomeTotal,
        expense: expenseTotal,
        balance: incomeTotal - expenseTotal,
      },
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    const { walletId, categoryId, type, amount, description, date, notes, tags, isRecurring, recurringId } = body

    if (!walletId || !type || !amount) {
      return NextResponse.json(
        { error: 'Dompet, jenis, dan jumlah harus diisi' },
        { status: 400 }
      )
    }

    // Verify wallet belongs to user
    const wallet = await db.wallet.findFirst({
      where: { id: walletId, userId },
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Dompet tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create transaction and update wallet balance
    const [transaction] = await db.$transaction([
      db.transaction.create({
        data: {
          userId,
          walletId,
          categoryId,
          type,
          amount,
          description,
          date: date ? new Date(date) : new Date(),
          notes,
          tags,
          isRecurring: isRecurring || false,
          recurringId,
        },
        include: {
          wallet: { select: { id: true, name: true, icon: true, color: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      }),
      // Update wallet balance
      db.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: type === 'income' ? amount : -amount,
          },
        },
      }),
    ])

    return NextResponse.json({
      message: 'Transaksi berhasil ditambahkan',
      transaction,
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
