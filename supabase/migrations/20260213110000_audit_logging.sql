-- Audit logging system - logs all changes for traceability

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  record_id UUID NOT NULL,
  before_values JSONB,
  after_values JSONB,
  changes JSONB, -- only the fields that changed
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);

-- Function to log changes
CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER AS $$
DECLARE
  v_changes JSONB;
BEGIN
  -- Calculate which fields changed (for UPDATE)
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, value)
    INTO v_changes
    FROM jsonb_each(to_jsonb(NEW))
    WHERE to_jsonb(OLD) ->> key IS DISTINCT FROM to_jsonb(NEW) ->> key;
  ELSE
    v_changes := NULL;
  END IF;

  INSERT INTO audit_logs (
    table_name,
    operation,
    user_id,
    record_id,
    before_values,
    after_values,
    changes
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    v_changes
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for master data tables
CREATE TRIGGER audit_master_crops
AFTER INSERT OR UPDATE OR DELETE ON master_crops
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_master_varieties
AFTER INSERT OR UPDATE OR DELETE ON master_varieties
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_master_chemicals
AFTER INSERT OR UPDATE OR DELETE ON master_chemicals
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_master_fertilizers
AFTER INSERT OR UPDATE OR DELETE ON master_fertilizers
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_master_units
AFTER INSERT OR UPDATE OR DELETE ON master_units
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_master_regions
AFTER INSERT OR UPDATE OR DELETE ON master_regions
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_master_suppliers
AFTER INSERT OR UPDATE OR DELETE ON master_suppliers
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_master_suggestions
AFTER INSERT OR UPDATE OR DELETE ON master_suggestions
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for harvest & field management
CREATE TRIGGER audit_fields
AFTER INSERT OR UPDATE OR DELETE ON fields
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_trees
AFTER INSERT OR UPDATE OR DELETE ON trees
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_harvest_records
AFTER INSERT OR UPDATE OR DELETE ON harvest_records
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for nursery management
CREATE TRIGGER audit_nursery_batches
AFTER INSERT OR UPDATE OR DELETE ON nursery_batches
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_nursery_suppliers
AFTER INSERT OR UPDATE OR DELETE ON nursery_suppliers
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_tree_mortality
AFTER INSERT OR UPDATE OR DELETE ON tree_mortality
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for spray management
CREATE TRIGGER audit_spray_chemicals
AFTER INSERT OR UPDATE OR DELETE ON spray_chemicals
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_spray_programs
AFTER INSERT OR UPDATE OR DELETE ON spray_programs
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_spray_program_items
AFTER INSERT OR UPDATE OR DELETE ON spray_program_items
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_spray_logs
AFTER INSERT OR UPDATE OR DELETE ON spray_logs
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for pest management
CREATE TRIGGER audit_pest_treatments
AFTER INSERT OR UPDATE OR DELETE ON pest_treatments
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for storage & traceability
CREATE TRIGGER audit_storage_locations
AFTER INSERT OR UPDATE OR DELETE ON storage_locations
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_storage_lots
AFTER INSERT OR UPDATE OR DELETE ON storage_lots
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_storage_movements
AFTER INSERT OR UPDATE OR DELETE ON storage_movements
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_storage_conditions
AFTER INSERT OR UPDATE OR DELETE ON storage_conditions
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_harvest_lot_links
AFTER INSERT OR UPDATE OR DELETE ON harvest_lot_links
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_storage_dispatches
AFTER INSERT OR UPDATE OR DELETE ON storage_dispatches
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for supplier & financial management
CREATE TRIGGER audit_suppliers
AFTER INSERT OR UPDATE OR DELETE ON suppliers
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_supplier_purchases
AFTER INSERT OR UPDATE OR DELETE ON supplier_purchases
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_supplier_payments
AFTER INSERT OR UPDATE OR DELETE ON supplier_payments
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_inventory
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_financial_entries
AFTER INSERT OR UPDATE OR DELETE ON financial_entries
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for orchard management
CREATE TRIGGER audit_orchards
AFTER INSERT OR UPDATE OR DELETE ON orchards
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_orchard_tree_points
AFTER INSERT OR UPDATE OR DELETE ON orchard_tree_points
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_orchard_lines
AFTER INSERT OR UPDATE OR DELETE ON orchard_lines
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_orchard_establishments
AFTER INSERT OR UPDATE OR DELETE ON orchard_establishments
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_orchard_establishment_varieties
AFTER INSERT OR UPDATE OR DELETE ON orchard_establishment_varieties
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_orchard_establishment_costs
AFTER INSERT OR UPDATE OR DELETE ON orchard_establishment_costs
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_orchard_establishment_mortality
AFTER INSERT OR UPDATE OR DELETE ON orchard_establishment_mortality
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for plantation register
CREATE TRIGGER audit_plantation_rows
AFTER INSERT OR UPDATE OR DELETE ON plantation_rows
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_plantation_trees
AFTER INSERT OR UPDATE OR DELETE ON plantation_trees
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for dead trees & user data
CREATE TRIGGER audit_dead_tree_records
AFTER INSERT OR UPDATE OR DELETE ON dead_tree_records
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_user_profiles
AFTER INSERT OR UPDATE OR DELETE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- Triggers for budgets & equipment
CREATE TRIGGER audit_budgets
AFTER INSERT OR UPDATE OR DELETE ON budgets
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_budget_items
AFTER INSERT OR UPDATE OR DELETE ON budget_items
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_equipment
AFTER INSERT OR UPDATE OR DELETE ON equipment
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_activities
AFTER INSERT OR UPDATE OR DELETE ON activities
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_crop_stage_library
AFTER INSERT OR UPDATE OR DELETE ON crop_stage_library
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- View for easy querying audit logs
CREATE OR REPLACE VIEW audit_summary AS
SELECT
  al.created_at,
  al.table_name,
  al.operation,
  up.name AS user_name,
  al.changes,
  al.record_id
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.user_id
ORDER BY al.created_at DESC;

-- Example queries to run in Supabase SQL Editor:
-- SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;
-- SELECT * FROM audit_summary WHERE created_at > NOW() - INTERVAL '7 days';
-- SELECT table_name, operation, COUNT(*) FROM audit_logs GROUP BY table_name, operation;
