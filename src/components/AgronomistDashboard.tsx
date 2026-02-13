import React, { useState } from 'react';
import { Bell, Calendar, Star, TrendingUp, Users, ChevronRight, Eye, CheckCircle, X } from 'lucide-react';
import { Booking, Treatment } from '../types';

interface AgronomistDashboardProps {
  bookings: Booking[];
  treatments: Treatment[];
  onAcceptBooking: (bookingId: string) => void;
  onViewOrchardDetails: (orchardId?: string | null) => void;
  onCreateTreatment: (bookingId: string, recommendations: any) => void;
}

export const AgronomistDashboard: React.FC<AgronomistDashboardProps> = ({
  bookings,
  treatments,
  onAcceptBooking,
  onViewOrchardDetails,
  onCreateTreatment
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'treatments' | 'analytics'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'in-progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: pendingBookings.length,
    completedBookings: completedBookings.length,
    totalEarnings: completedBookings.reduce((sum, b) => sum + b.fee, 0)
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agronomist Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your consultations and treatments</p>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={24} />
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                  {pendingBookings.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <Users className="text-blue-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingBookings}</p>
              </div>
              <Calendar className="text-yellow-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats.completedBookings}</p>
              </div>
              <CheckCircle className="text-green-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold">Rs {stats.totalEarnings.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-purple-200" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'bookings', label: 'Bookings', count: bookings.length },
            { id: 'treatments', label: 'Treatments', count: treatments.length },
            { id: 'analytics', label: 'Analytics', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pending Bookings 
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                  {pendingBookings.length}
                </span>
              </h2>
              
              <div className="grid gap-4">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="bg-white border-l-4 border-yellow-400 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-2">New Consultation Request</h3>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p><span className="font-medium">Date:</span> {new Date(booking.scheduledDate).toLocaleDateString()}</p>
                            <p><span className="font-medium">Time:</span> {new Date(booking.scheduledDate).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Fee:</span> Rs {booking.fee}</p>
                            <p><span className="font-medium">Booked:</span> {new Date(booking.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <p className="text-gray-700 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => onViewOrchardDetails(booking.orchardId)}
                        disabled={!booking.orchardId}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Orchard Details
                      </button>
                      <button
                        onClick={() => onAcceptBooking(booking.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Accept Booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Consultations</h2>
              
              <div className="grid gap-4">
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-2">Ongoing Consultation</h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p><span className="font-medium">Date:</span> {new Date(booking.scheduledDate).toLocaleDateString()}</p>
                            <p><span className="font-medium">Time:</span> {new Date(booking.scheduledDate).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Fee:</span> Rs {booking.fee}</p>
                            <p><span className="font-medium">Status:</span> {booking.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => onViewOrchardDetails(booking.orchardId)}
                        disabled={!booking.orchardId}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Orchard Data
                      </button>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <ChevronRight size={16} />
                        Create Treatment Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">Your consultation bookings will appear here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'treatments' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Treatment Plans</h2>
          
          {treatments.length > 0 ? (
            <div className="grid gap-6">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Treatment Plan #{treatment.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      treatment.status === 'submitted' ? 'bg-green-100 text-green-800' :
                      treatment.status === 'implemented' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {treatment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {treatment.recommendations.map((rec) => (
                      <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{rec.description}</p>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Cost: Rs {rec.estimatedCost}</span>
                          <span>Timeline: {rec.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No treatment plans yet</h3>
              <p className="text-gray-600">Treatment plans you create will appear here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold">{bookings.length} bookings</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold text-green-600">Rs {stats.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {bookings.length > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(stats.pendingBookings / stats.totalBookings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{stats.pendingBookings}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(stats.completedBookings / stats.totalBookings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{stats.completedBookings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Creation Modal */}
      {selectedBooking && (
        <TreatmentModal
          onClose={() => setSelectedBooking(null)}
          onSubmit={(recommendations) => {
            onCreateTreatment(selectedBooking.id, recommendations);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

// Treatment Creation Modal Component
interface TreatmentModalProps {
  onClose: () => void;
  onSubmit: (recommendations: any) => void;
}

const TreatmentModal: React.FC<TreatmentModalProps> = ({ onClose, onSubmit }) => {
  const [recommendations, setRecommendations] = useState([
    {
      type: 'fertilizer',
      title: '',
      description: '',
      priority: 'medium',
      estimatedCost: 0,
      timeline: '',
      products: ['']
    }
  ]);

  const addRecommendation = () => {
    setRecommendations(prev => [...prev, {
      type: 'fertilizer',
      title: '',
      description: '',
      priority: 'medium',
      estimatedCost: 0,
      timeline: '',
      products: ['']
    }]);
  };

  const updateRecommendation = (index: number, field: string, value: any) => {
    setRecommendations(prev => prev.map((rec, i) => 
      i === index ? { ...rec, [field]: value } : rec
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(recommendations.filter(rec => rec.title.trim() !== ''));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Create Treatment Plan</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Recommendation #{index + 1}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={rec.type}
                      onChange={(e) => updateRecommendation(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="fertilizer">Fertilizer</option>
                      <option value="pesticide">Pesticide</option>
                      <option value="irrigation">Irrigation</option>
                      <option value="pruning">Pruning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={rec.priority}
                      onChange={(e) => updateRecommendation(index, 'priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={rec.title}
                    onChange={(e) => updateRecommendation(index, 'title', e.target.value)}
                    placeholder="e.g., Apply Nitrogen Fertilizer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={rec.description}
                    onChange={(e) => updateRecommendation(index, 'description', e.target.value)}
                    placeholder="Detailed instructions and benefits..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (Rs)</label>
                    <input
                      type="number"
                      value={rec.estimatedCost}
                      onChange={(e) => updateRecommendation(index, 'estimatedCost', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                    <input
                      type="text"
                      value={rec.timeline}
                      onChange={(e) => updateRecommendation(index, 'timeline', e.target.value)}
                      placeholder="e.g., Within 2 weeks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addRecommendation}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-300 hover:text-green-600 transition-colors"
            >
              + Add Another Recommendation
            </button>
          </div>
          
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Treatment Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



