import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

export type CertificationType = 'GAP' | 'Organic' | 'Export' | 'ISO' | 'Fair Trade' | 'Other';

export interface UserCertification {
  id: string;
  user_id: string;
  certification_type: CertificationType;
  certification_name: string;
  file_url: string | null;
  issue_date: string;
  expiry_date: string;
  renewal_reminder_days: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificationStatus {
  id: string;
  status: 'active' | 'expiring_soon' | 'expired';
  daysUntilExpiry: number;
}

export const useCertifications = () => {
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertifications = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured');
        setLoading(false);
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setCertifications([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('expiry_date', { ascending: true });

      if (fetchError) throw fetchError;
      setCertifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching certifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const addCertification = async (
    certType: CertificationType,
    certName: string,
    issueDate: string,
    expiryDate: string,
    reminderDays: number = 30,
    notes?: string,
    file?: File
  ) => {
    try {
      if (!supabaseConfigured) return { data: null, error: 'Supabase not configured' };

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return { data: null, error: 'Not authenticated' };

      let fileUrl: string | null = null;

      if (file) {
        const timestamp = Date.now();
        const filePath = `${user.id}/${timestamp}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('certifications')
          .upload(filePath, file);

        if (uploadError) {
          return { data: null, error: `Upload failed: ${uploadError.message}` };
        }

        const { data: publicUrl } = supabase.storage
          .from('certifications')
          .getPublicUrl(filePath);

        fileUrl = publicUrl.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('user_certifications')
        .insert([
          {
            user_id: user.id,
            certification_type: certType,
            certification_name: certName,
            file_url: fileUrl,
            issue_date: issueDate,
            expiry_date: expiryDate,
            renewal_reminder_days: reminderDays,
            notes: notes || null,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchCertifications();
      return { data, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add certification';
      return { data: null, error: errorMsg };
    }
  };

  const deleteCertification = async (certId: string) => {
    try {
      if (!supabaseConfigured) return { data: null, error: 'Supabase not configured' };

      const { error: deleteError } = await supabase
        .from('user_certifications')
        .delete()
        .eq('id', certId);

      if (deleteError) throw deleteError;

      await fetchCertifications();
      return { data: true, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete certification';
      return { data: null, error: errorMsg };
    }
  };

  const getCertificationStatus = (cert: UserCertification): CertificationStatus => {
    const today = new Date();
    const expiryDate = new Date(cert.expiry_date);
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(reminderDate.getDate() - cert.renewal_reminder_days);

    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: 'active' | 'expiring_soon' | 'expired';
    if (expiryDate < today) {
      status = 'expired';
    } else if (today >= reminderDate) {
      status = 'expiring_soon';
    } else {
      status = 'active';
    }

    return {
      id: cert.id,
      status,
      daysUntilExpiry,
    };
  };

  return {
    certifications,
    loading,
    error,
    addCertification,
    deleteCertification,
    getCertificationStatus,
    refetch: fetchCertifications,
  };
};
