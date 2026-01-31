# Phantom Cleaning - Full-Stack Admin Management System

## Executive Summary

**Phantom Cleaning** is a production-grade, full-stack MERN (MongoDB, Express.js, React, Node.js) SaaS-style administrative management system designed specifically for cleaning services businesses. The system provides comprehensive job scheduling, employee management, task tracking, expense management, and real-time analytics with on-demand Excel report generation.

**Deployment**: Frontend on Vercel, Backend on Render  
**Architecture**: RESTful API with JWT authentication, role-based access control  
**Database**: MongoDB with Mongoose ODM  
**Reporting**: On-demand Excel generation using ExcelJS

---

## Table of Contents

1. [Business Problem & Solution](#business-problem--solution)
2. [Real-World Workflow](#real-world-workflow)
3. [Tech Stack Justification](#tech-stack-justification)
4. [System Architecture](#system-architecture)
5. [Backend Documentation](#backend-documentation)
6. [Frontend Documentation](#frontend-documentation)
7. [API Reference](#api-reference)
8. [Database Schema Reference](#database-schema-reference)
9. [Excel Reporting Architecture](#excel-reporting-architecture)
10. [Security & Compliance](#security--compliance)
11. [Performance & Scalability](#performance--scalability)
12. [Environment Variables](#environment-variables)
13. [Local Setup Guide](#local-setup-guide)
14. [Production Deployment](#production-deployment)
15. [Known Limitations](#known-limitations)
16. [Future Roadmap](#future-roadmap)

---

## Business Problem & Solution

### Problem Statement

Cleaning services businesses face several operational challenges:
- **Manual Scheduling**: Paper-based or spreadsheet job tracking is error-prone
- **Employee Coordination**: Difficulty assigning cleaners to jobs across multiple Australian states
- **Financial Tracking**: No unified system to track revenue vs expenses
- **Reporting**: Monthly financial reports require manual Excel compilation
- **Task Visibility**: Managers cannot see real-time task status for field workers

### Solution

Phantom Cleaning provides:
- **Centralized Job Management**: Create, assign, and track cleaning jobs with real-time status updates
- **Multi-State Operations**: Support for Sydney, Melbourne, Adelaide, Perth, and Brisbane
- **Role-Based Access**: SuperAdmin, Admin, Manager, and Cleaner roles with appropriate permissions
- **Automated Task Creation**: Jobs automatically generate tasks for assigned employees
- **Expense Tracking**: Categorized expense management with approval workflows
- **Real-Time Analytics**: Dashboard with revenue, profit, and operational KPIs
- **On-Demand Reports**: Monthly Excel reports generated instantly with state-wise job breakdowns

### Target Users

- **SuperAdmin/Admin**: Full system access, expense management, dashboard analytics, report generation
- **Manager**: Job assignment, task monitoring, employee coordination
- **Cleaner**: View assigned tasks, update task status

---

## Real-World Workflow

### Complete Business Flow (Step-by-Step)

```
1. CUSTOMER BOOKING
   └─> Admin creates job via Jobs Panel
   └─> System captures: customer name, phone, address, state, date, time, price
   └─> Job status: "Upcoming"

2. EMPLOYEE ASSIGNMENT
   └─> Admin assigns cleaner from Employee database
   └─> System automatically creates Task linked to Job
   └─> Task appears in Task Panel for assigned cleaner
   └─> Excel export file updated (upsertJob function)

3. JOB EXECUTION
   └─> Cleaner views task in Task Panel (filtered by date)
   └─> Cleaner updates task status: "Pending" → "In Progress" → "Completed"
   └─> Job status automatically syncs with task status

4. COMPLETION & PAYMENT
   └─> Admin marks job as "Completed"
   └─> Revenue added to dashboard calculations
   └─> Job data written to monthly Excel file (state-wise sheet)

5. EXPENSE TRACKING
   └─> Admin logs expenses (supplies, equipment, travel, etc.)
   └─> Expenses categorized and tracked
   └─> Dashboard shows: Revenue - Expenses = Net Profit

6. MONTHLY REPORTING
   └─> Admin selects month (YYYY-MM format)
   └─> System queries all jobs and expenses for that month
   └─> Excel generated with:
       ├─ State-wise job sheets (Sydney, Melbourne, etc.)
       ├─ Expenses sheet
       └─ Summary sheet (Revenue, Expenses, Net Revenue)
   └─ File downloaded instantly (not stored on server)
```

---

## Tech Stack Justification

### Backend Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Node.js + Express.js** | Server runtime & framework | Fast, non-blocking I/O, excellent for REST APIs |
| **MongoDB + Mongoose** | Database & ODM | Flexible schema for evolving business needs, easy relationships |
| **JWT (jsonwebtoken)** | Authentication | Stateless, scalable, industry standard |
| **bcryptjs** | Password hashing | Secure one-way hashing, salt rounds |
| **ExcelJS** | Excel generation | Server-side Excel creation, no file storage needed |
| **Helmet** | Security headers | Protects against common web vulnerabilities |
| **express-rate-limit** | Rate limiting | Prevents API abuse, DDoS protection |
| **CORS** | Cross-origin requests | Secure frontend-backend communication |

### Frontend Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **React 19** | UI framework | Component-based, fast rendering, large ecosystem |
| **React Router v7** | Client-side routing | Declarative routing, protected routes |
| **Axios** | HTTP client | Interceptors for token injection, error handling |
| **Tailwind CSS** | Styling | Utility-first, rapid UI development, consistent design |
| **Recharts** | Data visualization | React-native charting for dashboard analytics |
| **React Toastify** | Notifications | User-friendly success/error feedback |
| **date-fns** | Date manipulation | Lightweight, immutable date operations |

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Vercel)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React App  │  │  AuthContext │  │  API Client  │          │
│  │  (Pages &    │  │  (JWT State) │  │  (Axios)     │          │
│  │  Components) │  └──────────────┘  └──────────────┘          │
│  └──────────────┘                                               │
│         │                                                         │
│         │ HTTPS (Bearer Token)                                  │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Render)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Express    │  │  Middleware  │  │  Controllers  │          │
│  │   Server     │  │  (Auth, RBAC) │  │  (Business    │          │
│  │              │  │               │  │   Logic)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                                                         │
│         │ Mongoose ODM                                            │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Users   │  │  Jobs    │  │ Employees│  │ Expenses │         │
│  │  Admins  │  │  Tasks   │  │          │  │          │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
          │
          │ (On Job Create/Update)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXCEL SERVICE (On-Demand)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  upsertJob() → Write to server/exports/                 │   │
│  │  MonthlyReportDownload → Generate & Stream to Client     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request/Response Lifecycle

```
1. USER ACTION (Frontend)
   └─> User clicks "Add Job" button
   └─> JobFormDrawer component opens

2. API CALL (Frontend)
   └─> axios.post("/api/jobs", jobData)
   └─> Axios interceptor adds: Authorization: Bearer <token>

3. MIDDLEWARE (Backend)
   └─> CORS check (allowed origins)
   └─> Rate limiter (100 req/15min)
   └─> Helmet security headers
   └─> auth.js middleware: Verify JWT token
   └─> Extract req.user = { id, role }

4. ROUTE HANDLER (Backend)
   └─> POST /api/jobs → jobController.addJob()

5. BUSINESS LOGIC (Backend)
   └─> Create Job document in MongoDB
   └─> If assignedEmployee exists:
       └─> Create Task document
   └─> Call upsertJob() → Update Excel file
   └─> Return populated job

6. RESPONSE (Frontend)
   └─> Job added to state
   └─> UI updates (toast notification)
   └─> JobsPanel refreshes
```

### Authentication & Authorization Flow

```
LOGIN FLOW:
1. User submits email/password → POST /api/auth/login
2. Backend validates credentials → bcrypt.compare()
3. JWT token generated → jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" })
4. Token stored in localStorage
5. All subsequent requests include: Authorization: Bearer <token>

PROTECTED ROUTE FLOW:
1. Frontend: PrivateRoute checks localStorage.getItem("token")
2. If no token → Redirect to /login
3. If token exists → Render protected component
4. AuthContext calls GET /api/auth/me to verify token
5. Backend: auth.js middleware verifies JWT
6. If valid → req.user = { id, role }
7. If invalid → 401 Unauthorized

ROLE-BASED ACCESS:
- SuperAdmin/Admin: Full access (dashboard, expenses, reports)
- Manager: Jobs, tasks, employees (no expenses)
- Cleaner: View assigned tasks only
- Middleware: adminOnly() checks req.user.role
```

---

## Backend Documentation

### Folder Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection (Mongoose)
├── controllers/           # Business logic handlers
│   ├── authController.js  # Login, signup
│   ├── jobController.js   # CRUD operations for jobs
│   ├── employeeController.js
│   ├── task.controller.js
│   ├── expenseController.js
│   ├── dashboardController.js
│   ├── adminController.js
│   └── reportController.js
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── auth.middleware.js # protect(), adminOnly()
│   └── adminMiddleware.js  # Role authorization
├── models/                # Mongoose schemas
│   ├── User.js
│   ├── Admin.js
│   ├── Employee.js
│   ├── Job.js
│   ├── Task.js
│   └── Expense.js
├── routes/                # API endpoint definitions
│   ├── authRoutes.js
│   ├── job.routes.js
│   ├── employeeRoutes.js
│   ├── task.routes.js
│   ├── expenseRoutes.js
│   ├── dashboardRoutes.js
│   ├── adminRoutes.js
│   └── reportRoutes.js
├── utils/
│   └── excelService.js    # Excel generation & upsert logic
├── exports/               # Generated Excel files (local only)
└── index.js               # Express app entry point
```

### Middleware

#### `middleware/auth.js`
**Purpose**: Verify JWT token from Authorization header  
**How it works**:
1. Extracts token from `req.headers.authorization.split(" ")[1]`
2. Verifies token using `jwt.verify(token, JWT_SECRET)`
3. Sets `req.user = { id, role }` on success
4. Returns 401 if token missing or invalid

**Usage**: Applied to all protected routes

#### `middleware/auth.middleware.js`
**Functions**:
- `protect(req, res, next)`: Verifies JWT, sets req.user
- `adminOnly(req, res, next)`: Checks if role is "Admin" or "SuperAdmin"
- `authorize(...roles)`: Higher-order function for role-based access

**Why separate files**: Different import patterns (some routes use `auth.js`, others use `auth.middleware.js`)

### Models / Schemas

#### `models/User.js`
**Purpose**: System users (all roles)  
**Fields**:
- `name` (String, required): User's full name
- `email` (String, required, unique): Login email
- `password` (String, required): bcrypt-hashed password
- `role` (Enum): "SuperAdmin" | "Admin" | "Manager" | "Cleaner" (default: "Cleaner")
- `timestamps`: createdAt, updatedAt (auto-generated)

**Relationships**: Referenced by Task.createdBy, Expense.createdBy

#### `models/Admin.js`
**Purpose**: Separate admin authentication (legacy/alternative)  
**Fields**: Similar to User but role limited to "SuperAdmin" | "Admin"  
**Note**: Currently not actively used; User model handles all authentication

#### `models/Employee.js`
**Purpose**: Field workers (cleaners, managers, HR)  
**Fields**:
- `name` (String, required): Employee name
- `phone` (String, required): Contact number
- `email` (String, unique, optional): Email address
- `role` (Enum): "Cleaner" | "Manager" | "HR"
- `state` (Enum): "Sydney" | "Melbourne" | "Adelaide" | "Perth" | "Brisbane"
- `status` (Enum): "Active" | "Inactive" (default: "Active")
- `joiningDate` (Date, default: Date.now)
- `notes` (String, optional): Additional info

**Relationships**: Referenced by Job.assignedEmployee, Task.assignedTo

#### `models/Job.js`
**Purpose**: Cleaning job bookings  
**Fields**:
- `customerName` (String, required): Customer's name
- `phone` (String, required): Customer contact
- `email` (String, optional): Customer email
- `address` (String, optional): Job location
- `city` (String, optional): City name
- `state` (Enum, required): One of 5 Australian states
- `date` (String): Job date (ISO format: YYYY-MM-DD)
- `time` (String): Job time (HH:MM format)
- `areas` (String): Areas to clean
- `workType` (String): Type of cleaning
- `estTime` (String): Estimated duration
- `price` (Number, required): Job price in AUD
- `assignedEmployee` (ObjectId, ref: "Employee"): Assigned cleaner
- `status` (Enum): "Upcoming" | "Completed" | "Redo" | "Cancelled" (default: "Upcoming")
- `notes` (String, optional): Additional notes

**Relationships**: 
- `assignedEmployee` → Employee
- Referenced by Task.job

**Business Logic**: When status changes to "Completed", revenue is counted in dashboard

#### `models/Task.js`
**Purpose**: Daily task assignments for employees  
**Fields**:
- `title` (String): Task title (auto-generated from job)
- `description` (String): Task details
- `status` (Enum): "Pending" | "In Progress" | "Completed" | "Redo" | "Cancelled"
- `assignedTo` (ObjectId, ref: "Employee"): Assigned employee
- `createdBy` (ObjectId, ref: "User"): User who created task
- `job` (ObjectId, ref: "Job"): Linked job
- `dueDate` (Date): Task due date (from job.date)
- `priority` (Enum): "Low" | "Medium" | "High" (default: "Medium")

**Auto-Creation**: Created automatically when job is assigned to employee

#### `models/Expense.js`
**Purpose**: Business expense tracking  
**Fields**:
- `title` (String, required): Expense description
- `amount` (Number, required, min: 0): Expense amount
- `date` (Date, required, default: Date.now): Expense date
- `category` (Enum): "Supplies" | "Equipment" | "Travel" | "Marketing" | "Office" | "Software" | "Services" | "Training" | "Salary" | "Other"
- `description` (String, maxlength: 500): Additional details
- `status` (Enum): "Pending" | "Paid" | "Reimbursed" | "Cancelled"
- `receipt` (String): URL to receipt image (optional)
- `paymentMethod` (Enum): "Cash" | "Credit Card" | "Bank Transfer" | "PayPal" | "Other"
- `vendor` (String): Vendor name
- `createdBy` (ObjectId, ref: "User", required): Creator
- `approvedBy` (ObjectId, ref: "User"): Approver (set when status = "Paid")
- `approvedAt` (Date): Approval timestamp

**Indexes**: 
- `date: -1` (for date range queries)
- `category: 1` (for category filtering)
- `status: 1` (for status filtering)
- `createdBy: 1` (for user-specific queries)

**Static Methods**:
- `getTotalByPeriod(startDate, endDate)`: Aggregate total expenses
- `getByCategory(startDate, endDate)`: Group by category

### Controllers

#### `controllers/authController.js`

**`signup(req, res)`**
- **Purpose**: Register new user
- **Input**: `{ name, email, password, role }`
- **Process**:
  1. Check if email exists
  2. Hash password with bcrypt (10 rounds)
  3. Create User document
  4. Generate JWT token
- **Output**: `{ token, user: { id, name, role, email } }`
- **Edge Cases**: Duplicate email → 400

**`login(req, res)`**
- **Purpose**: Authenticate user
- **Input**: `{ email, password }`
- **Process**:
  1. Find user by email
  2. Compare password with bcrypt.compare()
  3. Generate JWT token (expires in 7 days)
- **Output**: `{ token, user: { id, name, role, email } }`
- **Edge Cases**: Invalid credentials → 400

#### `controllers/jobController.js`

**`addJob(req, res)`**
- **Purpose**: Create new cleaning job
- **Input**: Job data from req.body
- **Process**:
  1. Create Job document
  2. Populate assignedEmployee
  3. If assignedEmployee exists, create Task
  4. Call `upsertJob()` to update Excel file
- **Output**: Created job object
- **Edge Cases**: Invalid state → 400

**`getJobs(req, res)`**
- **Purpose**: Fetch all jobs (with optional status filter)
- **Query Params**: `?status=Completed`
- **Process**:
  1. Build filter object
  2. Find jobs, populate assignedEmployee
  3. Sort by createdAt (newest first)
- **Output**: `{ data: [...jobs], meta: { total } }`

**`updateJobStatus(req, res)`**
- **Purpose**: Change job status
- **Input**: `{ status }` in req.body
- **Process**:
  1. Validate status (must be in allowed list)
  2. Update job status
  3. Sync task status (if task exists)
  4. If status is "Completed"/"Redo"/"Cancelled", update Excel
- **Output**: `{ message: "Status updated", job }`

**`assignCleaner(req, res)`**
- **Purpose**: Assign/change employee for job
- **Input**: `{ employeeId }` in req.body
- **Process**:
  1. Update job.assignedEmployee
  2. Update or create Task
  3. Update Excel file
- **Output**: `{ message: "Cleaner updated", data: job }`

#### `controllers/expenseController.js`

**`getExpenses(req, res)`**
- **Purpose**: Fetch expenses with filters, pagination, sorting
- **Query Params**: `category`, `status`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder`, `page`, `limit`
- **Process**:
  1. Build filter object from query params
  2. Apply pagination (skip, limit)
  3. Populate createdBy, approvedBy
  4. Aggregate summary stats (totalAmount, pendingAmount, paidAmount)
- **Output**: `{ success, count, total, page, pages, summary, data: [...] }`

**`addExpense(req, res)`**
- **Purpose**: Create new expense
- **Input**: Expense data (title, amount, date required)
- **Process**:
  1. Validate required fields
  2. Set createdBy = req.user.id
  3. Create Expense document
- **Output**: `{ success, message, data: expense }`

**`updateExpense(req, res)`**
- **Purpose**: Update expense
- **Process**:
  1. Find expense by ID
  2. Update fields (if provided)
  3. If status changed to "Paid", set approvedBy and approvedAt
- **Output**: Updated expense

**`getExpenseSummary(req, res)`**
- **Purpose**: Get aggregated expense statistics
- **Query Params**: `startDate`, `endDate`
- **Process**:
  1. Aggregate by category (totalAmount, count)
  2. Aggregate monthly trend (last 6 months)
  3. Aggregate by status
  4. Calculate totals (totalAmount, count, avgAmount)
- **Output**: `{ success, data: { byCategory, monthlyTrend, statusBreakdown, totals } }`

#### `controllers/dashboardController.js`

**`getDashboardStats(req, res)`**
- **Purpose**: Get KPI metrics for dashboard
- **Process**:
  1. Count total jobs
  2. Count completed jobs
  3. Count today's jobs (createdAt >= today)
  4. Aggregate revenue: Sum of price where status = "Completed"
  5. Count active cleaners (role = "Cleaner", status = "Active")
- **Output**: `{ totalJobs, completedJobs, todayJobs, totalRevenue, activeCleaners }`

#### `controllers/reportController.js`

**`downloadMonthlyReport(req, res)`**
- **Purpose**: Generate and stream Excel report for a month
- **Query Params**: `month` (YYYY-MM format)
- **Process**:
  1. Parse month, calculate start/end dates
  2. Fetch jobs and expenses for that month
  3. Create ExcelJS workbook
  4. Create state-wise sheets (Sydney, Melbourne, etc.)
  5. Add Expenses sheet
  6. Add Summary sheet (Revenue, Expenses, Net Revenue)
  7. Stream file to client (not saved to disk)
- **Output**: Excel file stream (Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- **Why on-demand**: Files are not stored on server to save storage costs

### Routes

#### `routes/authRoutes.js`
- `POST /api/auth/signup` - Public - Create new user
- `POST /api/auth/login` - Public - Authenticate user
- `GET /api/auth/me` - Protected - Get current user info

#### `routes/job.routes.js`
- `POST /api/jobs` - Protected - Create job
- `GET /api/jobs` - Protected - Get all jobs (?status=Completed)
- `PUT /api/jobs/:id/status` - Protected - Update job status
- `PUT /api/jobs/:id/assign` - Protected - Assign cleaner

#### `routes/expenseRoutes.js`
- `GET /api/expenses` - Admin only - Get expenses (with filters)
- `GET /api/expenses/stats/summary` - Admin only - Get expense statistics
- `GET /api/expenses/:id` - Admin only - Get single expense
- `POST /api/expenses` - Admin only - Create expense
- `PUT /api/expenses/:id` - Admin only - Update expense
- `DELETE /api/expenses/:id` - Admin only - Delete expense
- `DELETE /api/expenses` - Admin only - Bulk delete (body: { ids: [...] })
- `PATCH /api/expenses/:id/status` - Admin only - Update expense status

#### `routes/reportRoutes.js`
- `GET /api/reports/monthly?month=YYYY-MM` - Admin only - Download monthly Excel report

### Excel Service (`utils/excelService.js`)

**Purpose**: Maintain persistent Excel files that update in real-time as jobs are created/updated

**`upsertJob(job)`**
- **When called**: After job creation or status update
- **Process**:
  1. Determine month from job.date
  2. Generate filename: `PhantomCleaning_<Month>_<Year>.xlsx`
  3. If file exists, read it; otherwise create new workbook
  4. Get or create sheet for job.state (Sydney, Melbourne, etc.)
  5. Check if job ID already exists in sheet
  6. If exists: Update row
  7. If not: Add new row
  8. Write file to `server/exports/` directory
- **Mutex Pattern**: Uses `writeQueue` Promise chain to prevent concurrent writes
- **Why persistent files**: Allows incremental updates without regenerating entire month

**Monthly Report Generation** (in `reportController.js`):
- Generates fresh Excel from database queries
- Includes all state sheets, expenses, summary
- Streamed directly to client (not saved)

---

## Frontend Documentation

### Folder Structure

```
client/src/
├── api/
│   ├── axios.js           # Axios instance with interceptors
│   └── expense.js         # Expense API service functions
├── components/
│   ├── admin/
│   │   └── AdminUnlockModal.jsx  # Password-protected dashboard access
│   ├── common/
│   │   └── StatusBadge.jsx       # Reusable status badge component
│   ├── dashboard/
│   │   ├── DashboardWrapper.jsx  # Admin unlock wrapper
│   │   ├── DashboardPanel.jsx   # Main dashboard component
│   │   ├── DashboardStats.jsx   # KPI cards
│   │   ├── DashboardCharts.jsx  # Chart components
│   │   ├── DashboardFilters.jsx # Date/state filters
│   │   └── MonthlyReportDownload.jsx  # Excel download UI
│   ├── employees/
│   │   └── EmployeesPanel.jsx   # Employee CRUD interface
│   ├── expenses/
│   │   ├── AdminExpenses.jsx     # Main expense management
│   │   ├── ExpensesPanel.jsx    # Expense list with filters
│   │   ├── ExpenseFormDrawer.jsx # Add/edit expense form
│   │   ├── ExpenseFilters.jsx   # Category/date filters
│   │   ├── ExpenseSummary.jsx   # Expense statistics
│   │   └── ExpenseCategoryBadge.jsx
│   ├── jobs/
│   │   ├── JobsPanel.jsx        # Main job management
│   │   ├── JobCard.jsx          # Job card component
│   │   ├── JobDrawer.jsx        # Job details drawer
│   │   ├── JobFormDrawer.jsx    # Add/edit job form
│   │   ├── JobsCalender.jsx     # Calendar view (if implemented)
│   │   └── StatsOverview.jsx    # Job statistics
│   ├── layout/
│   │   └── MainLayout.jsx       # Sidebar + main content layout
│   ├── tasks/
│   │   ├── TaskPanel.jsx        # Main task timeline view
│   │   ├── TaskCard.jsx         # Task card component
│   │   ├── TaskDrawer.jsx       # Task details drawer
│   │   ├── TaskFilters.jsx      # Status/priority filters
│   │   ├── TaskStats.jsx        # Task statistics
│   │   ├── TaskTimelineItem.jsx # Timeline item component
│   │   └── useTasks.jsx         # Custom hook for tasks
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── PrivateRoute.jsx         # Route protection component
├── context/
│   └── AuthContext.jsx           # Global auth state management
├── pages/
│   ├── Login.jsx                # Login page
│   ├── Signup.jsx                # Signup page
│   ├── Dashboard.jsx            # Dashboard page wrapper
│   ├── Jobs.jsx
│   └── Employees.jsx
├── utils/
│   ├── adminAuth.js             # Admin unlock logic (localStorage)
│   └── toast.js                 # Toast notification helpers
├── App.jsx                      # Root component with routing
└── index.js                     # React entry point
```

### Pages

#### `pages/Login.jsx`
**Purpose**: User authentication  
**Who can access**: Public (unauthenticated users)  
**Data flow**:
1. User enters email/password
2. `POST /api/auth/login` with credentials
3. On success: Store token in localStorage, navigate to "/"
4. On error: Show toast error message

**State**:
- `email`, `password`: Form inputs
- `showPass`: Toggle password visibility
- `loading`: API call state

#### `pages/Dashboard.jsx`
**Purpose**: Analytics dashboard (admin only)  
**Who can access**: Admin/SuperAdmin (with password unlock)  
**Data loaded**:
- Dashboard stats: `GET /api/dashboard/stats`
- Job data: `GET /api/jobs`
- Expense data: `GET /api/expenses/stats/summary`

**Components used**:
- `DashboardWrapper`: Handles admin unlock modal
- `DashboardPanel`: Main dashboard UI
- `DashboardStats`: KPI cards
- `DashboardCharts`: Revenue, profit, job status charts

### Components

#### `components/layout/MainLayout.jsx`
**Purpose**: Application shell with sidebar navigation  
**State**: `activePanel` ("tasks" | "jobs" | "employees" | "dashboard" | "expenses")  
**Renders**: Sidebar + conditional panel based on `activePanel`

**Why this design**: Single-page app with panel switching (no route changes for main sections)

#### `components/dashboard/DashboardWrapper.jsx`
**Purpose**: Admin unlock gate for dashboard  
**Security**: 
- Checks `isAdminUnlocked()` from localStorage
- If locked: Shows `AdminUnlockModal`
- If unlocked: Shows `DashboardPanel`
- Auto-locks after 10 minutes (checked every 5 seconds)

**Why separate wrapper**: Dashboard requires additional password beyond JWT auth

#### `components/jobs/JobsPanel.jsx`
**Purpose**: Job management interface  
**Data flow**:
1. `useEffect` → `GET /api/jobs` on mount
2. Filters: `statusFilter`, `searchQuery`
3. Groups jobs: today, upcoming, past
4. On job select: Opens `JobDrawer`
5. On add: Opens `JobFormDrawer`

**State**:
- `jobs`: Array of job objects
- `selectedJob`: Currently viewed job
- `showAddJob`: Form drawer visibility
- `statusFilter`: Status filter value
- `searchQuery`: Search input

#### `components/expenses/AdminExpenses.jsx`
**Purpose**: Expense management hub  
**Data flow**:
1. `fetchExpenseStats()` → `GET /api/expenses/stats/summary`
2. `ExpensesPanel` → `GET /api/expenses` (with filters)
3. Filters: `filterCategory`, `filterDateRange`
4. Export: Fetches all expenses, converts to CSV, downloads

**Why separate from dashboard**: Expenses are a major feature, deserve dedicated panel

#### `components/tasks/TaskPanel.jsx`
**Purpose**: Daily task timeline view  
**Data flow**:
1. `fetchTasks()` → `GET /api/tasks?date=YYYY-MM-DD`
2. Filters: `statusFilter`, `priorityFilter`
3. Views: timeline, grid, list
4. On task click: Opens `TaskDrawer`

**Why timeline view**: Cleaners need chronological view of daily schedule

### Dashboard Logic

#### Revenue Calculation
```javascript
// Backend: dashboardController.js
const revenueAgg = await Job.aggregate([
  { $match: { status: "Completed" } },
  { $group: { _id: null, total: { $sum: "$price" } } }
]);
const totalRevenue = revenueAgg[0]?.total || 0;
```

**Why only "Completed"**: Revenue is recognized when job is completed, not when created

#### Profit Calculation
```javascript
// Frontend: DashboardPanel.jsx
const netProfit = totalRevenue - totalExpenses;
```

**Expenses included**: All expenses with status != "Cancelled"

#### Filter Logic
- **Date Range**: Filters jobs/expenses by date field
- **State Filter**: Filters jobs by state enum
- **Status Filter**: Filters by job/expense status

### Auth Handling

#### Token Storage
- **Location**: `localStorage.setItem("token", token)`
- **Why localStorage**: Persists across page refreshes
- **Security**: Token expires in 7 days (backend JWT config)

#### Protected Routes
```javascript
// App.jsx
<PrivateRoute>
  <MainLayout />
</PrivateRoute>

// PrivateRoute checks:
const token = localStorage.getItem("token");
return token ? children : <Navigate to="/login" />;
```

#### Admin Locking
- **Mechanism**: Additional password check beyond JWT
- **Storage**: `localStorage.setItem("adminUnlocked", "true")` with timestamp
- **Auto-lock**: After 10 minutes of inactivity
- **Why**: Extra security layer for sensitive financial data

---

## API Reference

### Authentication Endpoints

#### `POST /api/auth/signup`
**Auth**: None  
**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Manager"
}
```
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "Manager",
    "email": "john@example.com"
  }
}
```

#### `POST /api/auth/login`
**Auth**: None  
**Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Response**: Same as signup

#### `GET /api/auth/me`
**Auth**: Required (Bearer token)  
**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Manager"
}
```

### Job Endpoints

#### `POST /api/jobs`
**Auth**: Required  
**Body**:
```json
{
  "customerName": "Jane Smith",
  "phone": "0412345678",
  "email": "jane@example.com",
  "address": "123 Main St",
  "city": "Sydney",
  "state": "Sydney",
  "date": "2026-02-15",
  "time": "10:00",
  "areas": "Kitchen, Bathroom",
  "workType": "Deep Clean",
  "estTime": "2 hours",
  "price": 150,
  "assignedEmployee": "507f1f77bcf86cd799439012",
  "notes": "Pet-friendly home"
}
```
**Response**: Created job object (201)

#### `GET /api/jobs?status=Completed`
**Auth**: Required  
**Query Params**: `status` (optional)  
**Response**:
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "customerName": "Jane Smith",
      "price": 150,
      "status": "Completed",
      "assignedEmployee": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Bob Cleaner"
      },
      ...
    }
  ],
  "meta": { "total": 1 }
}
```

#### `PUT /api/jobs/:id/status`
**Auth**: Required  
**Body**:
```json
{
  "status": "Completed"
}
```
**Response**: `{ "message": "Status updated", "job": {...} }`

#### `PUT /api/jobs/:id/assign`
**Auth**: Required  
**Body**:
```json
{
  "employeeId": "507f1f77bcf86cd799439012"
}
```
**Response**: `{ "message": "Cleaner updated", "data": {...} }`

### Expense Endpoints

#### `GET /api/expenses?category=Supplies&startDate=2026-01-01&endDate=2026-01-31&page=1&limit=50`
**Auth**: Admin only  
**Query Params**: `category`, `status`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder`, `page`, `limit`  
**Response**:
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 1,
  "summary": {
    "totalAmount": 5000,
    "pendingAmount": 1000,
    "paidAmount": 4000,
    "count": 25
  },
  "data": [...]
}
```

#### `POST /api/expenses`
**Auth**: Admin only  
**Body**:
```json
{
  "title": "Cleaning Supplies",
  "amount": 250,
  "date": "2026-01-15",
  "category": "Supplies",
  "description": "Bulk purchase of detergents",
  "paymentMethod": "Credit Card",
  "vendor": "Supply Co"
}
```
**Response**: `{ "success": true, "message": "Expense added", "data": {...} }`

#### `GET /api/expenses/stats/summary?startDate=2026-01-01&endDate=2026-01-31`
**Auth**: Admin only  
**Response**:
```json
{
  "success": true,
  "data": {
    "byCategory": [
      { "_id": "Supplies", "totalAmount": 2000, "count": 10 }
    ],
    "monthlyTrend": [
      { "_id": { "year": 2026, "month": 1 }, "totalAmount": 5000, "count": 25 }
    ],
    "statusBreakdown": [
      { "_id": "Paid", "totalAmount": 4000, "count": 20 }
    ],
    "totals": {
      "totalAmount": 5000,
      "count": 25,
      "avgAmount": 200
    }
  }
}
```

### Dashboard Endpoints

#### `GET /api/dashboard/stats`
**Auth**: Admin only  
**Response**:
```json
{
  "totalJobs": 150,
  "completedJobs": 120,
  "todayJobs": 5,
  "totalRevenue": 18000,
  "activeCleaners": 8
}
```

### Report Endpoints

#### `GET /api/reports/monthly?month=2026-01`
**Auth**: Admin only  
**Response**: Excel file stream (binary)  
**Headers**: 
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename=PhantomCleaning_2026-01.xlsx`

---

## Database Schema Reference

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "SuperAdmin" | "Admin" | "Manager" | "Cleaner",
  createdAt: Date,
  updatedAt: Date
}
```

### Employee Collection
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  email: String (unique, optional),
  role: "Cleaner" | "Manager" | "HR",
  state: "Sydney" | "Melbourne" | "Adelaide" | "Perth" | "Brisbane",
  status: "Active" | "Inactive",
  joiningDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Collection
```javascript
{
  _id: ObjectId,
  customerName: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  state: "Sydney" | "Melbourne" | "Adelaide" | "Perth" | "Brisbane",
  date: String (YYYY-MM-DD),
  time: String (HH:MM),
  areas: String,
  workType: String,
  estTime: String,
  price: Number,
  assignedEmployee: ObjectId (ref: "Employee"),
  status: "Upcoming" | "Completed" | "Redo" | "Cancelled",
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: "Pending" | "In Progress" | "Completed" | "Redo" | "Cancelled",
  assignedTo: ObjectId (ref: "Employee"),
  createdBy: ObjectId (ref: "User"),
  job: ObjectId (ref: "Job"),
  dueDate: Date,
  priority: "Low" | "Medium" | "High",
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Collection
```javascript
{
  _id: ObjectId,
  title: String,
  amount: Number,
  date: Date,
  category: "Supplies" | "Equipment" | "Travel" | "Marketing" | "Office" | "Software" | "Services" | "Training" | "Salary" | "Other",
  description: String,
  status: "Pending" | "Paid" | "Reimbursed" | "Cancelled",
  receipt: String (URL),
  paymentMethod: "Cash" | "Credit Card" | "Bank Transfer" | "PayPal" | "Other",
  vendor: String,
  createdBy: ObjectId (ref: "User"),
  approvedBy: ObjectId (ref: "User"),
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Excel Reporting Architecture

### Persistent Excel Files (`upsertJob`)

**Location**: `server/exports/PhantomCleaning_<Month>_<Year>.xlsx`

**Structure**:
- **Sheet per State**: Sydney, Melbourne, Adelaide, Perth, Brisbane
- **Columns**: Job ID, Date, Week, Customer, Phone, Address, Cleaner, Status, Price
- **Update Logic**: Upsert by Job ID (update if exists, insert if new)

**When Updated**:
- Job created with assignedEmployee
- Job status changed to "Completed", "Redo", or "Cancelled"
- Job assignedEmployee changed

**Why Persistent**: Allows incremental updates without full regeneration

### On-Demand Monthly Reports (`downloadMonthlyReport`)

**Trigger**: Admin clicks "Download Monthly Report", selects month

**Process**:
1. Query all jobs for selected month
2. Query all expenses for selected month
3. Create new ExcelJS workbook
4. Create state-wise sheets (populate with jobs)
5. Create Expenses sheet
6. Create Summary sheet:
   - Total Revenue (sum of completed job prices)
   - Total Expenses (sum of all expenses)
   - Net Revenue (Revenue - Expenses)
7. Stream file to client

**Why On-Demand**: 
- Files not stored on server (saves storage costs)
- Always reflects current database state
- No stale data issues

**File Naming**: `PhantomCleaning_YYYY-MM.xlsx`

---

## Security & Compliance

### Authentication Security
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Expiration**: 7 days
- **Token Storage**: localStorage (client-side)
- **Token Verification**: Every protected route checks JWT signature

### Authorization
- **Role-Based Access Control (RBAC)**: 
  - SuperAdmin/Admin: Full access
  - Manager: Jobs, tasks, employees (no expenses)
  - Cleaner: View assigned tasks only
- **Admin Dashboard Lock**: Additional password beyond JWT
- **Route Protection**: Middleware checks role before allowing access

### API Security
- **CORS**: Whitelist of allowed origins (Vercel + localhost)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers (XSS protection, content-type sniffing prevention)
- **Input Validation**: Mongoose schema validation, enum checks

### Data Security
- **No Sensitive Data in URLs**: IDs in request body, not query params
- **Password Never Sent Back**: User queries exclude password field
- **Error Messages**: Generic messages to prevent information leakage

---

## Performance & Scalability

### Database Optimization
- **Indexes**: 
  - Expense: `date`, `category`, `status`, `createdBy`
  - Job: Populated queries use indexed `_id` fields
- **Pagination**: Expense queries support `page` and `limit`
- **Aggregation Pipelines**: Efficient MongoDB aggregations for statistics

### Frontend Optimization
- **Lazy Loading**: Dashboard panel loaded with `React.lazy()`
- **Memoization**: `useMemo` for filtered job/task lists
- **Code Splitting**: React Router handles route-based splitting

### Backend Optimization
- **Connection Pooling**: Mongoose handles MongoDB connection pooling
- **Async/Await**: Non-blocking I/O operations
- **Excel Mutex**: Prevents concurrent file writes

### Scalability Considerations
- **Stateless API**: JWT allows horizontal scaling
- **File Storage**: Excel files stored locally (consider S3 for production scale)
- **Rate Limiting**: Prevents abuse, but may need adjustment for high traffic

---

## Environment Variables

### Backend (`.env` in `server/`)

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/phantom-cleaning?retryWrites=true&w=majority

# JWT Secret (generate strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Panel Password (for dashboard unlock)
ADMIN_PANEL_PASSWORD=your-admin-password-here

# Server Port
PORT=5050

# CORS Origins (comma-separated in production)
ALLOWED_ORIGINS=https://phantom-cleaning.vercel.app,http://localhost:3000
```

### Frontend (`.env` in `client/`)

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5050

# Production: Set to Render backend URL
# REACT_APP_API_URL=https://phantom-cleaning-backend.onrender.com
```

---

## Local Setup Guide

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd phantom-cleaning
```

### Step 2: Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
ADMIN_PANEL_PASSWORD=your-admin-password
PORT=5050
```

Start backend:
```bash
npm run dev  # Uses nodemon for auto-reload
# OR
npm start    # Production mode
```

Backend runs on `http://localhost:5050`

### Step 3: Frontend Setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5050
```

Start frontend:
```bash
npm start
```

Frontend runs on `http://localhost:3000`

### Step 4: Create First User
1. Navigate to `http://localhost:3000/signup`
2. Create account with role "Admin"
3. Login with credentials
4. Access dashboard (enter admin password when prompted)

### Step 5: Seed Data (Optional)
Create employees, then create jobs to test the system.

---

## Production Deployment

### Backend Deployment (Render)

1. **Create Render Web Service**:
   - Connect GitHub repository
   - Root directory: `server`
   - Build command: (none, Node.js app)
   - Start command: `npm start`
   - Environment: Node

2. **Environment Variables** (Render dashboard):
   ```
   MONGO_URI=your-production-mongodb-uri
   JWT_SECRET=production-jwt-secret
   ADMIN_PANEL_PASSWORD=production-admin-password
   PORT=5050
   ```

3. **Deploy**: Render auto-deploys on git push

4. **Note**: Render may spin down free tier after inactivity. Consider paid tier for production.

### Frontend Deployment (Vercel)

1. **Import Project**:
   - Connect GitHub repository
   - Root directory: `client`
   - Framework preset: Create React App

2. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

3. **Deploy**: Vercel auto-deploys on git push

### Post-Deployment Checklist
- [ ] Update CORS origins in backend to include Vercel URL
- [ ] Test authentication flow
- [ ] Test job creation and assignment
- [ ] Test expense management
- [ ] Test monthly report download
- [ ] Verify MongoDB connection
- [ ] Check error logs in Render/Vercel dashboards

---

## Known Limitations

1. **Excel File Storage**: Files stored locally on server (not suitable for multi-server deployments)
2. **No Image Upload**: Receipt URLs must be provided (no file upload endpoint)
3. **No Email Notifications**: Job assignments don't trigger emails
4. **No Real-Time Updates**: Dashboard requires manual refresh
5. **Admin Lock Timeout**: Fixed 10-minute timeout (not configurable)
6. **No Audit Log**: No tracking of who changed what and when
7. **Limited Error Handling**: Some edge cases may not have user-friendly error messages

---

## Future Roadmap

### Short-Term (1-3 months)
- [ ] Image upload for expense receipts (AWS S3 or Cloudinary)
- [ ] Email notifications for job assignments
- [ ] Real-time dashboard updates (WebSockets or polling)
- [ ] Mobile-responsive improvements
- [ ] Export expenses to CSV (currently only Excel)

### Medium-Term (3-6 months)
- [ ] Customer management module
- [ ] Recurring job scheduling
- [ ] Employee performance metrics
- [ ] Advanced reporting (PDF reports, custom date ranges)
- [ ] Multi-currency support

### Long-Term (6+ months)
- [ ] Mobile app (React Native)
- [ ] GPS tracking for cleaners
- [ ] Customer portal (view job status)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Automated invoicing

---

## Contribution Guidelines

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Style
- Use ESLint configuration (React app default)
- Follow existing component structure
- Add comments for complex logic
- Update README if adding new features

---

## Author & Contact

**Project**: Phantom Cleaning Admin System  
**Stack**: MERN (MongoDB, Express.js, React, Node.js)  
**Deployment**: Vercel (Frontend) + Render (Backend)

For questions or support, please open an issue in the repository.

---

## License

[Specify your license here, e.g., MIT, Proprietary, etc.]

---

**Last Updated**: February 2026  
**Version**: 1.0.0
