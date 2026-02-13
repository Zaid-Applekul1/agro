import React, { useState } from 'react';
import { Check, X, Eye, Award, MapPin } from 'lucide-react';
import { Agronomist } from '../types';

interface AdminVerificationPanelProps {
  pendingAgronomists: Agronomist[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isLoading?: boolean;
}

export const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({
  pendingAgronomists,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [selectedAgronomist, setSelectedAgronomist] = useState<Agronomist | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState<string | null>(null);

  const filteredAgronomists = pendingAgronomists.filter(agronomist => {
    if (filter === 'all') return true;
    return agronomist.verificationStatus === filter;
  });

  const handleReject = (id: string) => {
    setCurrentRejectId(id);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (currentRejectId && rejectReason.trim()) {
      onReject(currentRejectId, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setCurrentRejectId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agronomist Verification</h1>
        <p className="text-gray-600">Review and verify agronomist applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['all', 'pending', 'approved', 'rejected'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === filterOption
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {filteredAgronomists.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Agronomists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgronomists.map((agronomist) => (
          <div
            key={agronomist.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Header */}
            <div className="relative">
              <img
                src={agronomist.image}
                alt={agronomist.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agronomist.verificationStatus)}`}>
                  {agronomist.verificationStatus}
                </span>
              </div>
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                {agronomist.experience}+ Years
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{agronomist.name}</h3>
              
              {/* Contact Info */}
              <div className="text-sm text-gray-600 mb-3">
                <p>{agronomist.email}</p>
                <p>{agronomist.phone}</p>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {agronomist.specializations.slice(0, 3).map((spec) => (
                    <span key={spec} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {spec}
                    </span>
                  ))}
                  {agronomist.specializations.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      +{agronomist.specializations.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Region Coverage */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin size={14} className="mr-1" />
                <span>{agronomist.regionCoverage.join(', ')}</span>
              </div>

              {/* Qualifications */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Award size={14} className="mr-1" />
                <span>{agronomist.qualifications.length} Qualification{agronomist.qualifications.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Fee */}
              <div className="text-lg font-semibold text-green-600 mb-4">
                Rs {agronomist.consultationFee}/consultation
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAgronomist(agronomist)}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
                
                {agronomist.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => onApprove(agronomist.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleReject(agronomist.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAgronomist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Agronomist Details</h2>
                <button
                  onClick={() => setSelectedAgronomist(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Section */}
                <div>
                  <img
                    src={selectedAgronomist.image}
                    alt={selectedAgronomist.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{selectedAgronomist.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedAgronomist.bio}</p>
                  
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Email:</span> {selectedAgronomist.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedAgronomist.phone}</p>
                    <p><span className="font-medium">Experience:</span> {selectedAgronomist.experience} years</p>
                    <p><span className="font-medium">Fee:</span> Rs {selectedAgronomist.consultationFee}</p>
                  </div>
                </div>

                {/* Details Section */}
                <div>
                  {/* Specializations */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgronomist.specializations.map((spec) => (
                        <span key={spec} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Region Coverage */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Region Coverage</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgronomist.regionCoverage.map((region) => (
                        <span key={region} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Qualifications</h4>
                    <div className="space-y-3">
                      {selectedAgronomist.qualifications.map((qual, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium">{qual.title}</h5>
                          <p className="text-sm text-gray-600">{qual.institution}</p>
                          <p className="text-sm text-gray-500">{qual.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedAgronomist.verificationStatus === 'pending' && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      onApprove(selectedAgronomist.id);
                      setSelectedAgronomist(null);
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Approve Agronomist
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedAgronomist.id);
                      setSelectedAgronomist(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Reject Application</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



