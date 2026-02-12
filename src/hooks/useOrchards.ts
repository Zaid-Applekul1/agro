import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Orchard = Database['public']['Tables']['orchards']['Row'];
type OrchardInsert = Database['public']['Tables']['orchards']['Insert'];
type OrchardUpdate = Database['public']['Tables']['orchards']['Update'];

type OrchardTreePoint = Database['public']['Tables']['orchard_tree_points']['Row'];
type OrchardTreeInsert = Database['public']['Tables']['orchard_tree_points']['Insert'];
type OrchardLine = Database['public']['Tables']['orchard_lines']['Row'];
type OrchardLineInsert = Database['public']['Tables']['orchard_lines']['Insert'];

type OrchardState = {
  orchards: Orchard[];
  trees: OrchardTreePoint[];
  lines: OrchardLine[];
};

export function useOrchards() {
  const [data, setData] = useState<OrchardState>({ orchards: [], trees: [], lines: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrchards = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const [orchardsRes, treesRes, linesRes] = await Promise.all([
        supabase.from('orchards').select('*').order('created_at', { ascending: false }),
        supabase.from('orchard_tree_points').select('*').order('recorded_at', { ascending: false }),
        supabase.from('orchard_lines').select('*').order('created_at', { ascending: false }),
      ]);

      if (orchardsRes.error) throw orchardsRes.error;
      if (treesRes.error) throw treesRes.error;
      if (linesRes.error) throw linesRes.error;

      setData({
        orchards: orchardsRes.data || [],
        trees: treesRes.data || [],
        lines: linesRes.data || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrchards();
  }, []);

  const addOrchard = async (payload: OrchardInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchards')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchOrchards();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateOrchard = async (id: string, updates: OrchardUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchOrchards();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addTreePoint = async (payload: OrchardTreeInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_tree_points')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      const { count } = await supabase
        .from('orchard_tree_points')
        .select('id', { count: 'exact', head: true })
        .eq('orchard_id', payload.orchard_id);
      if (typeof count === 'number') {
        await supabase
          .from('orchards')
          .update({ tree_count: count })
          .eq('id', payload.orchard_id);
      }
      await fetchOrchards();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addLine = async (payload: OrchardLineInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_lines')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchOrchards();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    orchards: data.orchards,
    treePoints: data.trees,
    lines: data.lines,
    loading,
    error,
    addOrchard,
    updateOrchard,
    addTreePoint,
    addLine,
    refetch: fetchOrchards,
  };
}
