-- Nursery & Plant Material Management Schema

-- Nursery Suppliers Registry
CREATE TABLE IF NOT EXISTS nursery_suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  certification TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nursery Plant Batches (Purchase Records)
CREATE TABLE IF NOT EXISTS nursery_batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES nursery_suppliers(id) ON DELETE SET NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  tree_block_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL,
  variety TEXT NOT NULL,
  rootstock_type TEXT NOT NULL,
  graft_method TEXT,
  quantity INTEGER NOT NULL,
  cost_per_plant DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) NOT NULL,
  purchase_date DATE NOT NULL,
  planting_date DATE,
  planted_count INTEGER DEFAULT 0,
  survived_count INTEGER DEFAULT 0,
  mortality_count INTEGER DEFAULT 0,
  survival_rate DECIMAL(5,2) DEFAULT 0,
  source_location TEXT,
  certification_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tree Mortality Records
CREATE TABLE IF NOT EXISTS tree_mortality (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  tree_block_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  nursery_batch_id UUID REFERENCES nursery_batches(id) ON DELETE SET NULL,
  orchard_id UUID REFERENCES orchards(id) ON DELETE SET NULL,
  tree_identifier TEXT,
  variety TEXT NOT NULL,
  cause_of_death TEXT NOT NULL CHECK (cause_of_death IN (
    'disease',
    'pest',
    'weather',
    'water_stress',
    'mechanical_damage',
    'poor_rootstock',
    'transplant_shock',
    'soil_issues',
    'age',
    'unknown',
    'other'
  )),
  death_date DATE NOT NULL,
  tree_age_months INTEGER,
  replaced BOOLEAN DEFAULT FALSE,
  replacement_batch_id UUID REFERENCES nursery_batches(id) ON DELETE SET NULL,
  replacement_date DATE,
  replacement_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nursery_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursery_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_mortality ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nursery_suppliers
CREATE POLICY "Users can view their own suppliers"
  ON nursery_suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
  ON nursery_suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON nursery_suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON nursery_suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for nursery_batches
CREATE POLICY "Users can view their own batches"
  ON nursery_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own batches"
  ON nursery_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches"
  ON nursery_batches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches"
  ON nursery_batches FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tree_mortality
CREATE POLICY "Users can view their own mortality records"
  ON tree_mortality FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mortality records"
  ON tree_mortality FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mortality records"
  ON tree_mortality FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mortality records"
  ON tree_mortality FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_nursery_suppliers_user ON nursery_suppliers(user_id);
CREATE INDEX idx_nursery_batches_user ON nursery_batches(user_id);
CREATE INDEX idx_nursery_batches_supplier ON nursery_batches(supplier_id);
CREATE INDEX idx_nursery_batches_field ON nursery_batches(field_id);
CREATE INDEX idx_tree_mortality_user ON tree_mortality(user_id);
CREATE INDEX idx_tree_mortality_field ON tree_mortality(field_id);
CREATE INDEX idx_tree_mortality_batch ON tree_mortality(nursery_batch_id);

-- Default user_id from auth
ALTER TABLE nursery_suppliers ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE nursery_batches ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE tree_mortality ALTER COLUMN user_id SET DEFAULT auth.uid();
