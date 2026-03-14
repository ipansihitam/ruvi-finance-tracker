import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/debts - Get all user debts
export async function GET(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isPaid = searchParams.get('isPaid')

    const where: { userId: string; type?: string; isPaid?: boolean } = {
      userId,
    }
    if (type) where.type = type
    if (isPaid !== null) where.isPaid = isPaid === 'true'

    const debts = await db.debt.findMany({
      where,
      orderBy: [{ isPaid: 'asc' }, { dueDate: 'asc' }],
    })

    // Group by type
    const myDebts = debts.filter(d => d.type === 'my_debt')
    const othersDebts = debts.filter(d => d.type === 'others_debt')

    // Calculate totals
    const totalDebt = myDebts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0)
    const totalReceivable = othersDebts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0)

    return NextResponse.json({
      debts,
      grouped: {
        myDebts,
        othersDebts,
      },
      summary: {
        totalDebt,
        totalReceivable,
        myDebtsCount: myDebts.length,
        othersDebtsCount: othersDebts.length,
      },
    })
  } catch (error) {
    console.error('Get debts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/debts - Create new debt
export async function POST(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    
    // Validate and parse all fields
    const name = body.name?.toString().trim()
    const type = body.type?.toString() || 'my_debt'
    const totalAmount = parseFloat(body.totalAmount || body.amount)
    const paidAmount = parseFloat(body.paidAmount) || 0
    const interestRate = parseFloat(body.interestRate) || 0
    const dueDate = body.dueDate
    const description = body.description?.toString().trim() || null
    const contact = body.contact?.toString().trim() || body.person?.toString().trim() || null

    // Validate required fields
    if (!name || name.length === 0) {
      return NextResponse.json(
        { error: 'Nama kreditur/debitur harus diisi' },
        { status: 400 }
      )
    }
    
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah hutang harus lebih dari 0' },
        { status: 400 }
      )
    }

    if (!['my_debt', 'others_debt'].includes(type)) {
      return NextResponse.json(
        { error: 'Jenis hutang tidak valid' },
        { status: 400 }
      )
    }

    const debt = await db.debt.create({
      data: {
        userId,
        name,
        type,
        totalAmount,
        paidAmount,
        interestRate,
        dueDate: dueDate ? new Date(dueDate) : null,
        description,
        contact,
      },
    })

    return NextResponse.json({
      message: type === 'my_debt' ? 'Hutang berhasil dicatat' : 'Piutang berhasil dicatat',
      debt,
    })
  } catch (error) {
    console.error('Create debt error:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan data hutang' },
      { status: 500 }
    )
  }
}
