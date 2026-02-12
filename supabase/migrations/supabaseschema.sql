/*
  # Farm Management System Database Schema

  1. New Tables
    - `user_profiles` - Extended user information
    - `fields` - Farm field/orchard block management
    - `trees` - Tree block management with varieties
    - `harvest_records` - Apple harvest tracking
    - `pest_treatments` - Integrated pest management
    - `financial_entries` - Income and expense tracking
    - `inventory` - Fertilizer and pesticide inventory
    - `equipment` - Farm equipment registry
    - `fertilizer_applications` - Field fertilizer application history

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific data access
    - Ensure users can only access their own data

  3. Features
    - User-specific data isolation
    - Apple variety tracking
    - Quality grading system
    - Financial management
    - Equipment maintenance tracking
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (moved to end of file after new definition)

-- Fields table
CREATE TABLE IF NOT EXISTS fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  crop TEXT NOT NULL DEFAULT 'Apple Trees',
  planting_date DATE NOT NULL,
  growth_stage TEXT DEFAULT 'vegetative' CHECK (growth_stage IN ('seeding', 'vegetative', 'flowering', 'fruiting', 'harvesting')),
  weed_state TEXT DEFAULT 'low' CHECK (weed_state IN ('low', 'medium', 'high')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trees table
CREATE TABLE IF NOT EXISTS trees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  variety TEXT NOT NULL CHECK (variety IN ('Ambri', 'Royal Delicious', 'Red Delicious', 'Golden Delicious', 'Gala', 'Fuji')),
  row_number INTEGER NOT NULL,
  tree_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'diseased', 'pruned', 'dormant')),
  planting_year INTEGER NOT NULL,
  last_pruned DATE,
  yield_estimate INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Harvest records table
CREATE TABLE IF NOT EXISTS harvest_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  variety TEXT NOT NULL,
  bin_count INTEGER DEFAULT 0,
  lug_count INTEGER DEFAULT 0,
  quality_grade TEXT DEFAULT 'standard' CHECK (quality_grade IN ('premium', 'standard', 'processing')),
  harvest_date DATE NOT NULL,
  price_per_bin DECIMAL(10,2) DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  picker TEXT NOT NULL,
  storage_location TEXT,
  starch_index DECIMAL(3,1),
  shelf_life_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pest treatments table
CREATE TABLE IF NOT EXISTS pest_treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  pest_type TEXT NOT NULL CHECK (pest_type IN ('woolly_aphid', 'codling_moth', 'scale_insects', 'mites', 'leaf_roller')),
  treatment_step INTEGER DEFAULT 1,
  chemical TEXT NOT NULL,
  dosage TEXT NOT NULL,
  application_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  next_treatment_due DATE,
  cost DECIMAL(10,2) DEFAULT 0,
  effectiveness TEXT CHECK (effectiveness IN ('excellent', 'good', 'fair', 'poor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial entries table
CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sales', 'purchases', 'equipment', 'fertilizer', 'pesticide', 'labor', 'other')),
  amount DECIMAL(12,2) DEFAULT 0,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('fertilizer', 'pesticide')),
  quantity DECIMAL(10,2) DEFAULT 0,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL(10,2) DEFAULT 0,
  supplier TEXT NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  ownership TEXT DEFAULT 'owned' CHECK (ownership IN ('owned', 'leased')),
  daily_cost DECIMAL(10,2) DEFAULT 0,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  last_maintenance DATE,
  next_service DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL,
  due_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dead tree records table
CREATE TABLE IF NOT EXISTS dead_tree_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  recorded_date DATE NOT NULL,
  dead_count INTEGER DEFAULT 0,
  cause TEXT NOT NULL,
  replacement_source TEXT,
  rootstock_source TEXT,
  cost_per_plant DECIMAL(12,2) DEFAULT 0,
  replacement_count INTEGER DEFAULT 0,
  replacement_date DATE,
  survival_rate_pct DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orchards table
CREATE TABLE IF NOT EXISTS orchards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  boundary_geojson JSONB NOT NULL,
  area_hectares DECIMAL(12,4) DEFAULT 0,
  area_acres DECIMAL(12,4) DEFAULT 0,
  tree_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orchard tree points table
CREATE TABLE IF NOT EXISTS orchard_tree_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  orchard_id UUID REFERENCES orchards(id) ON DELETE CASCADE NOT NULL,
  tree_block_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  variety TEXT NOT NULL,
  season TEXT NOT NULL,
  management_type TEXT NOT NULL CHECK (management_type IN ('tree', 'field')),
  location_geojson JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orchard line features table
CREATE TABLE IF NOT EXISTS orchard_lines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  orchard_id UUID REFERENCES orchards(id) ON DELETE CASCADE NOT NULL,
  line_type TEXT DEFAULT 'row' CHECK (line_type IN ('row', 'path', 'irrigation', 'other')),
  line_geojson JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  season TEXT NOT NULL,
  crop_cycle TEXT,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  per_tree_budget DECIMAL(12,2) DEFAULT 0,
  alert_threshold_pct INTEGER DEFAULT 90 CHECK (alert_threshold_pct BETWEEN 0 AND 100),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget items table
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  planned_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_code TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  credit_period_days INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier purchases table
CREATE TABLE IF NOT EXISTS supplier_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT,
  purchase_date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'cancelled')),
  bill_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier payments table
CREATE TABLE IF NOT EXISTS supplier_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  purchase_id UUID REFERENCES supplier_purchases(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  method TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage locations table
CREATE TABLE IF NOT EXISTS storage_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('warehouse', 'ca')),
  capacity_units INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage lots table
CREATE TABLE IF NOT EXISTS storage_lots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES storage_locations(id) ON DELETE CASCADE NOT NULL,
  batch_code TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('produce', 'material')),
  item_name TEXT NOT NULL,
  variety TEXT,
  container_type TEXT DEFAULT 'crate' CHECK (container_type IN ('crate', 'box', 'bin', 'bag', 'other')),
  container_capacity TEXT,
  unit_count INTEGER DEFAULT 0,
  storage_date DATE NOT NULL,
  exit_date DATE,
  status TEXT DEFAULT 'stored' CHECK (status IN ('stored', 'released', 'damaged')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage movements table
CREATE TABLE IF NOT EXISTS storage_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES storage_lots(id) ON DELETE CASCADE NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity_units INTEGER NOT NULL,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage condition logs
CREATE TABLE IF NOT EXISTS storage_conditions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES storage_lots(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  temperature_c DECIMAL(5,2),
  humidity_pct DECIMAL(5,2),
  condition_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage damage logs
CREATE TABLE IF NOT EXISTS storage_damage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES storage_lots(id) ON DELETE CASCADE NOT NULL,
  damage_units INTEGER DEFAULT 0,
  shrinkage_units INTEGER DEFAULT 0,
  reason TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('activity', 'spray', 'fertilizer', 'service', 'visit', 'inventory', 'other')),
  event_date DATE NOT NULL,
  reminder_days_before INTEGER DEFAULT 2,
  reminder_channel TEXT DEFAULT 'in_app' CHECK (reminder_channel IN ('in_app', 'email', 'both')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring schedules table
CREATE TABLE IF NOT EXISTS recurring_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('spray', 'fertilizer', 'service', 'visit', 'other')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  interval_value INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  next_date DATE NOT NULL,
  reminder_days_before INTEGER DEFAULT 2,
  reminder_channel TEXT DEFAULT 'in_app' CHECK (reminder_channel IN ('in_app', 'email', 'both')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fertilizer applications table
CREATE TABLE IF NOT EXISTS fertilizer_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  application_date DATE NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_tree_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchards ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_tree_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchard_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_damage ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own fields" ON fields;
DROP POLICY IF EXISTS "Users can insert own fields" ON fields;
DROP POLICY IF EXISTS "Users can update own fields" ON fields;
DROP POLICY IF EXISTS "Users can delete own fields" ON fields;
DROP POLICY IF EXISTS "Users can read own trees" ON trees;
DROP POLICY IF EXISTS "Users can insert own trees" ON trees;
DROP POLICY IF EXISTS "Users can update own trees" ON trees;
DROP POLICY IF EXISTS "Users can delete own trees" ON trees;
DROP POLICY IF EXISTS "Users can read own harvest records" ON harvest_records;
DROP POLICY IF EXISTS "Users can insert own harvest records" ON harvest_records;
DROP POLICY IF EXISTS "Users can update own harvest records" ON harvest_records;
DROP POLICY IF EXISTS "Users can delete own harvest records" ON harvest_records;
DROP POLICY IF EXISTS "Users can read own pest treatments" ON pest_treatments;
DROP POLICY IF EXISTS "Users can insert own pest treatments" ON pest_treatments;
DROP POLICY IF EXISTS "Users can update own pest treatments" ON pest_treatments;
DROP POLICY IF EXISTS "Users can delete own pest treatments" ON pest_treatments;
DROP POLICY IF EXISTS "Users can read own financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can insert own financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can update own financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can delete own financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can read own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can read own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can insert own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can update own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can delete own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can read own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;
DROP POLICY IF EXISTS "Users can read own dead tree records" ON dead_tree_records;
DROP POLICY IF EXISTS "Users can insert own dead tree records" ON dead_tree_records;
DROP POLICY IF EXISTS "Users can update own dead tree records" ON dead_tree_records;
DROP POLICY IF EXISTS "Users can delete own dead tree records" ON dead_tree_records;
DROP POLICY IF EXISTS "Users can read own orchards" ON orchards;
DROP POLICY IF EXISTS "Users can insert own orchards" ON orchards;
DROP POLICY IF EXISTS "Users can update own orchards" ON orchards;
DROP POLICY IF EXISTS "Users can delete own orchards" ON orchards;
DROP POLICY IF EXISTS "Users can read own orchard tree points" ON orchard_tree_points;
DROP POLICY IF EXISTS "Users can insert own orchard tree points" ON orchard_tree_points;
DROP POLICY IF EXISTS "Users can update own orchard tree points" ON orchard_tree_points;
DROP POLICY IF EXISTS "Users can delete own orchard tree points" ON orchard_tree_points;
DROP POLICY IF EXISTS "Users can read own orchard lines" ON orchard_lines;
DROP POLICY IF EXISTS "Users can insert own orchard lines" ON orchard_lines;
DROP POLICY IF EXISTS "Users can update own orchard lines" ON orchard_lines;
DROP POLICY IF EXISTS "Users can delete own orchard lines" ON orchard_lines;
DROP POLICY IF EXISTS "Users can read own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can read own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can insert own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can update own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can delete own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can read own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can read own supplier purchases" ON supplier_purchases;
DROP POLICY IF EXISTS "Users can insert own supplier purchases" ON supplier_purchases;
DROP POLICY IF EXISTS "Users can update own supplier purchases" ON supplier_purchases;
DROP POLICY IF EXISTS "Users can delete own supplier purchases" ON supplier_purchases;
DROP POLICY IF EXISTS "Users can read own supplier payments" ON supplier_payments;
DROP POLICY IF EXISTS "Users can insert own supplier payments" ON supplier_payments;
DROP POLICY IF EXISTS "Users can update own supplier payments" ON supplier_payments;
DROP POLICY IF EXISTS "Users can delete own supplier payments" ON supplier_payments;
DROP POLICY IF EXISTS "Users can read own storage locations" ON storage_locations;
DROP POLICY IF EXISTS "Users can insert own storage locations" ON storage_locations;
DROP POLICY IF EXISTS "Users can update own storage locations" ON storage_locations;
DROP POLICY IF EXISTS "Users can delete own storage locations" ON storage_locations;
DROP POLICY IF EXISTS "Users can read own storage lots" ON storage_lots;
DROP POLICY IF EXISTS "Users can insert own storage lots" ON storage_lots;
DROP POLICY IF EXISTS "Users can update own storage lots" ON storage_lots;
DROP POLICY IF EXISTS "Users can delete own storage lots" ON storage_lots;
DROP POLICY IF EXISTS "Users can read own storage movements" ON storage_movements;
DROP POLICY IF EXISTS "Users can insert own storage movements" ON storage_movements;
DROP POLICY IF EXISTS "Users can update own storage movements" ON storage_movements;
DROP POLICY IF EXISTS "Users can delete own storage movements" ON storage_movements;
DROP POLICY IF EXISTS "Users can read own storage conditions" ON storage_conditions;
DROP POLICY IF EXISTS "Users can insert own storage conditions" ON storage_conditions;
DROP POLICY IF EXISTS "Users can update own storage conditions" ON storage_conditions;
DROP POLICY IF EXISTS "Users can delete own storage conditions" ON storage_conditions;
DROP POLICY IF EXISTS "Users can read own storage damage" ON storage_damage;
DROP POLICY IF EXISTS "Users can insert own storage damage" ON storage_damage;
DROP POLICY IF EXISTS "Users can update own storage damage" ON storage_damage;
DROP POLICY IF EXISTS "Users can delete own storage damage" ON storage_damage;
DROP POLICY IF EXISTS "Users can read own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can read own recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Users can insert own recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Users can update own recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Users can delete own recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Users can read own fertilizer applications" ON fertilizer_applications;
DROP POLICY IF EXISTS "Users can insert own fertilizer applications" ON fertilizer_applications;
DROP POLICY IF EXISTS "Users can update own fertilizer applications" ON fertilizer_applications;
DROP POLICY IF EXISTS "Users can delete own fertilizer applications" ON fertilizer_applications;

-- Fields policies
CREATE POLICY "Users can read own fields"
  ON fields
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fields"
  ON fields
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fields"
  ON fields
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fields"
  ON fields
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trees policies
CREATE POLICY "Users can read own trees"
  ON trees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trees"
  ON trees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trees"
  ON trees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trees"
  ON trees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Harvest records policies
CREATE POLICY "Users can read own harvest records"
  ON harvest_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own harvest records"
  ON harvest_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own harvest records"
  ON harvest_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own harvest records"
  ON harvest_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Pest treatments policies
CREATE POLICY "Users can read own pest treatments"
  ON pest_treatments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pest treatments"
  ON pest_treatments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pest treatments"
  ON pest_treatments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pest treatments"
  ON pest_treatments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Financial entries policies
CREATE POLICY "Users can read own financial entries"
  ON financial_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial entries"
  ON financial_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial entries"
  ON financial_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial entries"
  ON financial_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Inventory policies
CREATE POLICY "Users can read own inventory"
  ON inventory
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON inventory
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON inventory
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Equipment policies
CREATE POLICY "Users can read own equipment"
  ON equipment
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment"
  ON equipment
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment"
  ON equipment
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment"
  ON equipment
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Dead tree records policies
CREATE POLICY "Users can read own dead tree records"
  ON dead_tree_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dead tree records"
  ON dead_tree_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dead tree records"
  ON dead_tree_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dead tree records"
  ON dead_tree_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orchards policies
CREATE POLICY "Users can read own orchards"
  ON orchards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orchards"
  ON orchards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orchards"
  ON orchards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orchards"
  ON orchards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orchard tree points policies
CREATE POLICY "Users can read own orchard tree points"
  ON orchard_tree_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orchard tree points"
  ON orchard_tree_points
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orchard tree points"
  ON orchard_tree_points
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orchard tree points"
  ON orchard_tree_points
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orchard line policies
CREATE POLICY "Users can read own orchard lines"
  ON orchard_lines
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orchard lines"
  ON orchard_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orchard lines"
  ON orchard_lines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orchard lines"
  ON orchard_lines
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can read own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Budget items policies
CREATE POLICY "Users can read own budget items"
  ON budget_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget items"
  ON budget_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget items"
  ON budget_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget items"
  ON budget_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Suppliers policies
CREATE POLICY "Users can read own suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Supplier purchases policies
CREATE POLICY "Users can read own supplier purchases"
  ON supplier_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplier purchases"
  ON supplier_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplier purchases"
  ON supplier_purchases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplier purchases"
  ON supplier_purchases
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Supplier payments policies
CREATE POLICY "Users can read own supplier payments"
  ON supplier_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplier payments"
  ON supplier_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplier payments"
  ON supplier_payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplier payments"
  ON supplier_payments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage locations policies
CREATE POLICY "Users can read own storage locations"
  ON storage_locations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage locations"
  ON storage_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage locations"
  ON storage_locations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage locations"
  ON storage_locations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage lots policies
CREATE POLICY "Users can read own storage lots"
  ON storage_lots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage lots"
  ON storage_lots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage lots"
  ON storage_lots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage lots"
  ON storage_lots
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage movements policies
CREATE POLICY "Users can read own storage movements"
  ON storage_movements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage movements"
  ON storage_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage movements"
  ON storage_movements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage movements"
  ON storage_movements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage condition policies
CREATE POLICY "Users can read own storage conditions"
  ON storage_conditions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage conditions"
  ON storage_conditions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage conditions"
  ON storage_conditions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage conditions"
  ON storage_conditions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage damage policies
CREATE POLICY "Users can read own storage damage"
  ON storage_damage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage damage"
  ON storage_damage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage damage"
  ON storage_damage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage damage"
  ON storage_damage
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Calendar events policies
CREATE POLICY "Users can read own calendar events"
  ON calendar_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
  ON calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON calendar_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON calendar_events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recurring schedules policies
CREATE POLICY "Users can read own recurring schedules"
  ON recurring_schedules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring schedules"
  ON recurring_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring schedules"
  ON recurring_schedules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring schedules"
  ON recurring_schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fertilizer applications policies
CREATE POLICY "Users can read own fertilizer applications"
  ON fertilizer_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fertilizer applications"
  ON fertilizer_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fertilizer applications"
  ON fertilizer_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fertilizer applications"
  ON fertilizer_applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);
CREATE INDEX IF NOT EXISTS idx_trees_user_id ON trees(user_id);
CREATE INDEX IF NOT EXISTS idx_trees_field_id ON trees(field_id);
CREATE INDEX IF NOT EXISTS idx_harvest_records_user_id ON harvest_records(user_id);
CREATE INDEX IF NOT EXISTS idx_harvest_records_tree_id ON harvest_records(tree_id);
CREATE INDEX IF NOT EXISTS idx_pest_treatments_user_id ON pest_treatments(user_id);
CREATE INDEX IF NOT EXISTS idx_pest_treatments_tree_id ON pest_treatments(tree_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_user_id ON financial_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_dead_tree_records_user_id ON dead_tree_records(user_id);
CREATE INDEX IF NOT EXISTS idx_dead_tree_records_tree_id ON dead_tree_records(tree_id);
CREATE INDEX IF NOT EXISTS idx_dead_tree_records_field_id ON dead_tree_records(field_id);
CREATE INDEX IF NOT EXISTS idx_dead_tree_records_date ON dead_tree_records(recorded_date);
CREATE INDEX IF NOT EXISTS idx_orchards_user_id ON orchards(user_id);
CREATE INDEX IF NOT EXISTS idx_orchards_field_id ON orchards(field_id);
CREATE INDEX IF NOT EXISTS idx_orchard_tree_points_user_id ON orchard_tree_points(user_id);
CREATE INDEX IF NOT EXISTS idx_orchard_tree_points_orchard_id ON orchard_tree_points(orchard_id);
CREATE INDEX IF NOT EXISTS idx_orchard_tree_points_tree_block_id ON orchard_tree_points(tree_block_id);
CREATE INDEX IF NOT EXISTS idx_orchard_lines_user_id ON orchard_lines(user_id);
CREATE INDEX IF NOT EXISTS idx_orchard_lines_orchard_id ON orchard_lines(orchard_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_field_id ON budgets(field_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_vendor_code ON suppliers(user_id, vendor_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_purchases_user_id ON supplier_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_purchases_supplier_id ON supplier_purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_purchases_due_date ON supplier_purchases(due_date);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_user_id ON supplier_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier_id ON supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_purchase_id ON supplier_payments(purchase_id);
CREATE INDEX IF NOT EXISTS idx_storage_locations_user_id ON storage_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_lots_user_id ON storage_lots(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_lots_location_id ON storage_lots(location_id);
CREATE INDEX IF NOT EXISTS idx_storage_movements_lot_id ON storage_movements(lot_id);
CREATE INDEX IF NOT EXISTS idx_storage_conditions_lot_id ON storage_conditions(lot_id);
CREATE INDEX IF NOT EXISTS idx_storage_damage_lot_id ON storage_damage(lot_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_user_id ON recurring_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_next_date ON recurring_schedules(next_date);
CREATE INDEX IF NOT EXISTS idx_fertilizer_applications_user_id ON fertilizer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_applications_field_id ON fertilizer_applications(field_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to inventory table
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  -- 🛠️ THE AUTOMATIC USER ID PATCH 🛠️
-- Run this ONCE to make your database auto-fill the user_id

ALTER TABLE fields ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE trees ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE harvest_records ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE pest_treatments ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE financial_entries ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE inventory ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE equipment ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE activities ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE dead_tree_records ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchards ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_tree_points ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE orchard_lines ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE budgets ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE budget_items ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE suppliers ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE supplier_purchases ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE supplier_payments ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE storage_locations ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE storage_lots ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE storage_movements ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE storage_conditions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE storage_damage ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE calendar_events ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE recurring_schedules ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE fertilizer_applications ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Force the API to refresh immediately
NOTIFY pgrst, 'reload schema';
-- 1. Remove the misplaced columns from 'fields'
ALTER TABLE fields DROP COLUMN IF EXISTS transport_vehicle;
ALTER TABLE fields DROP COLUMN IF EXISTS harvest_container_type;
ALTER TABLE fields DROP COLUMN IF EXISTS harvest_container_capacity;

-- 2. Add them to the correct 'harvest_records' table
ALTER TABLE harvest_records ADD COLUMN IF NOT EXISTS transport_vehicle TEXT;
ALTER TABLE harvest_records ADD COLUMN IF NOT EXISTS container_type TEXT DEFAULT 'bin';
ALTER TABLE harvest_records ADD COLUMN IF NOT EXISTS container_capacity TEXT DEFAULT '20';
-- Drop existing storage policies first
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "User update own photos" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'Farmer-Photographs');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'Farmer-Photographs' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own photos
CREATE POLICY "User update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'Farmer-Photographs'
    AND auth.uid() = owner
  );

-- Drop existing supplier bill policies first
DROP POLICY IF EXISTS "Supplier bills read access" ON storage.objects;
DROP POLICY IF EXISTS "Supplier bills upload" ON storage.objects;
DROP POLICY IF EXISTS "Supplier bills update" ON storage.objects;

-- Allow public read access for supplier bills
CREATE POLICY "Supplier bills read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'Supplier-Bills');

-- Allow authenticated users to upload supplier bills
CREATE POLICY "Supplier bills upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'Supplier-Bills'
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own supplier bills
CREATE POLICY "Supplier bills update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'Supplier-Bills'
    AND auth.uid() = owner
  );
  -- DROP and recreate user_profiles table with new schema
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  khasra TEXT,
  khata TEXT,
  photograph_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- User profiles policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Updated trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();