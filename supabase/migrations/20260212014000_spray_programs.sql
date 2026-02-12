-- Spray Programs and Chemical Usage

CREATE TABLE IF NOT EXISTS spray_chemicals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  active_ingredient TEXT,
  target_pest TEXT,
  crop TEXT,
  dose_min DECIMAL(10,2),
  dose_max DECIMAL(10,2),
  dose_unit TEXT,
  phi_days INTEGER DEFAULT 0,
  rei_hours INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spray_programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  crop TEXT,
  stage TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spray_program_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES spray_programs(id) ON DELETE CASCADE NOT NULL,
  chemical_id UUID REFERENCES spray_chemicals(id) ON DELETE SET NULL,
  interval_days INTEGER,
  dose_rate DECIMAL(10,2),
  dose_unit TEXT,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spray_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  tree_block_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  orchard_id UUID REFERENCES orchards(id) ON DELETE SET NULL,
  program_id UUID REFERENCES spray_programs(id) ON DELETE SET NULL,
  chemical_id UUID REFERENCES spray_chemicals(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ NOT NULL,
  dose_rate DECIMAL(10,2) NOT NULL,
  dose_unit TEXT,
  area_kanal DECIMAL(10,2) DEFAULT 0,
  total_product DECIMAL(12,2) DEFAULT 0,
  mix_volume_liters DECIMAL(12,2) DEFAULT 0,
  target_issue TEXT,
  phi_days INTEGER DEFAULT 0,
  rei_hours INTEGER DEFAULT 0,
  compliance_status TEXT DEFAULT 'ok' CHECK (compliance_status IN ('ok', 'warning')),
  compliance_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spray_chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE spray_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spray_program_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spray_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own spray chemicals"
  ON spray_chemicals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spray chemicals"
  ON spray_chemicals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spray chemicals"
  ON spray_chemicals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spray chemicals"
  ON spray_chemicals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own spray programs"
  ON spray_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spray programs"
  ON spray_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spray programs"
  ON spray_programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spray programs"
  ON spray_programs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own spray program items"
  ON spray_program_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spray program items"
  ON spray_program_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spray program items"
  ON spray_program_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spray program items"
  ON spray_program_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own spray logs"
  ON spray_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spray logs"
  ON spray_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spray logs"
  ON spray_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spray logs"
  ON spray_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_spray_chemicals_user ON spray_chemicals(user_id);
CREATE INDEX idx_spray_programs_user ON spray_programs(user_id);
CREATE INDEX idx_spray_program_items_program ON spray_program_items(program_id);
CREATE INDEX idx_spray_logs_user ON spray_logs(user_id);
CREATE INDEX idx_spray_logs_field ON spray_logs(field_id);

ALTER TABLE spray_chemicals ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE spray_programs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE spray_program_items ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE spray_logs ALTER COLUMN user_id SET DEFAULT auth.uid();
