import React, { useState } from 'react';
import { Star, MapPin, Award, Calendar, ChevronRight, EggFried as Verified } from 'lucide-react';
import { Agronomist } from '../types';

interface AgronomistCardProps {
  agronomist: Agronomist;
  onBook: (agronomistId: string) => void;
  isLoading?: boolean;
}

export const AgronomistCard: React.FC<AgronomistCardProps> = ({ 
  agronomist, 
  onBook, 
  isLoading = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${isHovered ? 'shadow-2xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section with Overlay */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={agronomist.image}
          alt={agronomist.name}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
        
        {/* Verification Badge */}
        {agronomist.verificationStatus === 'approved' && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium animate-pulse">
            <Verified size={16} />
            Verified
          </div>
        )}
        
        {/* Experience Badge */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {agronomist.experience}+ Years
        </div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
            {agronomist.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < Math.floor(agronomist.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  } transition-colors duration-200`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-200">
              {agronomist.rating} ({agronomist.totalReviews} reviews)
            </span>
          </div>
          
          {/* Specializations */}
          <div className="flex flex-wrap gap-2 mb-4">
            {agronomist.specializations.slice(0, 3).map((spec, index) => (
              <span
                key={spec}
                className={`px-2 py-1 bg-green-500/80 text-white text-xs rounded-full transition-all duration-300 ${
                  isHovered ? 'bg-green-500 transform scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {spec}
              </span>
            ))}
            {agronomist.specializations.length > 3 && (
              <span className="px-2 py-1 bg-gray-500/80 text-white text-xs rounded-full">
                +{agronomist.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-6">
        {/* Location and Fee */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span className="text-sm">{agronomist.regionCoverage.join(', ')}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-green-600">
              Rs {agronomist.consultationFee}
            </span>
            <span className="text-sm text-gray-500 block">per consultation</span>
          </div>
        </div>
        
        {/* Bio */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {agronomist.bio}
        </p>
        
        {/* Qualifications */}
        <div className="flex items-center text-gray-600 mb-6">
          <Award size={16} className="mr-2" />
          <span className="text-sm">
            {agronomist.qualifications.length} Qualification{agronomist.qualifications.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Book Button */}
        <button
          onClick={() => onBook(agronomist.id)}
          disabled={isLoading || agronomist.verificationStatus !== 'approved'}
          className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            agronomist.verificationStatus === 'approved'
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:translate-y-[-2px]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Calendar size={18} />
              <span>Book Consultation</span>
              <ChevronRight size={18} className="transform transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
      
      {/* Hover Effect Border */}
      <div className={`pointer-events-none absolute inset-0 border-2 border-green-500 rounded-2xl transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
};



