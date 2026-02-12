-- Plantation Register: rows and tree census

CREATE TABLE IF NOT EXISTS plantation_rows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  row_number INTEGER NOT NULL,
  variety TEXT NOT NULL,
  rootstock_type TEXT,
  planting_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plantation_trees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  row_id UUID REFERENCES plantation_rows(id) ON DELETE CASCADE NOT NULL,
  tree_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'missing')),
  planted_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plantation_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantation_trees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plantation rows"
  ON plantation_rows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plantation rows"
  ON plantation_rows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plantation rows"
  ON plantation_rows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plantation rows"
  ON plantation_rows FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own plantation trees"
  ON plantation_trees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plantation trees"
  ON plantation_trees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plantation trees"
  ON plantation_trees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plantation trees"
  ON plantation_trees FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_plantation_rows_field ON plantation_rows(field_id);
CREATE INDEX idx_plantation_rows_user ON plantation_rows(user_id);
CREATE INDEX idx_plantation_trees_row ON plantation_trees(row_id);
CREATE INDEX idx_plantation_trees_user ON plantation_trees(user_id);

ALTER TABLE plantation_rows ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE plantation_trees ALTER COLUMN user_id SET DEFAULT auth.uid();
