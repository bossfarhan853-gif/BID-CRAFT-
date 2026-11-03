-- Rankora production schema sketch (Supabase / PostgreSQL)
-- Run only after reviewing and securing with RLS

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  category TEXT,
  current_bid INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('completed','failed','refunded','pending')),
  mode TEXT CHECK (mode IN ('demo','live')) DEFAULT 'demo',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only completed live transactions should count toward public live revenue
-- Never expose individual transaction details publicly
-- Use RLS and views for aggregates
