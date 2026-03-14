import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/budgets - Get all user budgets
export async function GET(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const budgets = await db.budget.findMany({
      where: {
        userId,
        ...(isActive === 'true' && { isActive: true }),
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate percentage spent
    const budgetsWithProgress = budgets.map(budget => ({
      ...budget,
      percentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
      remaining: budget.amount - budget.spent,
      status: budget.spent >= budget.amount ? 'exceeded' : 
              budget.spent >= budget.amount * 0.8 ? 'warning' : 'safe',
    }))

    return NextResponse.json({
      budgets: budgetsWithProgress,
      count: budgets.length,
    })
  } catch (error) {
    console.error('Get budgets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/budgets - Create new budget
export async function POST(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, categoryId, amount, period, startDate, endDate } = body

    if (!name || !amount) {
      return NextResponse.json(
        { error: 'Nama dan jumlah anggaran harus diisi' },
        { status: 400 }
      )
    }

    const budget = await db.budget.create({
      data: {
        userId,
        name,
        categoryId,
        amount,
        period: period || 'monthly',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    return NextResponse.json({
      message: 'Anggaran berhasil dibuat',
      budget,
    })
  } catch (error) {
    console.error('Create budget error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
