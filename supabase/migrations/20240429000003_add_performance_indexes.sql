-- Add indexes for better query performance
-- Expenses table
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);
CREATE INDEX IF NOT EXISTS expenses_created_at_idx ON expenses(created_at);

-- Goals table
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_deadline_idx ON goals(deadline);
CREATE INDEX IF NOT EXISTS goals_created_at_idx ON goals(created_at);

-- Payments table
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_due_date_idx ON payments(due_date);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at);

-- Accounts table
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS accounts_created_at_idx ON accounts(created_at); 