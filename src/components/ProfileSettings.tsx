import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FileText, Phone, Upload, User } from 'lucide-react';

export function ProfileSettings() {
  const { user, updateProfile, uploadProfilePhoto } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photograph, setPhotograph] = useState<File | null>(null);
  const [photographPreview, setPhotographPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    khasra: '',
    khata: '',
  });

  useEffect(() => {
    if (!user?.user_metadata) return;
    setFormData({
      name: user.user_metadata.name || '',
      phone: user.user_metadata.phone || '',
      khasra: user.user_metadata.khasra || '',
      khata: user.user_metadata.khata || '',
    });
    if (user.user_metadata.photograph_url) {
      setPhotographPreview(user.user_metadata.photograph_url);
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotograph(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotographPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim() || !formData.phone.trim()) {
        throw new Error('Name and phone number are required');
      }

      const updates: Record<string, any> = {
        name: formData.name,
        phone: formData.phone,
        khasra: formData.khasra || null,
        khata: formData.khata || null,
      };

      if (photograph && user?.id) {
        const { url, error: uploadError } = await uploadProfilePhoto(photograph, user.id);
        if (uploadError) throw uploadError;
        if (url) updates.photograph_url = url;
      }

      const { error: updateError } = await updateProfile(updates);
      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setPhotograph(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Please sign in to manage your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Update your owner details and contact information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={event => setFormData({ ...formData, name: event.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Owner's full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={event => setFormData({ ...formData, phone: event.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., +91 98765 43210"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khasra Number</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.khasra}
                  onChange={event => setFormData({ ...formData, khasra: event.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Land record number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khata Number</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.khata}
                  onChange={event => setFormData({ ...formData, khata: event.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Account number"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photograph</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
              {photographPreview ? (
                <div className="space-y-3">
                  <img
                    src={photographPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  {photograph && <p className="text-sm text-gray-600">{photograph.name}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      setPhotograph(null);
                      setPhotographPreview(null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={24} />
                  <label className="cursor-pointer">
                    <p className="text-sm text-gray-600">Click to upload new photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
