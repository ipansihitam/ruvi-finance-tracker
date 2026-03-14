import { NextRequest, NextResponse } from 'next/server'
import { getDemoUser, getDemoUserId } from '@/lib/demo-user'
import { db } from '@/lib/db'

// GET /api/settings - Get user settings
export async function GET() {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    let settings = await db.userSettings.findUnique({
      where: { userId },
    })

    // Create default settings if not exists
    if (!settings) {
      settings = await db.userSettings.create({
        data: {
          userId,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    await getDemoUser() // Ensure demo user exists
    const userId = getDemoUserId()

    const body = await request.json()
    const { currency, language, theme, dateFormat, startOfWeek, defaultWalletId, enableNotifications, enableReminders, monthlyReport } = body

    const settings = await db.userSettings.upsert({
      where: { userId },
      update: {
        currency,
        language,
        theme,
        dateFormat,
        startOfWeek,
        defaultWalletId,
        enableNotifications,
        enableReminders,
        monthlyReport,
      },
      create: {
        userId,
        currency,
        language,
        theme,
        dateFormat,
        startOfWeek,
        defaultWalletId,
        enableNotifications,
        enableReminders,
        monthlyReport,
      },
    })

    return NextResponse.json({
      message: 'Pengaturan berhasil disimpan',
      settings,
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
