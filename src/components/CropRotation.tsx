import React, { useState } from 'react';
import { cropRotationData } from '../data/mockData';
import { RotateCcw, Lightbulb, Calendar, Leaf } from 'lucide-react';

export function CropRotation() {
  const [selectedCrop, setSelectedCrop] = useState<string>('Winter Wheat');

  const currentRotation = cropRotationData[selectedCrop] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crop Rotation Planner</h2>
          <p className="text-gray-600 mt-1">UK farming best practices for optimal soil health</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <RotateCcw className="text-green-600" size={20} />
          <span className="text-sm font-medium text-green-600">4-Year Rotation Cycle</span>
        </div>
      </div>

      {/* Crop Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Current Crop</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.keys(cropRotationData).map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedCrop === crop
                  ? 'bg-green-100 border-2 border-green-500 text-green-800'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Leaf size={16} />
                <span className="font-medium">{crop}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rotation Plan */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recommended 4-Year Rotation</h3>
          <Lightbulb className="text-yellow-500" size={20} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {currentRotation.map((yearPlan, index) => (
            <div key={yearPlan.year} className="relative">
              <div className={`p-6 rounded-lg border-2 ${
                yearPlan.year === 1 
                  ? 'bg-green-50 border-green-300 ring-2 ring-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    yearPlan.year === 1 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    Year {yearPlan.year}
                  </span>
                  {yearPlan.year === 1 && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">{yearPlan.crop}</h4>
                
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{yearPlan.plantingWindow}</span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Benefits:</h5>
                  <ul className="space-y-1">
                    {yearPlan.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Arrow between years */}
              {index < currentRotation.length - 1 && (
                <div className="hidden xl:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-xs">→</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rotation Benefits */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Why Crop Rotation Matters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <h4 className="font-medium text-gray-900 mb-2">Disease Management</h4>
            <p className="text-sm text-gray-600">Breaks disease cycles by removing host plants and reducing soil-borne pathogens.</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <h4 className="font-medium text-gray-900 mb-2">Soil Health</h4>
            <p className="text-sm text-gray-600">Different root systems improve soil structure and nutrient cycling.</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <h4 className="font-medium text-gray-900 mb-2">Weed Control</h4>
            <p className="text-sm text-gray-600">Varied planting times and crop types naturally suppress weeds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}