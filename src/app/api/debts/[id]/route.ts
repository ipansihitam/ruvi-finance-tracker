import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// PUT /api/debts/[id] - Update debt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, type, totalAmount, paidAmount, interestRate, dueDate, description, contact, isPaid } = body

    const existing = await db.debt.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Hutang tidak ditemukan' },
        { status: 404 }
      )
    }

    const debt = await db.debt.update({
      where: { id },
      data: {
        name,
        type,
        totalAmount,
        paidAmount,
        interestRate,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        description,
        contact,
        isPaid,
      },
    })

    return NextResponse.json({
      message: 'Hutang berhasil diperbarui',
      debt,
    })
  } catch (error) {
    console.error('Update debt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/debts/[id] - Delete debt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const debt = await db.debt.findFirst({
      where: { id, userId },
    })

    if (!debt) {
      return NextResponse.json(
        { error: 'Hutang tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.debt.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Hutang berhasil dihapus' })
  } catch (error) {
    console.error('Delete debt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
