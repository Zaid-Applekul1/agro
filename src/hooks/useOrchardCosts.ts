import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

type OrchardCost = {
  id: string;
  orchard_id: string;
  cost_type: string;
  amount: number;
  cost_date: string;
  notes: string | null;
  created_at: string | null;
  user_id: string | null;
};

type OrchardCostInsert = {
  orchard_id: string;
  cost_type: string;
  amount: number;
  cost_date: string;
  notes?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  id?: string;
};

type OrchardCostUpdate = Partial<OrchardCostInsert>;

export function useOrchardCosts() {
  const [costs, setCosts] = useState<OrchardCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCosts = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('orchard_costs')
        .select('*')
        .order('cost_date', { ascending: false });
      if (error) throw error;
      setCosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  const addCost = async (payload: OrchardCostInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_costs')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchCosts();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateCost = async (id: string, updates: OrchardCostUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('orchard_costs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchCosts();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteCost = async (id: string) => {
    try {
      if (!supabaseConfigured) {
        return { error: 'Supabase is not configured.' };
      }
      const { error } = await supabase.from('orchard_costs').delete().eq('id', id);
      if (error) throw error;
      await fetchCosts();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    costs,
    loading,
    error,
    addCost,
    updateCost,
    deleteCost,
    refetch: fetchCosts,
  };
}
