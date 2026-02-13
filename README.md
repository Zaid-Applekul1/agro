# AppleKul One

A comprehensive farm management system specifically designed for apple orchards in Kashmir, India. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Field Management**: Track orchard blocks, crops, and growth stages
- **Tree Block Management**: Monitor apple varieties, health, and yield estimates
- **Harvest Tracking**: Record harvest data with quality grading and storage
- **Integrated Pest Management**: Track treatments and effectiveness
- **Financial Ledger**: Monitor income, expenses, and profitability
- **Inventory Management**: Track fertilizers and pesticides
- **Equipment Registry**: Manage farm equipment and maintenance schedules
- **User Management**: Role-based access control for team members
- **Crop Rotation Planning**: Optimize soil health with rotation schedules

## Apple Varieties Supported

- Royal Delicious
- Ambri (Kashmir specialty)
- Red Delicious
- Golden Delicious
- Gala
- Fuji

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings > API to get your project URL and anon key
4. Go to SQL Editor and run the migration file located at `supabase/migrations/create_farm_schema.sql`

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the environment variables with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

## Database Schema

The system includes the following main tables with Row Level Security (RLS):

- **user_profiles**: Extended user information and roles
- **fields**: Orchard block information
- **trees**: Tree block management with variety tracking
- **harvest_records**: Apple harvest data with quality grading
- **pest_treatments**: IPM treatment records
- **financial_entries**: Income and expense tracking
- **inventory**: Fertilizer and pesticide inventory
- **equipment**: Farm equipment and maintenance
- **fertilizer_applications**: Field fertilizer application history

All tables are secured with RLS policies ensuring users can only access their own data.

## User Roles

- **Owner**: Full system access including user management and financial data
- **Editor**: Can manage fields, inventory, equipment, and operations (limited financial access)
- **Viewer**: Read-only access to operational data

## Security Features

- **Row Level Security**: Users can only access their own farm data
- **Authentication**: Secure email/password authentication via Supabase Auth
- **Real-time Updates**: Live data synchronization across devices
- **Data Isolation**: Complete separation of data between different farms/users

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## Getting Started

1. Create a Supabase account and project
2. Run the database migration
3. Configure environment variables
4. Install dependencies and start development server
5. Sign up for a new account to start managing your farm data

The application automatically creates a user profile when you sign up and ensures all your farm data remains private and secure.
Data Visualization & Analytics
Monthly/Yearly Charts - Bar or line charts showing income vs expenses over time
Category Breakdown Pie Chart - Visual distribution of expenses by category
Profit Margin Trends - Track profitability trends over months
Budget vs Actual - Set budgets per category and show variance
Enhanced Functionality
Edit/Delete Entries - Ability to modify or remove transactions
Bulk Import/Export - CSV import/export for accounting software integration
Recurring Transactions - Set up automatic recurring entries (monthly rent, insurance)
Payment Status - Track pending/paid/overdue status for invoices
Attachments - Upload receipts/invoices for each entry
Notes/Memo Field - Add detailed notes to transactions
Financial Management
Bank Account Reconciliation - Match entries with bank statements
Multiple Accounts - Track cash, bank accounts, credit separately
Tax Reports - Generate tax-ready reports by fiscal year
Profit & Loss Statement - Formal P&L report generation
Cash Flow Forecast - Predict future cash position based on trends
Filtering & Search
Date Range Filter - Custom date range selection
Amount Range Filter - Filter by min/max amount
Search by Description - Text search across descriptions
Multi-Category Filter - Select multiple categories at once
Sort Options - Sort by date, amount, category
UI Enhancements
Pagination - Handle large transaction lists efficiently
Summary Cards by Month - Monthly breakdown cards
Quick Stats Dashboard - Average daily/weekly spending, top categories
Color-Coded Alerts - Highlight unusual spending patterns
Print/PDF Export - Generate printable reports
