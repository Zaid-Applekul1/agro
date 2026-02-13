-- User certifications and compliance tracking

CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  certification_type TEXT NOT NULL, -- 'GAP', 'Organic', 'Export', 'ISO', 'Fair Trade', 'Other'
  certification_name TEXT NOT NULL,
  file_url TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  renewal_reminder_days INTEGER DEFAULT 30,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

-- Admin can see all certifications
CREATE POLICY "Admins can manage all certifications"
  ON user_certifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can read own certifications"
  ON user_certifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certifications"
  ON user_certifications FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own certifications"
  ON user_certifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own certifications"
  ON user_certifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_certifications_user ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_expiry ON user_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_user_certifications_type ON user_certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_user_certifications_active ON user_certifications(is_active);

-- Trigger for audit logging
CREATE TRIGGER audit_user_certifications
AFTER INSERT OR UPDATE OR DELETE ON user_certifications
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- View for expiring certifications
CREATE OR REPLACE VIEW expiring_certifications AS
SELECT
  uc.id,
  uc.user_id,
  up.name as user_name,
  uc.certification_type,
  uc.certification_name,
  uc.expiry_date,
  uc.renewal_reminder_days,
  CURRENT_DATE + (uc.renewal_reminder_days || ' days')::INTERVAL as reminder_date,
  (uc.expiry_date - CURRENT_DATE) as days_until_expiry,
  CASE 
    WHEN uc.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN uc.expiry_date < CURRENT_DATE + (uc.renewal_reminder_days || ' days')::INTERVAL THEN 'expiring_soon'
    ELSE 'active'
  END as status
FROM user_certifications uc
LEFT JOIN user_profiles up ON uc.user_id = up.user_id
WHERE uc.is_active = TRUE
ORDER BY uc.expiry_date ASC;
-- Storage policies for certifications bucket
CREATE POLICY "Authenticated users can upload certificates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'certifications');

CREATE POLICY "Public read access for certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certifications');

CREATE POLICY "Users can delete their own certificates"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'certifications' AND owner = auth.uid());