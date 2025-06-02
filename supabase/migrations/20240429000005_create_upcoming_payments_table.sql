-- Create upcoming_payments table
CREATE TABLE IF NOT EXISTS upcoming_payments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    description text NOT NULL,
    amount decimal(12,2) NOT NULL,
    dueDate date NOT NULL,
    type text NOT NULL CHECK (type IN ('incoming', 'outgoing')),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE upcoming_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own upcoming payments"
    ON upcoming_payments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own upcoming payments"
    ON upcoming_payments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upcoming payments"
    ON upcoming_payments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upcoming payments"
    ON upcoming_payments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_upcoming_payments_user_id ON upcoming_payments(user_id);
CREATE INDEX idx_upcoming_payments_due_date ON upcoming_payments(dueDate);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_upcoming_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_upcoming_payments_updated_at
    BEFORE UPDATE ON upcoming_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_upcoming_payments_updated_at(); 