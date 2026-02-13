import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCertifications } from '../hooks/useCertifications';
import { FileText, Phone, Upload, User, Trash2, Download, Plus, AlertTriangle, Users, UserPlus, Mail, Shield } from 'lucide-react';

export function ProfileSettings() {
  const { user, updateProfile, uploadProfilePhoto } = useAuth();
  const { certifications, loading: certLoading, error: certError, addCertification, deleteCertification, getCertificationStatus } = useCertifications();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photograph, setPhotograph] = useState<File | null>(null);
  const [photographPreview, setPhotographPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'certifications' | 'users'>('profile');

  // Users state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Certifications state
  const [showCertForm, setShowCertForm] = useState(false);
  const [certType, setCertType] = useState('GAP');
  const [certName, setCertName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDays, setReminderDays] = useState('30');
  const [certNotes, setCertNotes] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [certMessage, setCertMessage] = useState<string | null>(null);

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

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertMessage(null);
    
    if (!certName.trim() || !issueDate || !expiryDate) {
      setCertMessage('Please fill in all required fields');
      return;
    }

    setCertSubmitting(true);
    const { data, error } = await addCertification(
      certType as any,
      certName,
      issueDate,
      expiryDate,
      parseInt(reminderDays),
      certNotes,
      certFile || undefined
    );
    setCertSubmitting(false);

    if (error) {
      setCertMessage(`Error: ${error}`);
    } else {
      setCertMessage('Certification added successfully');
      setCertName('');
      setIssueDate('');
      setExpiryDate('');
      setReminderDays('30');
      setCertNotes('');
      setCertFile(null);
      setShowCertForm(false);
      setTimeout(() => setCertMessage(null), 3000);
    }
  };

  const handleDeleteCertification = async (certId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    
    const { error } = await deleteCertification(certId);
    if (error) {
      setCertMessage(`Error: ${error}`);
    } else {
      setCertMessage('Certification deleted successfully');
      setTimeout(() => setCertMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Update your owner details and contact information</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="inline mr-2" size={18} />
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'certifications'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="inline mr-2" size={18} />
          Certifications
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline mr-2" size={18} />
          Users
        </button>
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
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
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
          <button
            onClick={() => setShowCertForm(!showCertForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add Certification
          </button>
        </div>

        {certMessage && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${
            certMessage.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {certMessage}
          </div>
        )}

        {/* Add Certification Form */}
        {showCertForm && (
          <form onSubmit={handleAddCertification} className="mb-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={certType}
                  onChange={e => setCertType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="GAP">GAP (Good Agricultural Practice)</option>
                  <option value="Organic">Organic</option>
                  <option value="Export">Export Certified</option>
                  <option value="ISO">ISO</option>
                  <option value="Fair Trade">Fair Trade</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name *</label>
                <input
                  type="text"
                  placeholder="e.g., GAP Certificate 2024"
                  value={certName}
                  onChange={e => setCertName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Reminder (days)</label>
                <input
                  type="number"
                  value={reminderDays}
                  onChange={e => setReminderDays(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF/Image)</label>
                <label className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-green-500 transition-colors flex items-center gap-2">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {certFile ? certFile.name : 'Click to upload'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setCertFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={certNotes}
                onChange={e => setCertNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Additional notes about this certification"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={certSubmitting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {certSubmitting ? 'Saving...' : 'Save Certification'}
              </button>
              <button
                type="button"
                onClick={() => setShowCertForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Certifications List */}
        {certLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : certifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No certifications yet. Add your first certification above.</p>
        ) : (
          <div className="space-y-3">
            {certifications.map(cert => {
              const status = getCertificationStatus(cert);
              const statusColors = {
                active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                expiring_soon: 'bg-amber-100 text-amber-800 border-amber-200',
                expired: 'bg-red-100 text-red-800 border-red-200'
              };
              const statusLabels = {
                active: 'Active',
                expiring_soon: `Expiring in ${status.daysUntilExpiry} days`,
                expired: 'Expired'
              };

              return (
                <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{cert.certification_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[status.status]}`}>
                          {statusLabels[status.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{cert.certification_type}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
                        <p>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</p>
                        {cert.notes && <p className="italic">Note: {cert.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {cert.file_url && (
                        <a
                          href={cert.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                          title="Download"
                        >
                          <Download size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">User Management</h3>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} />
            Invite User
          </button>
        </div>

        {inviteSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            {inviteSuccess}
          </div>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <form onSubmit={(e) => {
            e.preventDefault();
            setInviteSuccess(`Invitation sent to ${inviteEmail}`);
            setInviteEmail('');
            setInviteRole('viewer');
            setInviteMessage('');
            setShowInviteForm(false);
            setTimeout(() => setInviteSuccess(null), 3000);
          }} className="mb-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 text-gray-400" size={20} />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="editor">Editor (Can Edit)</option>
                    <option value="manager">Manager (Can Manage)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Add a personal message to the invite..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Invite
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Current User */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Active Users</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">Developer {user?.created_at && `• Joined ${new Date(user.created_at).toLocaleDateString()}`}</p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Owner
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
