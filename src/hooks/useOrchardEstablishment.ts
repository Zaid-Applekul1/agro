import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type EstablishmentTemplate = Database['public']['Tables']['orchard_establishment_templates']['Row'];
type EstablishmentTemplateInsert = Database['public']['Tables']['orchard_establishment_templates']['Insert'];
type EstablishmentTemplateUpdate = Database['public']['Tables']['orchard_establishment_templates']['Update'];

type Establishment = Database['public']['Tables']['orchard_establishments']['Row'];
type EstablishmentInsert = Database['public']['Tables']['orchard_establishments']['Insert'];

type EstablishmentVariety = Database['public']['Tables']['orchard_establishment_varieties']['Row'];
type EstablishmentVarietyInsert = Database['public']['Tables']['orchard_establishment_varieties']['Insert'];

type EstablishmentCost = Database['public']['Tables']['orchard_establishment_costs']['Row'];
type EstablishmentCostInsert = Database['public']['Tables']['orchard_establishment_costs']['Insert'];

type EstablishmentMortality = Database['public']['Tables']['orchard_establishment_mortality']['Row'];
type EstablishmentMortalityInsert = Database['public']['Tables']['orchard_establishment_mortality']['Insert'];

type EstablishmentReplacement = Database['public']['Tables']['orchard_establishment_replacements']['Row'];
type EstablishmentReplacementInsert = Database['public']['Tables']['orchard_establishment_replacements']['Insert'];

type YieldModel = Database['public']['Tables']['orchard_yield_models']['Row'];
type YieldModelInsert = Database['public']['Tables']['orchard_yield_models']['Insert'];
type YieldModelUpdate = Database['public']['Tables']['orchard_yield_models']['Update'];

type VisitLog = Database['public']['Tables']['orchard_visit_logs']['Row'];
type VisitLogInsert = Database['public']['Tables']['orchard_visit_logs']['Insert'];

type EstablishmentState = {
  templates: EstablishmentTemplate[];
  establishments: Establishment[];
  varieties: EstablishmentVariety[];
  costs: EstablishmentCost[];
  mortality: EstablishmentMortality[];
  replacements: EstablishmentReplacement[];
  yieldModels: YieldModel[];
  visitLogs: VisitLog[];
};

export function useOrchardEstablishment() {
  const [data, setData] = useState<EstablishmentState>({
    templates: [],
    establishments: [],
    varieties: [],
    costs: [],
    mortality: [],
    replacements: [],
    yieldModels: [],
    visitLogs: [],
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
        setData({
          templates: [],
          establishments: [],
          varieties: [],
          costs: [],
          mortality: [],
          replacements: [],
          yieldModels: [],
          visitLogs: [],
        });
        setLoading(false);
        return;
      }
      setLoading(true);
      const [templatesRes, estRes, varRes, costRes, mortalityRes, replRes, modelRes, visitRes] = await Promise.all([
        supabase.from('orchard_establishment_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('orchard_establishments').select('*').order('created_at', { ascending: false }),
        supabase.from('orchard_establishment_varieties').select('*').order('created_at', { ascending: true }),
        supabase.from('orchard_establishment_costs').select('*').order('created_at', { ascending: true }),
        supabase.from('orchard_establishment_mortality').select('*').order('created_at', { ascending: false }),
        supabase.from('orchard_establishment_replacements').select('*').order('created_at', { ascending: false }),
        supabase.from('orchard_yield_models').select('*').order('year_number', { ascending: true }),
        supabase.from('orchard_visit_logs').select('*').order('visit_date', { ascending: false }),
      ]);
      if (templatesRes.error) throw templatesRes.error;
      if (estRes.error) throw estRes.error;
      if (varRes.error) throw varRes.error;
      if (costRes.error) throw costRes.error;
      if (mortalityRes.error) throw mortalityRes.error;
      if (replRes.error) throw replRes.error;
      if (modelRes.error) throw modelRes.error;
      if (visitRes.error) throw visitRes.error;

      setData({
        templates: templatesRes.data || [],
        establishments: estRes.data || [],
        varieties: varRes.data || [],
        costs: costRes.data || [],
        mortality: mortalityRes.data || [],
        replacements: replRes.data || [],
        yieldModels: modelRes.data || [],
        visitLogs: visitRes.data || [],
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

  const addTemplate = async (payload: EstablishmentTemplateInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add templates.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_establishment_templates')
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

  const updateTemplate = async (id: string, updates: EstablishmentTemplateUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('orchard_establishment_templates')
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

  const addEstablishment = async (payload: EstablishmentInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add establishments.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_establishments')
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

  const addVariety = async (payload: EstablishmentVarietyInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add varieties.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_establishment_varieties')
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

  const addCost = async (payload: EstablishmentCostInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add costs.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_establishment_costs')
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

  const addMortality = async (payload: EstablishmentMortalityInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add mortality entries.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_establishment_mortality')
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

  const addReplacement = async (payload: EstablishmentReplacementInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add replacements.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_establishment_replacements')
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

  const addYieldModel = async (payload: YieldModelInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add yield models.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_yield_models')
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

  const updateYieldModel = async (id: string, updates: YieldModelUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('orchard_yield_models')
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

  const addVisit = async (payload: VisitLogInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add visit logs.' };
      }
      const { data, error } = await (supabase as any)
        .from('orchard_visit_logs')
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
    templates: data.templates,
    establishments: data.establishments,
    varieties: data.varieties,
    costs: data.costs,
    mortality: data.mortality,
    replacements: data.replacements,
    yieldModels: data.yieldModels,
    visitLogs: data.visitLogs,
    loading,
    error,
    addTemplate,
    updateTemplate,
    addEstablishment,
    addVariety,
    addCost,
    addMortality,
    addReplacement,
    addYieldModel,
    updateYieldModel,
    addVisit,
    refetch: fetchData,
  };
}
