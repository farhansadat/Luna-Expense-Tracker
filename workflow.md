# Luna Financial App Workflow

## User Journey

### 1. Onboarding
1. User signs up with email/password
2. User completes profile setup:
   - Sets preferred currency
   - Enters monthly income
   - Sets monthly savings goal
   - System calculates monthly budget (Income - Savings)
   - Option to create multiple accounts (Personal, Business, Family, etc.)

### 2. Data Flow
1. Profile Creation:
   ```sql
   profiles table:
   - id (user_id from auth)
   - monthly_income: decimal
   - savings_goal: decimal
   - currency: string
   - monthly_budget: decimal (calculated)
   - theme_preference: string
   - notification_settings: jsonb
   ```

2. Accounts Management:
   ```sql
   accounts table:
   - id: uuid
   - user_id: uuid (ref: profiles.id)
   - name: string (e.g., "Personal", "Business")
   - type: string (personal, business, family)
   - balance: decimal
   - currency: string
   - color: string (for UI)
   - icon: string
   - created_at: timestamp
   - is_default: boolean
   ```

3. Monthly Budget Calculation:
   - Initial budget = Monthly Income - Monthly Savings Goal
   - Budget gets stored in user_settings table
   - Each account can have its own budget allocation

4. Expense Management:
   ```sql
   expenses table:
   - id: uuid
   - user_id: uuid
   - account_id: uuid (ref: accounts.id)
   - amount: decimal
   - category: string
   - date: timestamp
   - description: text
   - is_recurring: boolean
   - recurring_frequency: string
   - merchant: string
   - receipt_url: string
   - tags: array
   - location: jsonb (optional)
   ```

### 3. Dashboard Data Flow
1. On Dashboard Load:
   - Fetch user profile data
   - Fetch all user accounts
   - For each account:
     * Fetch monthly budget
     * Fetch current month's expenses
     * Calculate account-specific metrics
   - Calculate global metrics:
     * Total net worth
     * Overall expenses
     * Savings progress
     * Category-wise spending

2. Add Transaction Flow:
   - User selects account
   - Enters transaction details
   - Optional receipt scan/upload
   - System validates against account budget
   - Updates relevant account balance
   - Recalculates dashboard metrics
   - Updates all visualizations

### 4. Features Implementation

1. Account Management:
   - Create/Edit/Delete accounts
   - Set budget per account
   - Transfer between accounts
   - Account-specific categories

2. Transaction Management:
   - Multi-currency support
   - Receipt OCR integration
   - Bulk import/export
   - Transaction splitting
   - Recurring transactions

3. Budgeting Features:
   - Category-based budgets
   - Account-specific budgets
   - Budget rollover options
   - Smart budget suggestions

4. AI Integration:
   - Spending pattern analysis
   - Budget recommendations
   - Anomaly detection
   - Smart categorization
   - Financial insights

5. Reports & Analytics:
   - Custom date ranges
   - Multiple chart types
   - Export capabilities
   - Account-specific reports

### 5. Data Validation
1. Before saving:
   - Validate amount formats
   - Check currency consistency
   - Verify date validity
   - Ensure required fields
   - Account balance checks

2. After saving:
   - Update account balances
   - Recalculate budgets
   - Update statistics
   - Trigger notifications

## Current Issues to Fix
1. Account Integration:
   - Implement multi-account system
   - Add account switching
   - Account-specific views

2. Data Persistence:
   - Proper account data storage
   - Transaction history
   - Settings persistence

3. UI/UX Improvements:
   - Account selection UI
   - Better transaction forms
   - Quick actions
   - Floating action button

## Implementation Checklist
1. [ ] Create accounts table
2. [ ] Update profile schema
3. [ ] Implement account management
4. [ ] Add multi-account support to transactions
5. [ ] Update UI for account switching
6. [ ] Implement floating action button
7. [ ] Add receipt scanner
8. [ ] Implement AI features
9. [ ] Add export functionality
10. [ ] Set up notifications 