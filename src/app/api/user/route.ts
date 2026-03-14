import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/user - Get current user profile
export async function GET() {
  try {
    const user = await getDemoUser()
    const userId = getDemoUserId()

    const userWithStats = await db.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        _count: {
          select: {
            wallets: true,
            transactions: true,
            budgets: true,
            debts: true,
            goals: true,
          },
        },
      },
    })

    if (!userWithStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: userWithStats.id,
        name: userWithStats.name,
        email: userWithStats.email,
        image: userWithStats.image,
        settings: userWithStats.settings,
        stats: userWithStats._count,
        createdAt: userWithStats.createdAt,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, image } = body

    const user = await db.user.update({
      where: { id: userId },
      data: {
        name,
        image,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
