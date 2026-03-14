import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// PUT /api/budgets/[id] - Update budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, categoryId, amount, period, startDate, endDate, isActive } = body

    const existing = await db.budget.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Anggaran tidak ditemukan' },
        { status: 404 }
      )
    }

    const budget = await db.budget.update({
      where: { id },
      data: {
        name,
        categoryId,
        amount,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    return NextResponse.json({
      message: 'Anggaran berhasil diperbarui',
      budget,
    })
  } catch (error) {
    console.error('Update budget error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/budgets/[id] - Delete budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const budget = await db.budget.findFirst({
      where: { id, userId },
    })

    if (!budget) {
      return NextResponse.json(
        { error: 'Anggaran tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.budget.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Anggaran berhasil dihapus' })
  } catch (error) {
    console.error('Delete budget error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
