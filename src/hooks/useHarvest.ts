import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type HarvestRecord = Database['public']['Tables']['harvest_records']['Row'] & {
  tree?: Database['public']['Tables']['trees']['Row'];
};

export function useHarvest() {
  const [harvest, setHarvest] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHarvest = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('harvest_records')
        .select(`
          *,
          tree:trees (*)
        `)
        .order('harvest_date', { ascending: false });

      if (error) throw error;
      setHarvest(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvest();
  }, []);

  const addHarvestRecord = async (harvestData: Database['public']['Tables']['harvest_records']['Insert']) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('harvest_records')
        .insert([harvestData])
        .select()
        .single();

      if (error) throw error;
      await fetchHarvest(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateHarvestRecord = async (
    id: string,
    updates: Database['public']['Tables']['harvest_records']['Update']
  ) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('harvest_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchHarvest();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    harvest,
    loading,
    error,
    addHarvestRecord,
    updateHarvestRecord,
    refetch: fetchHarvest,
  };
}