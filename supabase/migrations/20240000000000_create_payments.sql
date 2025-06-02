-- First, create the table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    category VARCHAR(100),
    recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies one by one
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
    DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
    DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
    DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;

    -- Create new policies
    CREATE POLICY "Users can view their own payments"
        ON public.payments FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own payments"
        ON public.payments FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own payments"
        ON public.payments FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own payments"
        ON public.payments FOR DELETE
        USING (auth.uid() = user_id);
END $$;

-- Create indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_due_date ON public.payments(due_date);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 