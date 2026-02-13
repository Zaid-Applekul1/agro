import React, { useMemo, useState } from 'react';
import { Users, UserPlus, Shield, BarChart3, Search, Filter, X } from 'lucide-react';
import { AgronomistCard } from './AgronomistCard';
import { AgronomistRegistry } from './AgronomistRegistry';
import { BookingModal } from './BookingModal';
import { AdminVerificationPanel } from './AdminVerificationPanel';
import { AgronomistDashboard } from './AgronomistDashboard';
import { OrchardMapCanvas } from './OrchardMapCanvas';
import { Agronomist, OrchardOwner, Recommendation } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useOrchards } from '../hooks/useOrchards';
import { useFields } from '../hooks/useFields';
import { useTrees } from '../hooks/useTrees';
import { useAgronomists } from '../hooks/useAgronomists';

// Mock data - replace with real API calls
const mockAgronomists: Agronomist[] = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@agri.com',
    phone: '+91 98765 43210',
    image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
    experience: 15,
    bio: 'Expert in sustainable farming practices with focus on organic crop management and integrated pest management.',
    consultationFee: 2500,
    specializations: ['Organic Farming', 'IPM', 'Soil Health', 'Crop Rotation'],
    regionCoverage: ['Punjab', 'Haryana', 'Rajasthan'],
    qualifications: [
      { id: 'q-1', title: 'PhD in Agronomy', institution: 'PAU Ludhiana', year: 2008, certificate: '', verified: true },
      { id: 'q-2', title: 'M.Sc Agriculture', institution: 'IARI New Delhi', year: 2005, certificate: '', verified: true }
    ],
    rating: 4.8,
    totalReviews: 142,
    verificationStatus: 'approved',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@agri.com',
    phone: '+91 87654 32109',
    image: 'https://images.pexels.com/photos/5407205/pexels-photo-5407205.jpeg?auto=compress&cs=tinysrgb&w=400',
    experience: 12,
    bio: 'Specializing in fruit crop management, post-harvest technology, and precision agriculture.',
    consultationFee: 3000,
    specializations: ['Fruit Crops', 'Post-Harvest', 'Precision Agriculture'],
    regionCoverage: ['Maharashtra', 'Karnataka', 'Andhra Pradesh'],
    qualifications: [
      { id: 'q-3', title: 'PhD in Horticulture', institution: 'UAS Bangalore', year: 2012, certificate: '', verified: true },
    ],
    rating: 4.9,
    totalReviews: 89,
    verificationStatus: 'approved',
    isActive: true,
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Amit Singh',
    email: 'amit.singh@agri.com',
    phone: '+91 76543 21098',
    image: 'https://images.pexels.com/photos/5407207/pexels-photo-5407207.jpeg?auto=compress&cs=tinysrgb&w=400',
    experience: 8,
    bio: 'Young agronomist with expertise in modern farming techniques and digital agriculture.',
    consultationFee: 1800,
    specializations: ['Digital Agriculture', 'Hydroponics', 'Greenhouse Management'],
    regionCoverage: ['Gujarat', 'Rajasthan'],
    qualifications: [
      { id: 'q-4', title: 'M.Sc Agriculture', institution: 'AAU Anand', year: 2016, certificate: '', verified: false },
    ],
    rating: 4.6,
    totalReviews: 56,
    verificationStatus: 'pending',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z'
  }
];

const mockOrchardOwner: OrchardOwner = {
  id: 'owner1',
  name: 'Farmer Singh',
  email: 'farmer@example.com',
  phone: '+91 99999 88888',
  orchards: [
    {
      id: 'orchard1',
      name: 'Main Apple Orchard',
      location: 'Shimla, Himachal Pradesh',
      size: 25,
      cropType: 'Apple',
      trees: []
    },
    {
      id: 'orchard2',
      name: 'Orange Grove',
      location: 'Nagpur, Maharashtra',
      size: 15,
      cropType: 'Orange',
      trees: []
    }
  ]
};

export const AgronomistManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'register' | 'admin' | 'dashboard'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedAgronomist, setSelectedAgronomist] = useState<Agronomist | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [selectedOrchardDetailId, setSelectedOrchardDetailId] = useState<string | null>(null);
  const upiId = (import.meta.env.VITE_UPI_ID as string | undefined)?.trim() ?? '';
  const { user } = useAuth();
  const { orchards, treePoints, lines } = useOrchards();
  const { fields } = useFields();
  const { trees } = useTrees();
  const {
    agronomists: backendAgronomists,
    bookings,
    treatments,
    loading: isLoading,
    error,
    backendEnabled,
    currentRole,
    registerAgronomist,
    approveAgronomist,
    rejectAgronomist,
    createBooking,
    acceptBooking,
    createTreatment,
  } = useAgronomists(user?.id, user?.user_metadata?.role as string | undefined);

  const currentUser = useMemo(
    () => ({
      role: currentRole,
      id: user?.id ?? 'guest',
    }),
    [currentRole, user?.id]
  );

  const agronomists = backendEnabled ? backendAgronomists : mockAgronomists;
  const selectedOrchardDetail = useMemo(
    () => orchards.find((o) => o.id === selectedOrchardDetailId) ?? null,
    [orchards, selectedOrchardDetailId]
  );
  const selectedFieldDetail = useMemo(
    () =>
      selectedOrchardDetail?.field_id
        ? fields.find((f) => f.id === selectedOrchardDetail.field_id) ?? null
        : null,
    [fields, selectedOrchardDetail?.field_id]
  );
  const selectedTreeBlocks = useMemo(
    () =>
      selectedFieldDetail
        ? trees.filter((t) => t.field_id === selectedFieldDetail.id)
        : [],
    [selectedFieldDetail, trees]
  );
  const selectedOrchardPoints = useMemo(
    () =>
      selectedOrchardDetail
        ? treePoints.filter((p) => p.orchard_id === selectedOrchardDetail.id)
        : [],
    [selectedOrchardDetail, treePoints]
  );
  const selectedOrchardLines = useMemo(
    () =>
      selectedOrchardDetail
        ? lines.filter((l) => l.orchard_id === selectedOrchardDetail.id)
        : [],
    [lines, selectedOrchardDetail]
  );
  const selectedBoundary = useMemo(() => {
    const geometry = selectedOrchardDetail?.boundary_geojson as GeoJSON.Geometry | null | undefined;
    if (!geometry) return null;
    if (geometry.type === 'Polygon') return geometry;
    if (geometry.type === 'MultiPolygon') {
      const coords = geometry.coordinates[0];
      if (!coords) return null;
      return { type: 'Polygon', coordinates: coords } as GeoJSON.Polygon;
    }
    return null;
  }, [selectedOrchardDetail?.boundary_geojson]);
  const totalTreesInBlocks = useMemo(
    () => selectedTreeBlocks.reduce((sum, block) => sum + (block.tree_count ?? 0), 0),
    [selectedTreeBlocks]
  );

  const orchardOwner: OrchardOwner = useMemo(() => {
    if (!backendEnabled) return mockOrchardOwner;

    return {
      id: user?.id ?? '',
      name: user?.user_metadata?.name ?? 'Farmer',
      email: user?.email ?? '',
      phone: user?.user_metadata?.phone ?? '',
      orchards: orchards.map((o) => ({
        id: o.id,
        name: o.name,
        location: 'Farm Location',
        size: Number(o.area_acres ?? 0),
        cropType: 'Apple',
        trees: [],
      })),
    };
  }, [backendEnabled, orchards, user?.email, user?.id, user?.user_metadata?.name, user?.user_metadata?.phone]);

  const filteredAgronomists = agronomists.filter(agronomist => {
    const matchesSearch = agronomist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agronomist.specializations.some(spec => 
                           spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion = !selectedRegion || 
                         agronomist.regionCoverage.some(region => 
                           region.toLowerCase().includes(selectedRegion.toLowerCase()));
    const matchesSpecialization = !selectedSpecialization ||
                                 agronomist.specializations.some(spec =>
                                   spec.toLowerCase().includes(selectedSpecialization.toLowerCase()));
    
    return matchesSearch && matchesRegion && matchesSpecialization;
  });

  const approvedAgronomists = filteredAgronomists.filter(a => a.verificationStatus === 'approved');
  const allRegions = Array.from(new Set(agronomists.flatMap(a => a.regionCoverage)));
  const allSpecializations = Array.from(new Set(agronomists.flatMap(a => a.specializations)));

  const handleBookConsultation = (agronomistId: string) => {
    const agronomist = agronomists.find(a => a.id === agronomistId);
    if (agronomist) {
      setSelectedAgronomist(agronomist);
      setShowBookingModal(true);
    }
  };

  const handleCreateBooking = async (bookingData: any) => {
    if (!user?.id) {
      alert('Please sign in to book a consultation.');
      return;
    }
    if (!backendEnabled) {
      alert('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    setBookingSubmitting(true);
    const { error: createError } = await createBooking(bookingData);
    setBookingSubmitting(false);
    if (createError) {
      alert(`Failed to book consultation. ${createError}`);
      return;
    }
    setShowBookingModal(false);
    setSelectedAgronomist(null);
    alert('Consultation booked successfully! The agronomist will review and accept your request.');
  };

  const handleRegisterAgronomist = async (data: Partial<Agronomist>) => {
    if (!backendEnabled) {
      alert('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    const { error: registerError } = await registerAgronomist(data);
    if (registerError) {
      alert(`Registration failed. ${registerError}`);
      return;
    }
    alert('Registration submitted successfully! Your application will be reviewed by our admin team.');
    setActiveTab('browse');
  };

  const handleApproveAgronomist = async (id: string) => {
    if (!backendEnabled) return;
    const { error: approveError } = await approveAgronomist(id);
    if (approveError) {
      alert(`Failed to approve agronomist. ${approveError}`);
    }
  };

  const handleRejectAgronomist = async (id: string, reason: string) => {
    if (!backendEnabled) return;
    const { error: rejectError } = await rejectAgronomist(id, reason);
    if (rejectError) {
      alert(`Failed to reject agronomist. ${rejectError}`);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!backendEnabled) return;
    const { error: acceptError } = await acceptBooking(bookingId);
    if (acceptError) {
      alert(`Failed to accept booking. ${acceptError}`);
    }
  };

  const handleCreateTreatment = async (bookingId: string, recommendations: Omit<Recommendation, 'id'>[]) => {
    if (!backendEnabled) return;
    const { error: treatmentError } = await createTreatment(bookingId, recommendations);
    if (treatmentError) {
      alert(`Failed to submit treatment. ${treatmentError}`);
    }
  };

  const handleViewOrchardDetails = (orchardId?: string | null) => {
    if (!orchardId) {
      alert('No orchard linked for this consultation.');
      return;
    }
    setSelectedOrchardDetailId(orchardId);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 enter-fade-up">
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-6 shadow-sm soft-lift">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agronomist Services</h1>
        <p className="text-gray-600">Connect with expert agronomists for professional farming guidance</p>
        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 bg-white/80 border border-emerald-100 p-1.5 rounded-xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 soft-lift ${
              activeTab === 'browse'
                ? 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Search size={16} />
            Browse Agronomists
          </button>
          
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 soft-lift ${
              activeTab === 'register'
                ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <UserPlus size={16} />
            Register as Agronomist
          </button>
          
          {currentUser.role === 'agronomist' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 soft-lift ${
                activeTab === 'dashboard'
                  ? 'bg-violet-100 text-violet-700 shadow-sm border border-violet-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 size={16} />
              Dashboard
            </button>
          )}
          
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 soft-lift ${
                activeTab === 'admin'
                  ? 'bg-red-100 text-red-700 shadow-sm border border-red-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Shield size={16} />
              Admin Verification
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'browse' && (
        <div>
          {/* Search and Filters */}
          <div className="bg-white/90 p-6 rounded-2xl shadow-lg mb-8 border border-emerald-100 soft-lift">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="text-gray-400" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Find the Right Agronomist</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Regions</option>
                  {allRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {allSpecializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              Found {approvedAgronomists.length} agronomist{approvedAgronomists.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Agronomist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 enter-fade-up">
            {approvedAgronomists.map((agronomist) => (
              <AgronomistCard
                key={agronomist.id}
                agronomist={agronomist}
                onBook={handleBookConsultation}
                isLoading={bookingSubmitting}
              />
            ))}
          </div>

          {/* Empty State */}
          {approvedAgronomists.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agronomists found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'register' && (
        <AgronomistRegistry 
          onSubmit={handleRegisterAgronomist}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'admin' && currentUser.role === 'admin' && (
        <AdminVerificationPanel
          pendingAgronomists={agronomists}
          onApprove={handleApproveAgronomist}
          onReject={handleRejectAgronomist}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'dashboard' && currentUser.role === 'agronomist' && (
        <AgronomistDashboard
          bookings={bookings}
          treatments={treatments}
          onAcceptBooking={handleAcceptBooking}
          onViewOrchardDetails={handleViewOrchardDetails}
          onCreateTreatment={handleCreateTreatment}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedAgronomist && (
        <BookingModal
          agronomist={selectedAgronomist}
          orchardOwner={orchardOwner}
          upiId={upiId}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedAgronomist(null);
          }}
          onBook={handleCreateBooking}
          isLoading={bookingSubmitting}
        />
      )}

      {selectedOrchardDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-6xl rounded-xl shadow-xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOrchardDetail.name}</h2>
                <p className="text-sm text-gray-600">Orchard details from fields, trees, and map data</p>
              </div>
              <button
                onClick={() => setSelectedOrchardDetailId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-xs text-gray-500">Area</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(selectedOrchardDetail.area_acres ?? 0).toFixed(2)} acres
                  </p>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-xs text-gray-500">Tree Points (Mapped)</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrchardPoints.length}</p>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-xs text-gray-500">Tree Blocks</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTreeBlocks.length}</p>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-xs text-gray-500">Trees (Field Blocks)</p>
                  <p className="text-lg font-semibold text-gray-900">{totalTreesInBlocks}</p>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Linked Field</h3>
                {selectedFieldDetail ? (
                  <div className="text-sm text-gray-700">
                    <p><span className="font-medium">Name:</span> {selectedFieldDetail.name}</p>
                    <p><span className="font-medium">Crop:</span> {selectedFieldDetail.crop}</p>
                    <p><span className="font-medium">Area:</span> {selectedFieldDetail.area} kanal</p>
                    <p><span className="font-medium">Planting Date:</span> {selectedFieldDetail.planting_date}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No field linked to this orchard.</p>
                )}
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Orchard Map</h3>
                {selectedBoundary ? (
                  <OrchardMapCanvas
                    selectedBoundary={selectedBoundary}
                    draftBoundary={null}
                    orchardTreePoints={selectedOrchardPoints}
                    orchardLines={selectedOrchardLines}
                    addingTree={false}
                    focusLocation={null}
                    selectedOrchardName={selectedOrchardDetail.name}
                    treeCount={selectedOrchardDetail.tree_count ?? selectedOrchardPoints.length}
                    onBoundaryCreated={() => {}}
                    onBoundaryEdited={() => {}}
                    onBoundaryDeleted={() => {}}
                    onLineCreated={() => {}}
                    onMapClick={() => {}}
                  />
                ) : (
                  <p className="text-sm text-gray-600">No orchard boundary available for map view.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
