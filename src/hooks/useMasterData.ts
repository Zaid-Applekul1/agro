import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type MasterCrop = Database['public']['Tables']['master_crops']['Row'];
type MasterVariety = Database['public']['Tables']['master_varieties']['Row'];
type MasterChemical = Database['public']['Tables']['master_chemicals']['Row'];
type MasterFertilizer = Database['public']['Tables']['master_fertilizers']['Row'];
type MasterUnit = Database['public']['Tables']['master_units']['Row'];
type MasterRegion = Database['public']['Tables']['master_regions']['Row'];
type MasterSupplier = Database['public']['Tables']['master_suppliers']['Row'];

type MasterDataState = {
  crops: MasterCrop[];
  varieties: MasterVariety[];
  chemicals: MasterChemical[];
  fertilizers: MasterFertilizer[];
  units: MasterUnit[];
  regions: MasterRegion[];
  suppliers: MasterSupplier[];
  isAdmin: boolean;
};

export function useMasterData() {
  const [data, setData] = useState<MasterDataState>({
    crops: [],
    varieties: [],
    chemicals: [],
    fertilizers: [],
    units: [],
    regions: [],
    suppliers: [],
    isAdmin: false,
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
        setData({ crops: [], varieties: [], chemicals: [], fertilizers: [], units: [], regions: [], suppliers: [], isAdmin: false });
        setLoading(false);
        return;
      }

      setLoading(true);

      const [profileRes, cropsRes, varietiesRes, chemRes, fertRes, unitRes, regionRes, supplierRes] = await Promise.all([
        supabase.from('user_profiles').select('id, role').eq('user_id', userId).single(),
        supabase.from('master_crops').select('*').order('name', { ascending: true }),
        supabase.from('master_varieties').select('*').order('name', { ascending: true }),
        supabase.from('master_chemicals').select('*').order('name', { ascending: true }),
        supabase.from('master_fertilizers').select('*').order('name', { ascending: true }),
        supabase.from('master_units').select('*').order('name', { ascending: true }),
        supabase.from('master_regions').select('*').order('name', { ascending: true }),
        supabase.from('master_suppliers').select('*').order('name', { ascending: true }),
      ]);

      // Better error handling for profile query
      if (profileRes.error) {
        console.error('Profile query error:', profileRes.error);
        // Continue with admin = false if profile query fails
      }
      if (cropsRes.error) throw cropsRes.error;
      if (varietiesRes.error) throw varietiesRes.error;
      if (chemRes.error) throw chemRes.error;
      if (fertRes.error) throw fertRes.error;
      if (unitRes.error) throw unitRes.error;
      if (regionRes.error) throw regionRes.error;
      if (supplierRes.error) throw supplierRes.error;

      setData({
        crops: cropsRes.data || [],
        varieties: varietiesRes.data || [],
        chemicals: chemRes.data || [],
        fertilizers: fertRes.data || [],
        units: unitRes.data || [],
        regions: regionRes.data || [],
        suppliers: supplierRes.data || [],
        isAdmin: profileRes.data?.role === 'admin' || false,
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

  const addMasterRecord = async <T extends keyof Database['public']['Tables']>(
    table: T,
    payload: Database['public']['Tables'][T]['Insert']
  ) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from(table)
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteMasterRecord = async <T extends keyof Database['public']['Tables']>(
    table: T,
    recordId: string
  ) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { error } = await (supabase as any)
        .from(table)
        .delete()
        .eq('id', recordId);
      if (error) throw error;
      await fetchData();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    ...data,
    loading,
    error,
    addMasterRecord,
    deleteMasterRecord,
    refetch: fetchData,
  };
}
