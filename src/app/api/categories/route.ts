import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/categories - Get all user categories
export async function GET(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: { userId: string; type?: string } = {
      userId,
    }
    if (type) where.type = type

    const categories = await db.category.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { transactions: true } },
      },
    })

    // Group by type
    const grouped = {
      income: categories.filter(c => c.type === 'income'),
      expense: categories.filter(c => c.type === 'expense'),
    }

    return NextResponse.json({
      categories,
      grouped,
      count: categories.length,
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, type, icon, color, budget } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nama dan jenis kategori harus diisi' },
        { status: 400 }
      )
    }

    // Check if category with same name exists
    const existing = await db.category.findFirst({
      where: { userId, name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Kategori dengan nama tersebut sudah ada' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        userId,
        name,
        type,
        icon,
        color,
        budget,
      },
    })

    return NextResponse.json({
      message: 'Kategori berhasil dibuat',
      category,
    })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
