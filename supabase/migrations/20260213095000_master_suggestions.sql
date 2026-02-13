-- Master data suggestions/pending requests from users

CREATE TABLE IF NOT EXISTS master_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL, -- 'crop', 'variety', 'chemical', 'fertilizer', 'unit', 'region', 'supplier'
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., crop type field, supplier category
  suggested_value TEXT, -- the actual suggestion value
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'duplicate'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE master_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own suggestions"
  ON master_suggestions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create suggestions"
  ON master_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all suggestions"
  ON master_suggestions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update suggestion status"
  ON master_suggestions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_master_suggestions_user ON master_suggestions(user_id);
CREATE INDEX idx_master_suggestions_status ON master_suggestions(status);
CREATE INDEX idx_master_suggestions_type ON master_suggestions(suggestion_type);
