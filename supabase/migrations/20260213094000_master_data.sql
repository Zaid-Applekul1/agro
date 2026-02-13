-- Master data tables and admin-only policies

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer';

CREATE TABLE IF NOT EXISTS master_crops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_varieties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES master_crops(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  notes TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_chemicals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  chemical_type TEXT,
  active_ingredient TEXT,
  unit TEXT,
  phi_days INTEGER,
  rei_hours INTEGER,
  notes TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_fertilizers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  nutrient_ratio TEXT,
  unit TEXT,
  notes TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT,
  category TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_regions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES master_regions(id) ON DELETE SET NULL,
  notes TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE master_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_fertilizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read master crops"
  ON master_crops FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can write master crops"
  ON master_crops FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can read master varieties"
  ON master_varieties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can write master varieties"
  ON master_varieties FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can read master chemicals"
  ON master_chemicals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can write master chemicals"
  ON master_chemicals FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can read master fertilizers"
  ON master_fertilizers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can write master fertilizers"
  ON master_fertilizers FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can read master units"
  ON master_units FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can write master units"
  ON master_units FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can read master regions"
  ON master_regions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can write master regions"
  ON master_regions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can read master suppliers"
  ON master_suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can write master suppliers"
  ON master_suppliers FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_master_varieties_crop ON master_varieties(crop_id);
CREATE INDEX idx_master_chemicals_name ON master_chemicals(name);
CREATE INDEX idx_master_units_category ON master_units(category);
CREATE INDEX idx_master_suppliers_name ON master_suppliers(name);

ALTER TABLE master_crops ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE master_varieties ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE master_chemicals ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE master_fertilizers ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE master_units ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE master_regions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE master_suppliers ALTER COLUMN user_id SET DEFAULT auth.uid();
