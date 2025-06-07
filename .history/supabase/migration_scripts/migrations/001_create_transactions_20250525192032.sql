-- Create Enum Types
CREATE TYPE payment_method AS ENUM ('gcash', 'stripe_card', 'paymongo_otc');
CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'failed');

-- Create Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  method payment_method NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  reference_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Manila', now())
);