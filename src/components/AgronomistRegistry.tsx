import React, { useState } from 'react';
import { Upload, X, Plus, MapPin, Award, User } from 'lucide-react';
import { Agronomist, Qualification } from '../types';

interface AgronomistRegistryProps {
  onSubmit: (data: Partial<Agronomist>) => void;
  isLoading?: boolean;
}

export const AgronomistRegistry: React.FC<AgronomistRegistryProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
    experience: 0,
    bio: '',
    consultationFee: 0,
    specializations: [''],
    regionCoverage: [''],
    qualifications: [{ id: Date.now().toString(), title: '', institution: '', year: new Date().getFullYear(), certificate: '', verified: false }]
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const updateSpecialization = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) => i === index ? value : spec)
    }));
  };

  const addRegion = () => {
    setFormData(prev => ({
      ...prev,
      regionCoverage: [...prev.regionCoverage, '']
    }));
  };

  const removeRegion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      regionCoverage: prev.regionCoverage.filter((_, i) => i !== index)
    }));
  };

  const updateRegion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      regionCoverage: prev.regionCoverage.map((region, i) => i === index ? value : region)
    }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { id: Date.now().toString(), title: '', institution: '', year: new Date().getFullYear(), certificate: '', verified: false }]
    }));
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const updateQualification = (index: number, field: keyof Qualification, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map((qual, i) => 
        i === index ? { ...qual, [field]: value } : qual
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      specializations: formData.specializations.filter(spec => spec.trim() !== ''),
      regionCoverage: formData.regionCoverage.filter(region => region.trim() !== ''),
      qualifications: formData.qualifications.filter(qual => qual.title.trim() !== '')
    };
    onSubmit(cleanedData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Register as Agronomist</h2>
        <p className="text-gray-600">Complete your profile to start helping farmers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <User className="text-blue-600 mr-2" size={20} />
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.consultationFee}
              onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Tell us about your expertise and approach..."
              required
            />
          </div>
        </div>

        {/* Profile Image */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Image</h3>
          
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                <Upload size={16} className="mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Specializations</h3>
          
          {formData.specializations.map((spec, index) => (
            <div key={index} className="flex items-center mb-3">
              <input
                type="text"
                value={spec}
                onChange={(e) => updateSpecialization(index, e.target.value)}
                placeholder="e.g., Crop Management, Pest Control"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {formData.specializations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSpecialization(index)}
                  className="ml-3 p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addSpecialization}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Specialization
          </button>
        </div>

        {/* Region Coverage */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <MapPin className="text-green-600 mr-2" size={20} />
            <h3 className="text-xl font-semibold text-gray-900">Region Coverage</h3>
          </div>
          
          {formData.regionCoverage.map((region, index) => (
            <div key={index} className="flex items-center mb-3">
              <input
                type="text"
                value={region}
                onChange={(e) => updateRegion(index, e.target.value)}
                placeholder="e.g., Punjab, Haryana"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {formData.regionCoverage.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRegion(index)}
                  className="ml-3 p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addRegion}
            className="flex items-center text-green-600 hover:text-green-800 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Region
          </button>
        </div>

        {/* Qualifications */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <Award className="text-purple-600 mr-2" size={20} />
            <h3 className="text-xl font-semibold text-gray-900">Qualifications</h3>
          </div>
          
          {formData.qualifications.map((qual, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={qual.title}
                  onChange={(e) => updateQualification(index, 'title', e.target.value)}
                  placeholder="Degree/Certificate Title"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <input
                  type="text"
                  value={qual.institution}
                  onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                  placeholder="Institution Name"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  value={qual.year}
                  onChange={(e) => updateQualification(index, 'year', parseInt(e.target.value))}
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                
                {formData.qualifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addQualification}
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Qualification
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:translate-y-[-2px] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
