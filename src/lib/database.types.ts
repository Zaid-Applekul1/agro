export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      equipment: {
        Row: {
          condition: string | null
          created_at: string | null
          daily_cost: number
          equipment_type: string
          id: string
          last_maintenance: string | null
          name: string
          next_service: string | null
          ownership: string | null
          user_id: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          daily_cost?: number
          equipment_type: string
          id?: string
          last_maintenance?: string | null
          name: string
          next_service?: string | null
          ownership?: string | null
          user_id?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          daily_cost?: number
          equipment_type?: string
          id?: string
          last_maintenance?: string | null
          name?: string
          next_service?: string | null
          ownership?: string | null
          user_id?: string | null
        }
      }
      activities: {
        Row: {
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          status: string | null
          task_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          task_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          task_type?: string
          title?: string
          user_id?: string | null
        }
      spray_chemicals: {
        Row: {
          active_ingredient: string | null
          created_at: string | null
          crop: string | null
          dose_max: number | null
          dose_min: number | null
          dose_unit: string | null
          id: string
          name: string
          notes: string | null
          phi_days: number | null
          rei_hours: number | null
          target_pest: string | null
          user_id: string | null
        }
        Insert: {
          active_ingredient?: string | null
          created_at?: string | null
          crop?: string | null
          dose_max?: number | null
          dose_min?: number | null
          dose_unit?: string | null
          id?: string
          name: string
          notes?: string | null
          phi_days?: number | null
          rei_hours?: number | null
          target_pest?: string | null
          user_id?: string | null
        }
        Update: {
          active_ingredient?: string | null
          created_at?: string | null
          crop?: string | null
          dose_max?: number | null
          dose_min?: number | null
          dose_unit?: string | null
          id?: string
          name?: string
          notes?: string | null
          phi_days?: number | null
          rei_hours?: number | null
          target_pest?: string | null
          user_id?: string | null
        }
      }
      spray_programs: {
        Row: {
          created_at: string | null
          crop: string | null
          id: string
          name: string
          notes: string | null
          stage: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          crop?: string | null
          id?: string
          name: string
          notes?: string | null
          stage?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          crop?: string | null
          id?: string
          name?: string
          notes?: string | null
          stage?: string | null
          user_id?: string | null
        }
      }
      spray_program_items: {
        Row: {
          chemical_id: string | null
          created_at: string | null
          dose_rate: number | null
          dose_unit: string | null
          id: string
          interval_days: number | null
          notes: string | null
          program_id: string
          sort_order: number | null
          user_id: string | null
        }
        Insert: {
          chemical_id?: string | null
          created_at?: string | null
          dose_rate?: number | null
          dose_unit?: string | null
          id?: string
          interval_days?: number | null
          notes?: string | null
          program_id: string
          sort_order?: number | null
          user_id?: string | null
        }
        Update: {
          chemical_id?: string | null
          created_at?: string | null
          dose_rate?: number | null
          dose_unit?: string | null
          id?: string
          interval_days?: number | null
          notes?: string | null
          program_id?: string
          sort_order?: number | null
          user_id?: string | null
        }
      }
      spray_logs: {
        Row: {
          applied_at: string
          area_kanal: number | null
          chemical_id: string | null
          compliance_notes: string | null
          compliance_status: string | null
          created_at: string | null
          dose_rate: number
          dose_unit: string | null
          field_id: string | null
          id: string
          mix_volume_liters: number | null
          notes: string | null
          orchard_id: string | null
          phi_days: number | null
          program_id: string | null
          rei_hours: number | null
          target_issue: string | null
          total_product: number | null
          tree_block_id: string | null
          user_id: string | null
        }
        Insert: {
          applied_at: string
          area_kanal?: number | null
          chemical_id?: string | null
          compliance_notes?: string | null
          compliance_status?: string | null
          created_at?: string | null
          dose_rate: number
          dose_unit?: string | null
          field_id?: string | null
          id?: string
          mix_volume_liters?: number | null
          notes?: string | null
          orchard_id?: string | null
          phi_days?: number | null
          program_id?: string | null
          rei_hours?: number | null
          target_issue?: string | null
          total_product?: number | null
          tree_block_id?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string
          area_kanal?: number | null
          chemical_id?: string | null
          compliance_notes?: string | null
          compliance_status?: string | null
          created_at?: string | null
          dose_rate?: number
          dose_unit?: string | null
          field_id?: string | null
          id?: string
          mix_volume_liters?: number | null
          notes?: string | null
          orchard_id?: string | null
          phi_days?: number | null
          program_id?: string | null
          rei_hours?: number | null
          target_issue?: string | null
          total_product?: number | null
          tree_block_id?: string | null
          user_id?: string | null
        }
      }
      }
      dead_tree_records: {
        Row: {
          cause: string
          cost_per_plant: number | null
          created_at: string | null
          dead_count: number | null
          field_id: string | null
          id: string
          notes: string | null
          recorded_date: string
          replacement_count: number | null
          replacement_date: string | null
          replacement_source: string | null
          rootstock_source: string | null
          survival_rate_pct: number | null
          tree_id: string
          user_id: string | null
        }
        Insert: {
          cause: string
          cost_per_plant?: number | null
          created_at?: string | null
          dead_count?: number | null
          field_id?: string | null
          id?: string
          notes?: string | null
          recorded_date: string
          replacement_count?: number | null
          replacement_date?: string | null
          replacement_source?: string | null
          rootstock_source?: string | null
          survival_rate_pct?: number | null
          tree_id: string
          user_id?: string | null
        }
        Update: {
          cause?: string
          cost_per_plant?: number | null
          created_at?: string | null
          dead_count?: number | null
          field_id?: string | null
          id?: string
          notes?: string | null
          recorded_date?: string
          replacement_count?: number | null
          replacement_date?: string | null
          replacement_source?: string | null
          rootstock_source?: string | null
          survival_rate_pct?: number | null
          tree_id?: string
          user_id?: string | null
        }
      }
      orchards: {
        Row: {
          area_acres: number | null
          area_hectares: number | null
          boundary_geojson: Json
          created_at: string | null
          field_id: string | null
          id: string
          name: string
          tree_count: number | null
          user_id: string | null
        }
        Insert: {
          area_acres?: number | null
          area_hectares?: number | null
          boundary_geojson: Json
          created_at?: string | null
          field_id?: string | null
          id?: string
          name: string
          tree_count?: number | null
          user_id?: string | null
        }
        Update: {
          area_acres?: number | null
          area_hectares?: number | null
          boundary_geojson?: Json
          created_at?: string | null
          field_id?: string | null
          id?: string
          name?: string
          tree_count?: number | null
          user_id?: string | null
        }
      }
      orchard_tree_points: {
        Row: {
          id: string
          location_geojson: Json
          management_type: string
          orchard_id: string
          recorded_at: string | null
          season: string
          tree_block_id: string | null
          user_id: string | null
          variety: string
        }
        Insert: {
          id?: string
          location_geojson: Json
          management_type: string
          orchard_id: string
          recorded_at?: string | null
          season: string
          tree_block_id?: string | null
          user_id?: string | null
          variety: string
        }
        Update: {
          id?: string
          location_geojson?: Json
          management_type?: string
          orchard_id?: string
          recorded_at?: string | null
          season?: string
          tree_block_id?: string | null
          user_id?: string | null
          variety?: string
        }
      }
      orchard_lines: {
        Row: {
          created_at: string | null
          id: string
          line_geojson: Json
          line_type: string | null
          notes: string | null
          orchard_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_geojson: Json
          line_type?: string | null
          notes?: string | null
          orchard_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          line_geojson?: Json
          line_type?: string | null
          notes?: string | null
          orchard_id?: string
          user_id?: string | null
        }
      }
      nursery_suppliers: {
        Row: {
          id: string
          user_id: string | null
          name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          certification: string | null
          rating: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          certification?: string | null
          rating?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          certification?: string | null
          rating?: number | null
          notes?: string | null
          created_at?: string | null
        }
      }
      nursery_batches: {
        Row: {
          id: string
          user_id: string | null
          supplier_id: string | null
          field_id: string | null
          tree_block_id: string | null
          batch_number: string
          variety: string
          rootstock_type: string
          graft_method: string | null
          quantity: number
          cost_per_plant: number
          total_cost: number
          purchase_date: string
          planting_date: string | null
          planted_count: number | null
          survived_count: number | null
          mortality_count: number | null
          survival_rate: number | null
          source_location: string | null
          certification_number: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          supplier_id?: string | null
          field_id?: string | null
          tree_block_id?: string | null
          batch_number: string
          variety: string
          rootstock_type: string
          graft_method?: string | null
          quantity: number
          cost_per_plant: number
          total_cost: number
          purchase_date: string
          planting_date?: string | null
          planted_count?: number | null
          survived_count?: number | null
          mortality_count?: number | null
          survival_rate?: number | null
          source_location?: string | null
          certification_number?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          supplier_id?: string | null
          field_id?: string | null
          tree_block_id?: string | null
          batch_number?: string
          variety?: string
          rootstock_type?: string
          graft_method?: string | null
          quantity?: number
          cost_per_plant?: number
          total_cost?: number
          purchase_date?: string
          planting_date?: string | null
          planted_count?: number | null
          survived_count?: number | null
          mortality_count?: number | null
          survival_rate?: number | null
          source_location?: string | null
          certification_number?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      tree_mortality: {
        Row: {
          id: string
          user_id: string | null
          field_id: string | null
          tree_block_id: string | null
          nursery_batch_id: string | null
          orchard_id: string | null
          tree_identifier: string | null
          variety: string
          cause_of_death: string
          death_date: string
          tree_age_months: number | null
          replaced: boolean | null
          replacement_batch_id: string | null
          replacement_date: string | null
          replacement_cost: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          field_id?: string | null
          tree_block_id?: string | null
          nursery_batch_id?: string | null
          orchard_id?: string | null
          tree_identifier?: string | null
          variety: string
          cause_of_death: string
          death_date: string
          tree_age_months?: number | null
          replaced?: boolean | null
          replacement_batch_id?: string | null
          replacement_date?: string | null
          replacement_cost?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          field_id?: string | null
          tree_block_id?: string | null
          nursery_batch_id?: string | null
          orchard_id?: string | null
          tree_identifier?: string | null
          variety?: string
          cause_of_death?: string
          death_date?: string
          tree_age_months?: number | null
          replaced?: boolean | null
          replacement_batch_id?: string | null
          replacement_date?: string | null
          replacement_cost?: number | null
          notes?: string | null
          created_at?: string | null
        }
      }
      budgets: {
        Row: {
          alert_threshold_pct: number | null
          created_at: string | null
          crop_cycle: string | null
          end_date: string
          field_id: string | null
          id: string
          notes: string | null
          per_tree_budget: number | null
      orchard_costs: {
        Row: {
          amount: number
          cost_date: string
          cost_type: string
          created_at: string | null
          id: string
          notes: string | null
          orchard_id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          cost_date: string
          cost_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          orchard_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cost_date?: string
          cost_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          orchard_id?: string
          user_id?: string | null
        }
      }
          season: string
          start_date: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          alert_threshold_pct?: number | null
          created_at?: string | null
          crop_cycle?: string | null
          end_date: string
          field_id?: string | null
          id?: string
          notes?: string | null
          per_tree_budget?: number | null
          season: string
          start_date: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alert_threshold_pct?: number | null
          created_at?: string | null
          crop_cycle?: string | null
          end_date?: string
          field_id?: string | null
          id?: string
          notes?: string | null
          per_tree_budget?: number | null
          season?: string
          start_date?: string
          status?: string | null
          user_id?: string | null
        }
      }
      budget_items: {
        Row: {
          budget_id: string
          category: string
          created_at: string | null
          id: string
          planned_amount: number | null
          user_id: string | null
        }
        Insert: {
          budget_id: string
          category: string
          created_at?: string | null
          id?: string
          planned_amount?: number | null
          user_id?: string | null
        }
        Update: {
          budget_id?: string
          category?: string
          created_at?: string | null
          id?: string
          planned_amount?: number | null
          user_id?: string | null
        }
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string | null
          credit_period_days: number | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          status: string | null
          user_id: string | null
          vendor_code: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          credit_period_days?: number | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          user_id?: string | null
          vendor_code: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          credit_period_days?: number | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          user_id?: string | null
          vendor_code?: string
        }
      }
      supplier_purchases: {
        Row: {
          bill_url: string | null
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          purchase_date: string
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax: number | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          bill_url?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          purchase_date: string
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          bill_url?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          purchase_date?: string
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
      }
      supplier_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          method: string | null
          notes: string | null
          payment_date: string
          purchase_id: string | null
          reference: string | null
          supplier_id: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          payment_date: string
          purchase_id?: string | null
          reference?: string | null
          supplier_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          payment_date?: string
          purchase_id?: string | null
          reference?: string | null
          supplier_id?: string
          user_id?: string | null
        }
      }
      storage_locations: {
        Row: {
          capacity_units: number | null
          created_at: string | null
          id: string
          location_type: string
          name: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          capacity_units?: number | null
          created_at?: string | null
          id?: string
          location_type: string
          name: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          capacity_units?: number | null
          created_at?: string | null
          id?: string
          location_type?: string
          name?: string
          notes?: string | null
          user_id?: string | null
        }
      }
      storage_lots: {
        Row: {
          batch_code: string
          category: string
          container_capacity: string | null
          container_type: string | null
          created_at: string | null
          exit_date: string | null
          id: string
          item_name: string
          location_id: string
          notes: string | null
          status: string | null
          storage_date: string
          unit_count: number | null
          user_id: string | null
          variety: string | null
        }
        Insert: {
          batch_code: string
          category: string
          container_capacity?: string | null
          container_type?: string | null
          created_at?: string | null
          exit_date?: string | null
          id?: string
          item_name: string
          location_id: string
          notes?: string | null
          status?: string | null
          storage_date: string
          unit_count?: number | null
          user_id?: string | null
          variety?: string | null
        }
        Update: {
          batch_code?: string
          category?: string
          container_capacity?: string | null
          container_type?: string | null
          created_at?: string | null
          exit_date?: string | null
          id?: string
          item_name?: string
          location_id?: string
          notes?: string | null
          status?: string | null
          storage_date?: string
          unit_count?: number | null
          user_id?: string | null
          variety?: string | null
        }
      }
      storage_movements: {
        Row: {
          created_at: string | null
          id: string
          lot_id: string
          moved_at: string | null
          movement_type: string
          notes: string | null
          quantity_units: number
          reference: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lot_id: string
          moved_at?: string | null
          movement_type: string
          notes?: string | null
          quantity_units: number
          reference?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lot_id?: string
          moved_at?: string | null
          movement_type?: string
          notes?: string | null
          quantity_units?: number
          reference?: string | null
          user_id?: string | null
        }
      }
      storage_conditions: {
        Row: {
          condition_notes: string | null
          created_at: string | null
          humidity_pct: number | null
          id: string
          lot_id: string
          recorded_at: string | null
          temperature_c: number | null
          user_id: string | null
        }
        Insert: {
          condition_notes?: string | null
          created_at?: string | null
          humidity_pct?: number | null
          id?: string
          lot_id: string
          recorded_at?: string | null
          temperature_c?: number | null
          user_id?: string | null
        }
        Update: {
          condition_notes?: string | null
          created_at?: string | null
          humidity_pct?: number | null
          id?: string
          lot_id?: string
          recorded_at?: string | null
          temperature_c?: number | null
          user_id?: string | null
        }
      }
      storage_damage: {
        Row: {
          created_at: string | null
          damage_units: number | null
          id: string
          lot_id: string
          reason: string | null
          recorded_at: string | null
          shrinkage_units: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          damage_units?: number | null
          id?: string
          lot_id: string
          reason?: string | null
          recorded_at?: string | null
          shrinkage_units?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          damage_units?: number | null
          id?: string
          lot_id?: string
          reason?: string | null
          recorded_at?: string | null
          shrinkage_units?: number | null
          user_id?: string | null
        }
      }
      calendar_events: {
        Row: {
          category: string
          created_at: string | null
          event_date: string
          id: string
          notes: string | null
          reminder_channel: string | null
          reminder_days_before: number | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          event_date: string
          id?: string
          notes?: string | null
          reminder_channel?: string | null
          reminder_days_before?: number | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          event_date?: string
          id?: string
          notes?: string | null
          reminder_channel?: string | null
          reminder_days_before?: number | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
      }
      recurring_schedules: {
        Row: {
          category: string
          created_at: string | null
          frequency: string
          id: string
          interval_value: number | null
          next_date: string
          notes: string | null
          reminder_channel: string | null
          reminder_days_before: number | null
          start_date: string
          title: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          frequency: string
          id?: string
          interval_value?: number | null
          next_date: string
          notes?: string | null
          reminder_channel?: string | null
          reminder_days_before?: number | null
          start_date: string
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          frequency?: string
          id?: string
          interval_value?: number | null
          next_date?: string
          notes?: string | null
          reminder_channel?: string | null
          reminder_days_before?: number | null
          start_date?: string
          title?: string
          user_id?: string | null
        }
      }
      fertilizer_applications: {
        Row: {
          amount: number
          application_date: string
          cost: number
          created_at: string | null
          field_id: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          application_date: string
          cost?: number
          created_at?: string | null
          field_id?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          application_date?: string
          cost?: number
          created_at?: string | null
          field_id?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
      }
      fields: {
        Row: {
          area: number
          created_at: string | null
          crop: string
          id: string
          last_updated: string | null
          name: string
          planting_date: string
          user_id: string | null
        }
        Insert: {
          area: number
          created_at?: string | null
          crop: string
          id?: string
          last_updated?: string | null
          name: string
          planting_date: string
          user_id?: string | null
        }
        Update: {
          area?: number
          created_at?: string | null
          crop?: string
          id?: string
          last_updated?: string | null
          name?: string
          planting_date?: string
          user_id?: string | null
        }
      }
      plantation_rows: {
        Row: {
          created_at: string | null
          field_id: string
          id: string
          notes: string | null
          planting_date: string | null
          rootstock_type: string | null
          row_number: number
          user_id: string | null
          variety: string
        }
        Insert: {
          created_at?: string | null
          field_id: string
          id?: string
          notes?: string | null
          planting_date?: string | null
          rootstock_type?: string | null
          row_number: number
          user_id?: string | null
          variety: string
        }
        Update: {
          created_at?: string | null
          field_id?: string
          id?: string
          notes?: string | null
          planting_date?: string | null
          rootstock_type?: string | null
          row_number?: number
          user_id?: string | null
          variety?: string
        }
      }
      plantation_trees: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          planted_date: string | null
          row_id: string
          status: string
          tree_number: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          planted_date?: string | null
          row_id: string
          status: string
          tree_number: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          planted_date?: string | null
          row_id?: string
          status?: string
          tree_number?: number
          user_id?: string | null
        }
      }
      financial_entries: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          entry_date: string
          entry_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          description: string
          entry_date: string
          entry_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          entry_date?: string
          entry_type?: string
          id?: string
          user_id?: string | null
        }
      }
      harvest_records: {
        Row: {
          bin_count: number
          container_capacity: string | null
          container_type: string | null
          created_at: string | null
          harvest_date: string
          id: string
          lug_count: number
          picker: string
          price_per_bin: number
          price_unit: string | null
          quality_grade: string | null
          shelf_life_days: number | null
          storage_location: string | null
          total_revenue: number
          transport_vehicle: string | null
          tree_id: string | null
          user_id: string | null
          variety: string
        }
        Insert: {
          bin_count?: number
          container_capacity?: string | null
          container_type?: string | null
          created_at?: string | null
          harvest_date: string
          id?: string
          lug_count?: number
          picker: string
          price_per_bin?: number
          quality_grade?: string | null
          shelf_life_days?: number | null
          storage_location?: string | null
          total_revenue?: number
          transport_vehicle?: string | null
          tree_id?: string | null
          user_id?: string | null
          variety: string
            price_unit?: string | null
        }
        Update: {
          bin_count?: number
          container_capacity?: string | null
          container_type?: string | null
          created_at?: string | null
          harvest_date?: string
          id?: string
          lug_count?: number
          picker?: string
          price_per_bin?: number
          quality_grade?: string | null
          shelf_life_days?: number | null
          storage_location?: string | null
          total_revenue?: number
          transport_vehicle?: string | null
          tree_id?: string | null
          user_id?: string | null
          variety?: string
            price_unit?: string | null
        }
      }
      inventory: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          item_type: string
          name: string
          price_per_unit: number
          quantity: number
          supplier: string
          unit: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_type: string
          name: string
          price_per_unit?: number
          quantity?: number
          supplier: string
          unit: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_type?: string
          name?: string
          price_per_unit?: number
          quantity?: number
          supplier?: string
          unit?: string
          updated_at?: string | null
          user_id?: string | null
        }
      }
      pest_treatments: {
        Row: {
          application_date: string
          chemical: string
          completed: boolean | null
          cost: number
          created_at: string | null
          dosage: string
          effectiveness: string | null
          id: string
          next_treatment_due: string | null
          pest_type: string
          treatment_step: number
          tree_id: string | null
          user_id: string | null
        }
        Insert: {
          application_date: string
          chemical: string
          completed?: boolean | null
          cost?: number
          created_at?: string | null
          dosage: string
          effectiveness?: string | null
          id?: string
          next_treatment_due?: string | null
          pest_type: string
          treatment_step?: number
          tree_id?: string | null
          user_id?: string | null
        }
        Update: {
          application_date?: string
          chemical?: string
          completed?: boolean | null
          cost?: number
          created_at?: string | null
          dosage?: string
          effectiveness?: string | null
          id?: string
          next_treatment_due?: string | null
          pest_type?: string
          treatment_step?: number
          tree_id?: string | null
          user_id?: string | null
        }
      }
      trees: {
        Row: {
          created_at: string | null
          field_id: string | null
          id: string
          last_pruned: string | null
          planting_year: number
          row_number: number
          status: string | null
          tree_count: number
          user_id: string | null
          variety: string
          yield_estimate: number | null
        }
        Insert: {
          created_at?: string | null
          field_id?: string | null
          id?: string
          last_pruned?: string | null
          planting_year: number
          row_number: number
          status?: string | null
          tree_count?: number
          user_id?: string | null
          variety: string
          yield_estimate?: number | null
        }
        Update: {
          created_at?: string | null
          field_id?: string | null
          id?: string
          last_pruned?: string | null
          planting_year?: number
          row_number?: number
          status?: string | null
          tree_count?: number
          user_id?: string | null
          variety?: string
          yield_estimate?: number | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          phone: string | null
          khasra: string | null
          khata: string | null
          photograph_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          phone?: string | null
          khasra?: string | null
          khata?: string | null
          photograph_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          phone?: string | null
          khasra?: string | null
          khata?: string | null
          photograph_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}