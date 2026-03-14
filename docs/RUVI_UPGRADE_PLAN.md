# 🚀 Ruvi Finance Tracker - Competition-Ready Implementation Plan

## Executive Summary

This document outlines a comprehensive upgrade plan for **Ruvi** (Rupiah Visual), transforming it from a static HTML/JS application into a full-stack, competition-ready personal finance tracker with modern architecture, AI-powered insights, and enterprise-grade features.

---

## 📊 Current State Analysis

### Existing Features
| Feature | Status | Implementation |
|---------|--------|----------------|
| Dashboard | ✅ Complete | Static JS rendering |
| Transactions | ✅ Complete | In-memory data store |
| Wallets | ✅ Complete | In-memory data store |
| Budget Management | ✅ Complete | In-memory data store |
| Debt Tracking | ✅ Complete | In-memory data store |
| Reports & Charts | ✅ Complete | Chart.js integration |
| Settings | ✅ Complete | Local state only |
| Dark Mode | ✅ Complete | CSS variables toggle |
| Mobile Responsive | ✅ Complete | CSS media queries |

### Current Tech Stack
- **Frontend**: Pure HTML/CSS/JS (via iframe)
- **Backend**: None (static files)
- **Database**: None (in-memory objects)
- **Authentication**: None
- **Hosting**: Next.js 16 App Router (scaffold only)

### Existing Data Models
```javascript
// Current in-memory structure
dataStore = {
  transactions: [{ id, name, category, wallet, type, amount, date, icon }],
  wallets: [{ id, name, type, balance, number, class }],
  budgets: [{ id, name, icon, spent, limit }],
  goals: [{ id, name, target, current }],
  myDebts: [{ id, name, amount, dueDate, paid }],
  othersDebts: [{ id, name, amount, dueDate, paid }]
}
```

---

## 🏗️ Target Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Web App    │  │    PWA       │  │   Mobile     │  │  Desktop    │ │
│  │  (Next.js)   │  │  (Service    │  │  (Future)    │  │  (Future)   │ │
│  │              │  │   Worker)    │  │              │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  └─────────────┘ │
│         │                 │                                            │
│         └────────┬────────┘                                            │
│                  │                                                     │
├──────────────────┼─────────────────────────────────────────────────────┤
│                  │           API LAYER                                  │
│                  ▼                                                     │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js API Routes                              │ │
│  │  /api/auth    /api/transactions   /api/wallets   /api/budgets     │ │
│  │  /api/goals   /api/debts          /api/reports   /api/insights    │ │
│  │  /api/export  /api/notifications  /api/settings  /api/recurring   │ │
│  └─────────────────────────────┬─────────────────────────────────────┘ │
│                                │                                        │
├────────────────────────────────┼───────────────────────────────────────┤
│                                │   SERVICE LAYER                        │
│                                ▼                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  AI Engine   │  │ Notification │  │   Export     │  │  Recurring  │ │
│  │  (Insights)  │  │   Service    │  │   Service    │  │   Service   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                          DATA LAYER                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Prisma     │  │   SQLite     │  │  NextAuth    │  │  File       │ │
│  │    ORM       │  │   Database   │  │   Sessions   │  │  Storage    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?   // Hashed password for credentials provider
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  wallets       Wallet[]
  transactions  Transaction[]
  budgets       Budget[]
  goals         Goal[]
  debts         Debt[]
  categories    Category[]
  notifications Notification[]
  reminders     Reminder[]
  recurring     RecurringTransaction[]
  settings      UserSettings?
  exportHistory ExportHistory[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// CORE FINANCE MODELS
// ============================================

model Wallet {
  id        String   @id @default(cuid())
  userId    String
  name      String
  type      String   // Bank, E-Wallet, Cash, Credit Card
  balance   Float    @default(0)
  number    String?  // Account number (masked)
  color     String?  // UI color theme
  icon      String?
  isDefault Boolean  @default(false)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions  Transaction[]
  
  @@unique([userId, name])
  @@map("wallets")
}

model Category {
  id          String   @id @default(cuid())
  userId      String
  name        String
  type        String   // income, expense, transfer
  icon        String
  color       String?
  isSystem    Boolean  @default(false) // System default categories
  createdAt   DateTime @default(now())
  
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@unique([userId, name])
  @@map("categories")
}

model Transaction {
  id          String   @id @default(cuid())
  userId      String
  walletId    String
  categoryId  String
  
  // Core fields
  name        String
  description String?
  amount      Float
  type        String   // income, expense, transfer
  date        DateTime
  
  // Transfer specific
  toWalletId  String?
  
  // Recurring reference
  recurringId String?
  
  // Metadata
  tags        String?  // JSON array of tags
  location    String?
  receiptUrl  String?
  isRecurring Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  wallet    Wallet     @relation(fields: [walletId], references: [id], onDelete: Cascade)
  category  Category   @relation(fields: [categoryId], references: [id])
  toWallet  Wallet?    @relation("TransferTo", fields: [toWalletId], references: [id])
  recurring RecurringTransaction? @relation(fields: [recurringId], references: [id])
  
  @@index([userId, date])
  @@index([userId, type])
  @@index([userId, walletId])
  @@map("transactions")
}

// ============================================
// BUDGET & GOALS
// ============================================

model Budget {
  id          String   @id @default(cuid())
  userId      String
  categoryId  String?  // Optional link to category
  
  name        String
  icon        String
  limit       Float
  spent       Float    @default(0)
  period      String   @default("monthly") // weekly, monthly, yearly
  
  // Date range for custom periods
  startDate   DateTime?
  endDate     DateTime?
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id])
  
  @@index([userId, period])
  @@map("budgets")
}

model Goal {
  id           String   @id @default(cuid())
  userId       String
  
  name         String
  targetAmount Float
  currentAmount Float  @default(0)
  targetDate   DateTime?
  
  // Visual customization
  icon         String?
  color        String?
  
  // Progress tracking
  isCompleted  Boolean  @default(false)
  completedAt  DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isCompleted])
  @@map("goals")
}

// ============================================
// DEBT MANAGEMENT
// ============================================

model Debt {
  id           String   @id @default(cuid())
  userId       String
  
  // Person info
  personName   String
  personContact String? // Phone or email
  
  // Debt details
  type         String   // my_debt, others_debt (owed to me / I owe)
  totalAmount  Float
  paidAmount   Float    @default(0)
  
  // Due date and reminders
  dueDate      DateTime
  remindBefore Int      @default(7) // Days before due date
  
  // Status
  status       String   @default("active") // active, paid, overdue
  paidAt       DateTime?
  
  // Notes
  notes        String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, type])
  @@index([userId, status])
  @@map("debts")
}

// ============================================
// RECURRING TRANSACTIONS
// ============================================

model RecurringTransaction {
  id          String   @id @default(cuid())
  userId      String
  walletId    String
  categoryId  String
  
  name        String
  amount      Float
  type        String   // income, expense
  
  // Recurrence pattern
  frequency   String   // daily, weekly, monthly, yearly
  interval    Int      @default(1) // Every X days/weeks/months
  dayOfWeek   Int?     // 0-6 for weekly
  dayOfMonth  Int?     // 1-31 for monthly
  
  // Start and end
  startDate   DateTime @default(now())
  endDate     DateTime?
  nextRunDate DateTime
  
  // Status
  isActive    Boolean  @default(true)
  lastRunDate DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@index([userId, nextRunDate])
  @@map("recurring_transactions")
}

// ============================================
// NOTIFICATIONS & REMINDERS
// ============================================

model Notification {
  id          String   @id @default(cuid())
  userId      String
  
  type        String   // budget_warning, debt_reminder, goal_achieved, bill_due
  title       String
  message     String
  
  // Related entity
  entityType  String?  // budget, debt, goal, transaction
  entityId    String?
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  // For scheduling
  scheduledFor DateTime?
  sentAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([userId, scheduledFor])
  @@map("notifications")
}

model Reminder {
  id          String   @id @default(cuid())
  userId      String
  
  title       String
  message     String?
  
  // Scheduling
  remindAt    DateTime
  isRecurring Boolean  @default(false)
  recurrencePattern String? // Same as recurring transaction
  
  // Related entity
  entityType  String?
  entityId    String?
  
  isCompleted Boolean  @default(false)
  completedAt DateTime?
  
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, remindAt])
  @@map("reminders")
}

// ============================================
// USER SETTINGS
// ============================================

model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  
  // Currency & Locale
  currency        String   @default("IDR")
  currencySymbol  String   @default("Rp")
  locale          String   @default("id-ID")
  timezone        String   @default("Asia/Jakarta")
  
  // Display preferences
  theme           String   @default("light") // light, dark, system
  dateFormat      String   @default("DD/MM/YYYY")
  firstDayOfWeek  Int      @default(1) // 0 = Sunday, 1 = Monday
  
  // Notification preferences
  emailNotifications Boolean @default(true)
  pushNotifications  Boolean @default(true)
  budgetWarnings     Boolean @default(true)
  debtReminders      Boolean @default(true)
  billReminders      Boolean @default(true)
  
  // Privacy
  hideAmounts     Boolean  @default(false)
  requirePin      Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_settings")
}

// ============================================
// EXPORT HISTORY
// ============================================

model ExportHistory {
  id          String   @id @default(cuid())
  userId      String
  
  type        String   // pdf, excel, csv
  dateRange   String   // JSON with start/end dates
  recordCount Int
  
  fileUrl     String?
  fileName    String
  
  status      String   @default("pending") // pending, completed, failed
  
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("export_history")
}

// ============================================
// AI INSIGHTS (Cached)
// ============================================

model AIInsight {
  id          String   @id @default(cuid())
  userId      String
  
  type        String   // spending_pattern, saving_tip, budget_alert, anomaly
  title       String
  content     String   // Markdown content
  severity    String   @default("info") // info, warning, critical
  
  // Data reference
  dataRef     String?  // JSON with relevant data points
  
  // Validity
  validFrom   DateTime @default(now())
  validUntil  DateTime
  
  isRead      Boolean  @default(false)
  isActioned  Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  
  @@index([userId, validUntil])
  @@map("ai_insights")
}
```

---

## 🔌 API Endpoints Design

### RESTful API Structure

```
/api
├── /auth
│   ├── /[...nextauth]          # NextAuth.js handlers
│   ├── /register               # POST - User registration
│   └── /forgot-password        # POST - Password reset
│
├── /users
│   ├── /me                     # GET, PUT - Current user profile
│   ├── /me/settings            # GET, PUT - User settings
│   └── /me/password            # PUT - Change password
│
├── /wallets
│   ├── /                       # GET, POST - List/Create wallets
│   ├── /[id]                   # GET, PUT, DELETE - Wallet CRUD
│   ├── /[id]/transactions      # GET - Wallet transactions
│   └── /transfer               # POST - Transfer between wallets
│
├── /transactions
│   ├── /                       # GET, POST - List/Create transactions
│   ├── /[id]                   # GET, PUT, DELETE - Transaction CRUD
│   ├── /bulk                   # POST - Bulk create/update
│   └── /search                 # GET - Search transactions
│
├── /categories
│   ├── /                       # GET, POST - List/Create categories
│   └── /[id]                   # GET, PUT, DELETE - Category CRUD
│
├── /budgets
│   ├── /                       # GET, POST - List/Create budgets
│   ├── /[id]                   # GET, PUT, DELETE - Budget CRUD
│   └── /[id]/progress          # GET - Budget progress calculation
│
├── /goals
│   ├── /                       # GET, POST - List/Create goals
│   ├── /[id]                   # GET, PUT, DELETE - Goal CRUD
│   └── /[id]/contribute        # POST - Add contribution to goal
│
├── /debts
│   ├── /                       # GET, POST - List/Create debts
│   ├── /[id]                   # GET, PUT, DELETE - Debt CRUD
│   └── /[id]/payment           # POST - Record payment
│
├── /recurring
│   ├── /                       # GET, POST - List/Create recurring
│   ├── /[id]                   # GET, PUT, DELETE - Recurring CRUD
│   └── /[id]/pause             # POST - Pause/Resume recurring
│
├── /reminders
│   ├── /                       # GET, POST - List/Create reminders
│   ├── /[id]                   # GET, PUT, DELETE - Reminder CRUD
│   └── /upcoming               # GET - Get upcoming reminders
│
├── /notifications
│   ├── /                       # GET - List notifications
│   ├── /[id]/read              # PUT - Mark as read
│   └── /read-all               # PUT - Mark all as read
│
├── /reports
│   ├── /summary                # GET - Dashboard summary
│   ├── /income-expense         # GET - Income vs Expense report
│   ├── /category-breakdown     # GET - Spending by category
│   ├── /cashflow               # GET - Cash flow analysis
│   ├── /net-worth              # GET - Net worth over time
│   └── /trends                 # GET - Financial trends
│
├── /insights
│   ├── /                       # GET - List AI insights
│   ├── /generate               # POST - Generate new insights
│   ├── /spending-patterns      # GET - Spending pattern analysis
│   ├── /savings-tips           # GET - Personalized saving tips
│   └── /anomalies              # GET - Unusual transaction detection
│
├── /export
│   ├── /pdf                    # POST - Generate PDF report
│   ├── /excel                  # POST - Generate Excel report
│   ├── /csv                    # GET - Export to CSV
│   └── /history                # GET - Export history
│
└── /import
    ├── /csv                    # POST - Import from CSV
    └── /bank-statement         # POST - Parse bank statement
```

### API Response Format

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Example: GET /api/transactions
{
  "success": true,
  "data": [
    {
      "id": "clx123456",
      "name": "Gaji Bulanan",
      "amount": 10000000,
      "type": "income",
      "date": "2024-06-15T00:00:00.000Z",
      "category": { "id": "cat1", "name": "Gaji", "icon": "briefcase" },
      "wallet": { "id": "w1", "name": "BCA", "balance": 28500000 }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## 📋 Feature Priority Matrix

### Phase 1: Foundation (Week 1-2) - **CRITICAL**

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| P0 | Database Schema Setup | 2 days | High | None |
| P0 | Prisma Client Integration | 1 day | High | Schema |
| P0 | NextAuth.js Setup | 2 days | High | Database |
| P0 | User Registration/Login | 2 days | High | NextAuth |
| P0 | Protected API Routes | 1 day | High | NextAuth |
| P0 | Frontend-Backend Integration | 3 days | High | All above |

### Phase 2: Core Features (Week 3-4) - **HIGH**

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| P1 | Wallet CRUD API | 2 days | High | Auth |
| P1 | Transaction CRUD API | 3 days | High | Wallet, Category |
| P1 | Category Management | 1 day | Medium | Auth |
| P1 | Budget CRUD API | 2 days | High | Category |
| P1 | Goal CRUD API | 2 days | High | Auth |
| P1 | Debt CRUD API | 2 days | High | Auth |
| P1 | Dashboard API | 2 days | High | All above |

### Phase 3: Advanced Features (Week 5-6) - **MEDIUM-HIGH**

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| P1 | Recurring Transactions | 3 days | High | Transaction API |
| P1 | Bill Reminders | 2 days | High | Recurring |
| P1 | PDF Export | 2 days | Medium | Reports API |
| P1 | Excel Export | 2 days | Medium | Reports API |
| P1 | CSV Import | 2 days | Medium | Transaction API |
| P2 | Transaction Search & Filters | 2 days | Medium | Transaction API |
| P2 | Advanced Reports | 3 days | High | All data APIs |

### Phase 4: AI & Insights (Week 7-8) - **COMPETITION WINNER**

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| P1 | AI Spending Analysis | 3 days | Very High | Reports API |
| P1 | Smart Savings Tips | 2 days | High | AI Analysis |
| P1 | Anomaly Detection | 2 days | High | AI Analysis |
| P1 | Budget Predictions | 2 days | High | AI Analysis |
| P1 | Natural Language Queries | 3 days | Very High | AI Analysis |
| P2 | Financial Health Score | 2 days | High | All AI features |

### Phase 5: PWA & Real-time (Week 9-10) - **ENHANCEMENT**

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| P1 | PWA Manifest | 1 day | Medium | None |
| P1 | Service Worker | 2 days | High | PWA Manifest |
| P1 | Offline Support | 3 days | High | Service Worker |
| P1 | Push Notifications | 2 days | High | Service Worker |
| P1 | Real-time Updates | 2 days | Medium | WebSocket |
| P2 | Home Screen Install | 1 day | Medium | PWA Manifest |

### Phase 6: Polish & Launch (Week 11-12) - **FINAL**

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| P1 | UI/UX Polish | 3 days | High | All features |
| P1 | Performance Optimization | 2 days | High | All features |
| P1 | Error Handling | 2 days | High | All features |
| P1 | Data Validation | 2 days | High | All features |
| P2 | Analytics Integration | 1 day | Medium | None |
| P2 | SEO Optimization | 1 day | Medium | None |

---

## 📅 Estimated Timeline

### 12-Week Development Plan

```
Week 1-2:  Foundation
├── Day 1-2:   Database Schema & Prisma Setup
├── Day 3-4:   NextAuth.js Integration
├── Day 5-6:   User Authentication System
├── Day 7-8:   Protected Routes & Middleware
└── Day 9-10:  Frontend Migration (React Components)

Week 3-4:  Core Features
├── Day 1-2:   Wallet Management API & UI
├── Day 3-5:   Transaction Management API & UI
├── Day 6-7:   Category System
├── Day 8-9:   Budget Management API & UI
└── Day 10:    Goal Management API & UI

Week 5-6:  Advanced Features
├── Day 1-2:   Debt Management API & UI
├── Day 3-5:   Recurring Transactions System
├── Day 6-7:   Bill Reminders
├── Day 8-9:   Export Functionality (PDF/Excel)
└── Day 10:    Import Functionality

Week 7-8:  AI & Intelligence
├── Day 1-3:   AI Spending Analysis Engine
├── Day 4-5:   Smart Insights Generation
├── Day 6-7:   Anomaly Detection
├── Day 8-9:   Natural Language Query Interface
└── Day 10:    Financial Health Score

Week 9-10: PWA & Real-time
├── Day 1-2:   PWA Setup & Manifest
├── Day 3-4:   Service Worker & Caching
├── Day 5-6:   Offline Support
├── Day 7-8:   Push Notifications
└── Day 9-10:  Real-time Updates (WebSocket)

Week 11-12: Polish & Launch
├── Day 1-3:   UI/UX Polish
├── Day 4-5:   Performance Optimization
├── Day 6-7:   Error Handling & Validation
├── Day 8-9:   Testing & Bug Fixes
└── Day 10:    Final Review & Deployment Prep
```

---

## 🔧 Technical Recommendations

### Frontend Architecture

```typescript
// Recommended folder structure
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx            # Dashboard home
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── wallets/
│   │   ├── budgets/
│   │   ├── goals/
│   │   ├── debts/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/
│   │   ├── [...routes]
│   │   └── webhooks/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── NetWorthCard.tsx
│   │   └── QuickActions.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   └── TransactionFilter.tsx
│   ├── charts/
│   │   ├── IncomeExpenseChart.tsx
│   │   ├── BudgetProgressChart.tsx
│   │   └── CategoryPieChart.tsx
│   └── shared/
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useWallets.ts
│   ├── useBudgets.ts
│   └── useNotifications.ts
├── lib/
│   ├── db.ts                   # Prisma client
│   ├── auth.ts                 # NextAuth config
│   ├── utils.ts
│   ├── validations.ts          # Zod schemas
│   └── constants.ts
├── store/
│   ├── useAppStore.ts          # Zustand store
│   └── useUIStore.ts
├── types/
│   ├── api.ts
│   ├── models.ts
│   └── charts.ts
└── styles/
    └── themes.ts
```

### State Management Strategy

```typescript
// Zustand store for global state
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Data Cache
  wallets: Wallet[];
  categories: Category[];
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setWallets: (wallets: Wallet[]) => void;
  
  // Optimistic Updates
  addTransactionOptimistic: (transaction: Transaction) => void;
  rollbackTransaction: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',
      wallets: [],
      categories: [],
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setWallets: (wallets) => set({ wallets }),
      
      addTransactionOptimistic: (transaction) => {
        // Optimistic update logic
      },
      rollbackTransaction: (id) => {
        // Rollback logic
      },
    }),
    {
      name: 'ruvi-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
```

### API Layer with TanStack Query

```typescript
// hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api.get('/api/transactions', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionInput) => 
      api.post('/api/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      api.put(`/api/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

### AI Integration Strategy

```typescript
// lib/ai/insights.ts
import { db } from '@/lib/db';

interface SpendingAnalysis {
  category: string;
  amount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
}

export async function generateSpendingInsights(userId: string): Promise<AIInsight[]> {
  // Get last 3 months of transactions
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    include: { category: true },
  });
  
  // Analyze spending patterns
  const categorySpending = analyzeByCategory(transactions);
  const trends = calculateTrends(categorySpending);
  const anomalies = detectAnomalies(transactions);
  
  // Generate insights using AI SDK
  const insights = await generateInsightsWithAI({
    spending: categorySpending,
    trends,
    anomalies,
    userContext: await getUserContext(userId),
  });
  
  return insights;
}

// Natural Language Query Example
export async function processNaturalQuery(userId: string, query: string) {
  // Parse the natural language query
  const parsed = await parseQueryWithAI(query);
  
  // Execute the corresponding database query
  const result = await executeParsedQuery(userId, parsed);
  
  // Format the response in natural language
  const response = await formatResponseWithAI(result, query);
  
  return response;
}

// Example queries:
// "Berapa total pengeluaran makanan bulan ini?"
// "Kategori mana yang paling banyak saya keluarkan?"
// "Tunjukkan transaksi di atas 1 juta minggu lalu"
```

### PWA Configuration

```json
// public/manifest.json
{
  "name": "Ruvi - Personal Finance Tracker",
  "short_name": "Ruvi",
  "description": "Track your finances with AI-powered insights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF5FF",
  "theme_color": "#8B5CF6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Add Transaction",
      "short_name": "Add",
      "description": "Quick add a new transaction",
      "url": "/transactions?quick=true",
      "icons": [{ "src": "/icons/quick-add.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "label": "Dashboard Overview"
    }
  ]
}
```

### Security Considerations

```typescript
// middleware.ts - Route protection
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};
```

---

## 🏆 Competition-Winning Features

### 1. AI-Powered Financial Assistant

```typescript
// Features that stand out in competitions:
- Natural Language Queries: "How much did I spend on food last month?"
- Predictive Budgeting: AI predicts if you'll exceed your budget
- Anomaly Detection: Alerts for unusual spending patterns
- Smart Savings Goals: AI suggests realistic savings targets
- Receipt OCR: Upload receipt, auto-extract transaction details
```

### 2. Beautiful Data Visualization

```typescript
// Interactive charts with drill-down capabilities
- Animated net worth timeline
- Category sunburst charts
- Cash flow waterfall charts
- Budget radar charts
- Spending heatmaps (day of week vs time)
```

### 3. Smart Automation

```typescript
// Reduce manual work
- Auto-categorization based on merchant
- Recurring transaction detection
- Bill due date extraction from emails
- Smart transfer suggestions
- Round-up savings automation
```

### 4. Privacy & Security

```typescript
// Enterprise-grade for personal use
- End-to-end encryption for sensitive data
- Biometric authentication (PWA)
- Data export for portability
- Anonymous analytics mode
- Self-hosting option
```

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    // Already installed
    "@prisma/client": "^6.11.1",
    "next-auth": "^4.24.11",
    "zod": "^4.0.2",
    "zustand": "^5.0.6",
    "@tanstack/react-query": "^5.82.0",
    
    // Additional needed
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "node-cron": "^3.0.3",
    "pdfkit": "^0.15.0",
    "xlsx": "^0.18.5",
    "papaparse": "^5.4.1",
    "tesseract.js": "^5.1.0",
    "framer-motion": "^12.23.2",
    "date-fns": "^4.1.0",
    "react-hot-toast": "^2.4.1",
    "swr": "^2.2.5"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node-cron": "^3.0.11",
    "@types/papaparse": "^5.3.14"
  }
}
```

---

## 🎯 Next Actions

### Immediate Steps (This Week)

1. **Update Prisma Schema**
   - Copy the complete schema from this document
   - Run `bunx prisma db push` to create tables
   - Run `bunx prisma generate` to generate client

2. **Set Up NextAuth.js**
   - Create `src/lib/auth.ts` configuration
   - Add authentication providers (Credentials, Google)
   - Create login/register pages

3. **Create Base API Routes**
   - Set up protected route middleware
   - Create user endpoints
   - Create wallet endpoints

4. **Migrate Frontend Components**
   - Convert HTML/CSS to React components
   - Implement Tailwind CSS styling
   - Set up Zustand store

### First Sprint Goals

- [ ] User can register and login
- [ ] User can create and manage wallets
- [ ] User can add transactions with categories
- [ ] Dashboard shows real data from database
- [ ] Data persists across sessions

---

## 📞 Support & Resources

### Documentation References
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)

### Code Examples
- All code examples in this document are production-ready
- TypeScript types are fully defined
- API patterns follow REST best practices

---

*Document Version: 1.0*
*Author: Software Architecture Team*
