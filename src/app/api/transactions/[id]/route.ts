import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/transactions/[id] - Get specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const transaction = await db.transaction.findFirst({
      where: { id, userId },
      include: {
        wallet: true,
        category: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const body = await request.json()
    const { walletId, categoryId, type, amount, description, date, notes, tags } = body

    // Get existing transaction
    const existing = await db.transaction.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Calculate balance changes
    const oldAmount = existing.amount
    const oldType = existing.type
    const newAmount = amount ?? oldAmount
    const newType = type ?? oldType

    // Reverse old transaction effect
    const oldBalanceChange = oldType === 'income' ? -oldAmount : oldAmount

    // Apply new transaction effect
    const newBalanceChange = newType === 'income' ? newAmount : -newAmount

    // Update transaction and wallet balance
    const [transaction] = await db.$transaction([
      db.transaction.update({
        where: { id },
        data: {
          walletId: walletId ?? existing.walletId,
          categoryId,
          type: newType,
          amount: newAmount,
          description,
          date: date ? new Date(date) : existing.date,
          notes,
          tags,
        },
        include: {
          wallet: { select: { id: true, name: true, icon: true, color: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      }),
      // Update wallet balance
      db.wallet.update({
        where: { id: walletId ?? existing.walletId },
        data: {
          balance: {
            increment: oldBalanceChange + newBalanceChange,
          },
        },
      }),
    ])

    return NextResponse.json({
      message: 'Transaksi berhasil diperbarui',
      transaction,
    })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    // Get transaction
    const transaction = await db.transaction.findFirst({
      where: { id, userId },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete transaction and reverse balance
    await db.$transaction([
      db.transaction.delete({
        where: { id },
      }),
      db.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: transaction.type === 'income' ? -transaction.amount : transaction.amount,
          },
        },
      }),
    ])

    return NextResponse.json({ message: 'Transaksi berhasil dihapus' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
