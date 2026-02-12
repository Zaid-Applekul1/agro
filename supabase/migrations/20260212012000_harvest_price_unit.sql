-- Add price unit for harvest records

ALTER TABLE harvest_records
ADD COLUMN IF NOT EXISTS price_unit TEXT CHECK (price_unit IN ('per_container', 'per_kg')) DEFAULT 'per_container';
