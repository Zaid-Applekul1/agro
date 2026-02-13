-- Crop stage tracking: library and records

CREATE TABLE IF NOT EXISTS crop_stage_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_stage_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  tree_block_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  row_number INTEGER,
  variety TEXT,
  stage_id UUID REFERENCES crop_stage_library(id) ON DELETE CASCADE NOT NULL,
  stage_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crop_stage_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their crop stage library"
  ON crop_stage_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their crop stage library"
  ON crop_stage_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their crop stage library"
  ON crop_stage_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their crop stage library"
  ON crop_stage_library FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their crop stage records"
  ON crop_stage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their crop stage records"
  ON crop_stage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their crop stage records"
  ON crop_stage_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their crop stage records"
  ON crop_stage_records FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_crop_stage_records_field ON crop_stage_records(field_id);
CREATE INDEX idx_crop_stage_records_tree_block ON crop_stage_records(tree_block_id);
CREATE INDEX idx_crop_stage_records_stage ON crop_stage_records(stage_id);
CREATE INDEX idx_crop_stage_records_date ON crop_stage_records(stage_date);

ALTER TABLE crop_stage_library ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE crop_stage_records ALTER COLUMN user_id SET DEFAULT auth.uid();
