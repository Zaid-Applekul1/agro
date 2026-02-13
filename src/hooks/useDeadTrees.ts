import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type DeadTreeRecord = Database['public']['Tables']['dead_tree_records']['Row'];
type DeadTreeInsert = Database['public']['Tables']['dead_tree_records']['Insert'];
type DeadTreeUpdate = Database['public']['Tables']['dead_tree_records']['Update'];

export function useDeadTrees() {
  const [records, setRecords] = useState<DeadTreeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('dead_tree_records')
        .select('*')
        .order('recorded_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const addRecord = async (payload: DeadTreeInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('dead_tree_records')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchRecords();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateRecord = async (id: string, updates: DeadTreeUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('dead_tree_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchRecords();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    refetch: fetchRecords,
  };
}
