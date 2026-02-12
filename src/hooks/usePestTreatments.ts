import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type PestTreatment = Database['public']['Tables']['pest_treatments']['Row'] & {
  tree?: Database['public']['Tables']['trees']['Row'];
};

export function usePestTreatments() {
  const [pestTreatments, setPestTreatments] = useState<PestTreatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPestTreatments = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('pest_treatments')
        .select(`
          *,
          tree:trees (*)
        `)
        .order('application_date', { ascending: false });

      if (error) throw error;
      setPestTreatments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPestTreatments();
  }, []);

  const addPestTreatment = async (treatmentData: Database['public']['Tables']['pest_treatments']['Insert']) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('pest_treatments')
        .insert([treatmentData])
        .select()
        .single();

      if (error) throw error;
      await fetchPestTreatments(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updatePestTreatment = async (id: string, updates: Database['public']['Tables']['pest_treatments']['Update']) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('pest_treatments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchPestTreatments(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    pestTreatments,
    loading,
    error,
    addPestTreatment,
    updatePestTreatment,
    refetch: fetchPestTreatments,
  };
}