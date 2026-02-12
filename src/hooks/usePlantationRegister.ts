import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type PlantationRow = Database['public']['Tables']['plantation_rows']['Row'];
type PlantationRowInsert = Database['public']['Tables']['plantation_rows']['Insert'];
type PlantationRowUpdate = Database['public']['Tables']['plantation_rows']['Update'];

type PlantationTree = Database['public']['Tables']['plantation_trees']['Row'];
type PlantationTreeInsert = Database['public']['Tables']['plantation_trees']['Insert'];
type PlantationTreeUpdate = Database['public']['Tables']['plantation_trees']['Update'];

type PlantationState = {
  rows: PlantationRow[];
  trees: PlantationTree[];
};

export function usePlantationRegister() {
  const [data, setData] = useState<PlantationState>({ rows: [], trees: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserId = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return null;
    return session?.user?.id ?? null;
  };

  const fetchData = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      const userId = await getUserId();
      if (!userId) {
        setData({ rows: [], trees: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      const [rowsRes, treesRes] = await Promise.all([
        supabase.from('plantation_rows').select('*').order('row_number', { ascending: true }),
        supabase.from('plantation_trees').select('*').order('tree_number', { ascending: true }),
      ]);
      if (rowsRes.error) throw rowsRes.error;
      if (treesRes.error) throw treesRes.error;

      setData({
        rows: rowsRes.data || [],
        trees: treesRes.data || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addRow = async (payload: PlantationRowInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add rows.' };
      }
      const { data, error } = await (supabase as any)
        .from('plantation_rows')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateRow = async (id: string, updates: PlantationRowUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('plantation_rows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addTree = async (payload: PlantationTreeInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add trees.' };
      }
      const { data, error } = await (supabase as any)
        .from('plantation_trees')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateTree = async (id: string, updates: PlantationTreeUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('plantation_trees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    rows: data.rows,
    trees: data.trees,
    loading,
    error,
    addRow,
    updateRow,
    addTree,
    updateTree,
    refetch: fetchData,
  };
}
