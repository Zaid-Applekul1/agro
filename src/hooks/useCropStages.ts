import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type CropStage = Database['public']['Tables']['crop_stage_library']['Row'];
type CropStageInsert = Database['public']['Tables']['crop_stage_library']['Insert'];
type CropStageRecord = Database['public']['Tables']['crop_stage_records']['Row'];
type CropStageRecordInsert = Database['public']['Tables']['crop_stage_records']['Insert'];

type CropStageState = {
  stages: CropStage[];
  records: CropStageRecord[];
};

const defaultStages: Array<{ name: string; order_index: number; description: string }> = [
  { name: 'Dormant', order_index: 1, description: 'Winter dormancy' },
  { name: 'Bud Break', order_index: 2, description: 'Bud swell and green tip' },
  { name: 'Flowering', order_index: 3, description: 'Full bloom' },
  { name: 'Fruit Set', order_index: 4, description: 'Fruitlets set' },
  { name: 'Maturity', order_index: 5, description: 'Harvest maturity' }
];

export function useCropStages() {
  const [data, setData] = useState<CropStageState>({ stages: [], records: [] });
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
        setData({ stages: [], records: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      const [stagesRes, recordsRes] = await Promise.all([
        supabase.from('crop_stage_library').select('*').order('order_index', { ascending: true }),
        supabase.from('crop_stage_records').select('*').order('stage_date', { ascending: false })
      ]);

      if (stagesRes.error) throw stagesRes.error;
      if (recordsRes.error) throw recordsRes.error;

      setData({
        stages: stagesRes.data || [],
        records: recordsRes.data || []
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

  const addStage = async (payload: CropStageInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add stages.' };
      }
      const { data, error } = await (supabase as any)
        .from('crop_stage_library')
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

  const addRecord = async (payload: CropStageRecordInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add stage records.' };
      }
      const { data, error } = await (supabase as any)
        .from('crop_stage_records')
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

  const seedDefaultStages = async () => {
    try {
      if (!supabaseConfigured) {
        return { error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { error: 'You must be signed in to seed stages.' };
      }
      const payload = defaultStages.map(stage => ({
        name: stage.name,
        order_index: stage.order_index,
        description: stage.description,
        user_id: userId
      }));
      const { error } = await (supabase as any)
        .from('crop_stage_library')
        .insert(payload);
      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    stages: data.stages,
    records: data.records,
    loading,
    error,
    addStage,
    addRecord,
    seedDefaultStages,
    refetch: fetchData
  };
}
