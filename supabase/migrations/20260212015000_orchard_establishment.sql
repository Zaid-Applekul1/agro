-- Orchard Establishment Module

CREATE TABLE IF NOT EXISTS orchard_establishment_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  land_unit TEXT DEFAULT 'kanal',
  trees_per_kanal INTEGER DEFAULT 167,
  row_spacing_m DECIMAL(6,2) DEFAULT 3.0,
  tree_spacing_m DECIMAL(6,2) DEFAULT 1.0,
  orchard_type TEXT DEFAULT 'High Density Apple',
  geometry_type TEXT DEFAULT 'row',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orchard_establishments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  location TEXT,
  total_kanal DECIMAL(10,2) NOT NULL,
  plantation_year INTEGER NOT NULL,
  row_spacing_m DECIMAL(6,2) NOT NULL,
  tree_spacing_m DECIMAL(6,2) NOT NULL,
  trees_per_kanal INTEGER DEFAULT 167,
  orchard_type TEXT DEFAULT 'High Density Apple',
  rootstock_type TEXT,
  plant_source TEXT,
  planting_method TEXT,
  irrigation_type TEXT,
  support_system TEXT,
  branches TEXT,
  price_per_kg DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orchard_establishment_varieties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  establishment_id UUID REFERENCES orchard_establishments(id) ON DELETE CASCADE NOT NULL,
  variety TEXT NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0,
  tree_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orchard_establishment_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  establishment_id UUID REFERENCES orchard_establishments(id) ON DELETE CASCADE NOT NULL,
  cost_head TEXT NOT NULL,
  amount_per_kanal DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orchard_establishment_mortality (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  establishment_id UUID REFERENCES orchard_establishments(id) ON DELETE CASCADE NOT NULL,
  row_number INTEGER,
  tree_number INTEGER,
  count INTEGER DEFAULT 1,
  cause_of_death TEXT,
  death_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orchard_establishment_replacements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  establishment_id UUID REFERENCES orchard_establishments(id) ON DELETE CASCADE NOT NULL,
  mortality_id UUID REFERENCES orchard_establishment_mortality(id) ON DELETE SET NULL,
  count INTEGER DEFAULT 1,
  replacement_date DATE NOT NULL,
  replacement_cost DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orchard_yield_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year_number INTEGER NOT NULL,
  min_kg DECIMAL(10,2) DEFAULT 0,
  max_kg DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orchard_visit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  establishment_id UUID REFERENCES orchard_establishments(id) ON DELETE CASCADE NOT NULL,
  visitor_type TEXT NOT NULL,
  visit_date DATE NOT NULL,
  purpose TEXT,
  notes TEXT,
  recommendations TEXT,
  photo_urls TEXT,
  next_action TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orchard_establishment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_establishment_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_establishment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_establishment_mortality ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_establishment_replacements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_yield_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_visit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own establishment templates"
  ON orchard_establishment_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own establishment templates"
  ON orchard_establishment_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own establishment templates"
  ON orchard_establishment_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own establishment templates"
  ON orchard_establishment_templates FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own establishments"
  ON orchard_establishments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own establishments"
  ON orchard_establishments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own establishments"
  ON orchard_establishments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own establishments"
  ON orchard_establishments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own establishment varieties"
  ON orchard_establishment_varieties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own establishment varieties"
  ON orchard_establishment_varieties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own establishment varieties"
  ON orchard_establishment_varieties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own establishment varieties"
  ON orchard_establishment_varieties FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own establishment costs"
  ON orchard_establishment_costs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own establishment costs"
  ON orchard_establishment_costs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own establishment costs"
  ON orchard_establishment_costs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own establishment costs"
  ON orchard_establishment_costs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own establishment mortality"
  ON orchard_establishment_mortality FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own establishment mortality"
  ON orchard_establishment_mortality FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own establishment mortality"
  ON orchard_establishment_mortality FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own establishment mortality"
  ON orchard_establishment_mortality FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own establishment replacements"
  ON orchard_establishment_replacements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own establishment replacements"
  ON orchard_establishment_replacements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own establishment replacements"
  ON orchard_establishment_replacements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own establishment replacements"
  ON orchard_establishment_replacements FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own yield models"
  ON orchard_yield_models FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own yield models"
  ON orchard_yield_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own yield models"
  ON orchard_yield_models FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own yield models"
  ON orchard_yield_models FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own visit logs"
  ON orchard_visit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visit logs"
  ON orchard_visit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visit logs"
  ON orchard_visit_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visit logs"
  ON orchard_visit_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_establishments_user ON orchard_establishments(user_id);
CREATE INDEX idx_establishments_field ON orchard_establishments(field_id);
CREATE INDEX idx_est_varieties_est ON orchard_establishment_varieties(establishment_id);
CREATE INDEX idx_est_costs_est ON orchard_establishment_costs(establishment_id);
CREATE INDEX idx_est_mortality_est ON orchard_establishment_mortality(establishment_id);
CREATE INDEX idx_est_replacements_est ON orchard_establishment_replacements(establishment_id);
CREATE INDEX idx_yield_models_user ON orchard_yield_models(user_id);
CREATE INDEX idx_visit_logs_est ON orchard_visit_logs(establishment_id);

ALTER TABLE orchard_establishment_templates ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_establishments ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_establishment_varieties ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_establishment_costs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_establishment_mortality ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_establishment_replacements ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_yield_models ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_visit_logs ALTER COLUMN user_id SET DEFAULT auth.uid();
