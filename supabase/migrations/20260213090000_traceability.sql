-- Traceability: harvest to storage lot and dispatch

CREATE TABLE IF NOT EXISTS harvest_lot_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES storage_lots(id) ON DELETE CASCADE NOT NULL,
  harvest_id UUID REFERENCES harvest_records(id) ON DELETE CASCADE NOT NULL,
  container_type TEXT,
  container_capacity TEXT,
  container_count INTEGER DEFAULT 0,
  weight_kg DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS storage_dispatches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES storage_lots(id) ON DELETE CASCADE NOT NULL,
  dispatch_date DATE NOT NULL,
  quantity_units INTEGER DEFAULT 0,
  destination TEXT,
  vehicle TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE harvest_lot_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their harvest lot links"
  ON harvest_lot_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their harvest lot links"
  ON harvest_lot_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their harvest lot links"
  ON harvest_lot_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their harvest lot links"
  ON harvest_lot_links FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their storage dispatches"
  ON storage_dispatches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their storage dispatches"
  ON storage_dispatches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their storage dispatches"
  ON storage_dispatches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their storage dispatches"
  ON storage_dispatches FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_harvest_lot_links_lot ON harvest_lot_links(lot_id);
CREATE INDEX idx_harvest_lot_links_harvest ON harvest_lot_links(harvest_id);
CREATE INDEX idx_storage_dispatches_lot ON storage_dispatches(lot_id);
CREATE INDEX idx_storage_dispatches_date ON storage_dispatches(dispatch_date);

ALTER TABLE harvest_lot_links ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE storage_dispatches ALTER COLUMN user_id SET DEFAULT auth.uid();
