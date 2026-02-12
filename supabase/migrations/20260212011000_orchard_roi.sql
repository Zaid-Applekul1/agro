-- Orchard ROI & Cost Tracking

CREATE TABLE IF NOT EXISTS orchard_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  orchard_id UUID REFERENCES orchards(id) ON DELETE CASCADE NOT NULL,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('establishment', 'annual')),
  amount DECIMAL(12,2) NOT NULL,
  cost_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orchard_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orchard costs"
  ON orchard_costs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orchard costs"
  ON orchard_costs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orchard costs"
  ON orchard_costs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orchard costs"
  ON orchard_costs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_orchard_costs_orchard ON orchard_costs(orchard_id);
CREATE INDEX idx_orchard_costs_user ON orchard_costs(user_id);

ALTER TABLE orchard_costs ALTER COLUMN user_id SET DEFAULT auth.uid();
