import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/wallets/[id] - Get specific wallet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const wallet = await db.wallet.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          take: 20,
          orderBy: { date: 'desc' },
          include: {
            category: { select: { id: true, name: true, icon: true, color: true } },
          },
        },
        _count: { select: { transactions: true } },
      },
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Dompet tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ wallet })
  } catch (error) {
    console.error('Get wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/wallets/[id] - Update wallet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    const body = await request.json()
    const { name, type, balance, number, color, icon, isDefault } = body

    // Verify wallet belongs to user
    const existing = await db.wallet.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Dompet tidak ditemukan' },
        { status: 404 }
      )
    }

    // If setting as default, remove default from other wallets
    if (isDefault) {
      await db.wallet.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const wallet = await db.wallet.update({
      where: { id },
      data: {
        name,
        type,
        balance,
        number,
        color,
        icon,
        isDefault,
      },
    })

    return NextResponse.json({
      message: 'Dompet berhasil diperbarui',
      wallet,
    })
  } catch (error) {
    console.error('Update wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/wallets/[id] - Delete wallet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDemoUser()
    const { id } = await params
    const userId = getDemoUserId()

    // Verify wallet belongs to user
    const wallet = await db.wallet.findFirst({
      where: { id, userId },
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Dompet tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.wallet.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Dompet berhasil dihapus' })
  } catch (error) {
    console.error('Delete wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
