import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type SprayChemical = Database['public']['Tables']['spray_chemicals']['Row'];
type SprayChemicalInsert = Database['public']['Tables']['spray_chemicals']['Insert'];
type SprayChemicalUpdate = Database['public']['Tables']['spray_chemicals']['Update'];

type SprayProgram = Database['public']['Tables']['spray_programs']['Row'];
type SprayProgramInsert = Database['public']['Tables']['spray_programs']['Insert'];
type SprayProgramUpdate = Database['public']['Tables']['spray_programs']['Update'];

type SprayProgramItem = Database['public']['Tables']['spray_program_items']['Row'];
type SprayProgramItemInsert = Database['public']['Tables']['spray_program_items']['Insert'];

type SprayLog = Database['public']['Tables']['spray_logs']['Row'];
type SprayLogInsert = Database['public']['Tables']['spray_logs']['Insert'];

type SprayState = {
  chemicals: SprayChemical[];
  programs: SprayProgram[];
  programItems: SprayProgramItem[];
  logs: SprayLog[];
};

export function useSprayPrograms() {
  const [data, setData] = useState<SprayState>({
    chemicals: [],
    programs: [],
    programItems: [],
    logs: [],
  });
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
        setData({ chemicals: [], programs: [], programItems: [], logs: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      const [chemRes, progRes, itemRes, logRes] = await Promise.all([
        supabase.from('spray_chemicals').select('*').order('name', { ascending: true }),
        supabase.from('spray_programs').select('*').order('created_at', { ascending: false }),
        supabase.from('spray_program_items').select('*').order('sort_order', { ascending: true }),
        supabase.from('spray_logs').select('*').order('applied_at', { ascending: false }),
      ]);
      if (chemRes.error) throw chemRes.error;
      if (progRes.error) throw progRes.error;
      if (itemRes.error) throw itemRes.error;
      if (logRes.error) throw logRes.error;

      setData({
        chemicals: chemRes.data || [],
        programs: progRes.data || [],
        programItems: itemRes.data || [],
        logs: logRes.data || [],
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

  const addChemical = async (payload: SprayChemicalInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add chemicals.' };
      }
      const { data, error } = await (supabase as any)
        .from('spray_chemicals')
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

  const updateChemical = async (id: string, updates: SprayChemicalUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('spray_chemicals')
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

  const addProgram = async (payload: SprayProgramInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add programs.' };
      }
      const { data, error } = await (supabase as any)
        .from('spray_programs')
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

  const updateProgram = async (id: string, updates: SprayProgramUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('spray_programs')
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

  const addProgramItem = async (payload: SprayProgramItemInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add program items.' };
      }
      const { data, error } = await (supabase as any)
        .from('spray_program_items')
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

  const addLog = async (payload: SprayLogInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add spray logs.' };
      }
      const { data, error } = await (supabase as any)
        .from('spray_logs')
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

  return {
    chemicals: data.chemicals,
    programs: data.programs,
    programItems: data.programItems,
    logs: data.logs,
    loading,
    error,
    addChemical,
    updateChemical,
    addProgram,
    updateProgram,
    addProgramItem,
    addLog,
    refetch: fetchData,
  };
}
