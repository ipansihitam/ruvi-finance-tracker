import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// PUT /api/goals/[id] - Update goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, targetAmount, currentAmount, targetDate, category, priority, color, isCompleted } = body

    const existing = await db.goal.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Tujuan tidak ditemukan' },
        { status: 404 }
      )
    }

    const goal = await db.goal.update({
      where: { id },
      data: {
        name,
        targetAmount,
        currentAmount,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        category,
        priority,
        color,
        isCompleted,
      },
    })

    return NextResponse.json({
      message: 'Tujuan berhasil diperbarui',
      goal,
    })
  } catch (error) {
    console.error('Update goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/[id] - Delete goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const goal = await db.goal.findFirst({
      where: { id, userId },
    })

    if (!goal) {
      return NextResponse.json(
        { error: 'Tujuan tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.goal.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tujuan berhasil dihapus' })
  } catch (error) {
    console.error('Delete goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
