import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

type SupplierPurchase = Database['public']['Tables']['supplier_purchases']['Row'];
type SupplierPurchaseInsert = Database['public']['Tables']['supplier_purchases']['Insert'];
type SupplierPurchaseUpdate = Database['public']['Tables']['supplier_purchases']['Update'];

type SupplierPayment = Database['public']['Tables']['supplier_payments']['Row'];
type SupplierPaymentInsert = Database['public']['Tables']['supplier_payments']['Insert'];

type UploadResult = { url: string | null; error: string | null };

type SupplierDataState = {
  suppliers: Supplier[];
  purchases: SupplierPurchase[];
  payments: SupplierPayment[];
};

export function useSuppliers() {
  const [data, setData] = useState<SupplierDataState>({
    suppliers: [],
    purchases: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);

      const [suppliersRes, purchasesRes, paymentsRes] = await Promise.all([
        supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
        supabase.from('supplier_purchases').select('*').order('purchase_date', { ascending: false }),
        supabase.from('supplier_payments').select('*').order('payment_date', { ascending: false }),
      ]);

      if (suppliersRes.error) throw suppliersRes.error;
      if (purchasesRes.error) throw purchasesRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      setData({
        suppliers: suppliersRes.data || [],
        purchases: purchasesRes.data || [],
        payments: paymentsRes.data || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const addSupplier = async (payload: SupplierInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('suppliers')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchSuppliers();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateSupplier = async (id: string, updates: SupplierUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchSuppliers();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addPurchase = async (payload: SupplierPurchaseInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('supplier_purchases')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchSuppliers();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updatePurchase = async (id: string, updates: SupplierPurchaseUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('supplier_purchases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchSuppliers();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addPayment = async (payload: SupplierPaymentInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('supplier_payments')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchSuppliers();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const uploadSupplierBill = async (file: File, userId: string): Promise<UploadResult> => {
    try {
      if (!supabaseConfigured) {
        return { error: 'Supabase is not configured.', url: null };
      }
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('Supplier-Bills')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('Supplier-Bills')
        .getPublicUrl(fileName);

      return { error: null, url: publicUrl };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Upload failed', url: null };
    }
  };

  return {
    suppliers: data.suppliers,
    purchases: data.purchases,
    payments: data.payments,
    loading,
    error,
    addSupplier,
    updateSupplier,
    addPurchase,
    updatePurchase,
    addPayment,
    uploadSupplierBill,
    refetch: fetchSuppliers,
  };
}
