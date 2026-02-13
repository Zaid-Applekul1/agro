-- Agronomist module schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'farmer'
  CHECK (role IN ('farmer', 'agronomist', 'admin'));

CREATE TABLE IF NOT EXISTS agronomists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  image_url TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  bio TEXT NOT NULL DEFAULT '',
  consultation_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  region_coverage TEXT[] NOT NULL DEFAULT '{}',
  qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agronomist_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orchard_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agronomist_id UUID REFERENCES agronomists(id) ON DELETE CASCADE NOT NULL,
  orchard_id UUID REFERENCES orchards(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'cancelled')),
  notes TEXT,
  problems TEXT[] NOT NULL DEFAULT '{}',
  fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  orchard_snapshot JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agronomist_treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES agronomist_bookings(id) ON DELETE CASCADE NOT NULL,
  agronomist_id UUID REFERENCES agronomists(id) ON DELETE CASCADE NOT NULL,
  orchard_id UUID REFERENCES orchards(id) ON DELETE SET NULL,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('draft', 'submitted', 'implemented')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agronomists ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomist_treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agronomists readable by authenticated users" ON agronomists;
CREATE POLICY "Agronomists readable by authenticated users"
  ON agronomists FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own agronomist profile" ON agronomists;
CREATE POLICY "Users can insert own agronomist profile"
  ON agronomists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own agronomist profile" ON agronomists;
CREATE POLICY "Users can update own agronomist profile"
  ON agronomists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update agronomists" ON agronomists;
CREATE POLICY "Admins can update agronomists"
  ON agronomists FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can delete own agronomist profile" ON agronomists;
CREATE POLICY "Users can delete own agronomist profile"
  ON agronomists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants can read bookings" ON agronomist_bookings;
CREATE POLICY "Participants can read bookings"
  ON agronomist_bookings FOR SELECT TO authenticated
  USING (
    auth.uid() = orchard_owner_id
    OR EXISTS (
      SELECT 1
      FROM agronomists a
      WHERE a.id = agronomist_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Farmers can create own bookings" ON agronomist_bookings;
CREATE POLICY "Farmers can create own bookings"
  ON agronomist_bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = orchard_owner_id);

DROP POLICY IF EXISTS "Participants can update bookings" ON agronomist_bookings;
CREATE POLICY "Participants can update bookings"
  ON agronomist_bookings FOR UPDATE TO authenticated
  USING (
    auth.uid() = orchard_owner_id
    OR EXISTS (
      SELECT 1
      FROM agronomists a
      WHERE a.id = agronomist_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Farmers can delete own bookings" ON agronomist_bookings;
CREATE POLICY "Farmers can delete own bookings"
  ON agronomist_bookings FOR DELETE TO authenticated
  USING (auth.uid() = orchard_owner_id);

DROP POLICY IF EXISTS "Participants can read treatments" ON agronomist_treatments;
CREATE POLICY "Participants can read treatments"
  ON agronomist_treatments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM agronomist_bookings b
      LEFT JOIN agronomists a ON a.id = b.agronomist_id
      WHERE b.id = booking_id
        AND (
          b.orchard_owner_id = auth.uid()
          OR a.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Assigned agronomist can create treatment" ON agronomist_treatments;
CREATE POLICY "Assigned agronomist can create treatment"
  ON agronomist_treatments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM agronomists a
      WHERE a.id = agronomist_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Assigned agronomist can update treatment" ON agronomist_treatments;
CREATE POLICY "Assigned agronomist can update treatment"
  ON agronomist_treatments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM agronomists a
      WHERE a.id = agronomist_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Assigned agronomist can delete treatment" ON agronomist_treatments;
CREATE POLICY "Assigned agronomist can delete treatment"
  ON agronomist_treatments FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM agronomists a
      WHERE a.id = agronomist_id
        AND a.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_agronomists_user_id ON agronomists(user_id);
CREATE INDEX IF NOT EXISTS idx_agronomists_verification_status ON agronomists(verification_status);
CREATE INDEX IF NOT EXISTS idx_agronomist_bookings_owner_id ON agronomist_bookings(orchard_owner_id);
CREATE INDEX IF NOT EXISTS idx_agronomist_bookings_agronomist_id ON agronomist_bookings(agronomist_id);
CREATE INDEX IF NOT EXISTS idx_agronomist_treatments_booking_id ON agronomist_treatments(booking_id);

ALTER TABLE agronomists ALTER COLUMN user_id SET DEFAULT auth.uid();
