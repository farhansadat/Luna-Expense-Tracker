-- Fix profiles table to ensure onboarding status persists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS monthly_budget decimal(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_income decimal(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    amount decimal(12,2) NOT NULL,
    currency text NOT NULL,
    billing_cycle text NOT NULL,
    next_payment_date date NOT NULL,
    category text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create scheduled_payments table
CREATE TABLE IF NOT EXISTS scheduled_payments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    amount decimal(12,2) NOT NULL,
    currency text NOT NULL,
    description text,
    recipient text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    frequency text NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Fix expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_frequency text,
ADD COLUMN IF NOT EXISTS tags text[];

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can create their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete their own subscriptions" ON subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for scheduled_payments
CREATE POLICY "Users can view their own scheduled payments" ON scheduled_payments
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can create their own scheduled payments" ON scheduled_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own scheduled payments" ON scheduled_payments
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete their own scheduled payments" ON scheduled_payments
    FOR DELETE USING (auth.uid() = user_id); 