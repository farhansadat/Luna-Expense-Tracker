-- Create receipts table for OCR
CREATE TABLE IF NOT EXISTS receipts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    ocr_data jsonb,
    merchant_name text,
    total_amount decimal(12,2),
    currency text,
    date date,
    category text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies for receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own receipts" ON receipts
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can create their own receipts" ON receipts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own receipts" ON receipts
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete their own receipts" ON receipts
    FOR DELETE USING (auth.uid() = user_id); 