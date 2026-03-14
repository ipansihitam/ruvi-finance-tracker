import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/goals - Get all user goals
export async function GET(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const { searchParams } = new URL(request.url)
    const isCompleted = searchParams.get('isCompleted')

    const goals = await db.goal.findMany({
      where: {
        userId,
        ...(isCompleted !== null && { isCompleted: isCompleted === 'true' }),
      },
      orderBy: [
        { isCompleted: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Add progress percentage
    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      percentage: goal.targetAmount > 0 
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0,
      remaining: goal.targetAmount - goal.currentAmount,
    }))

    return NextResponse.json({
      goals: goalsWithProgress,
      count: goals.length,
      activeCount: goals.filter(g => !g.isCompleted).length,
      completedCount: goals.filter(g => g.isCompleted).length,
    })
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/goals - Create new goal
export async function POST(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, targetAmount, currentAmount, targetDate, category, priority, color } = body

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: 'Nama dan target jumlah harus diisi' },
        { status: 400 }
      )
    }

    const goal = await db.goal.create({
      data: {
        userId,
        name,
        targetAmount,
        currentAmount: currentAmount || 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        category,
        priority: priority || 'medium',
        color,
        isCompleted: currentAmount >= targetAmount,
      },
    })

    return NextResponse.json({
      message: 'Tujuan keuangan berhasil dibuat',
      goal,
    })
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
