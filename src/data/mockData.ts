// This file previously contained mock data for development
// All data now comes from Supabase with user-specific filtering

// Apple variety information for reference
export const appleVarieties = [
  {
    name: 'Royal Delicious',
    harvestSeason: 'September - October',
    avgPricePerBin: 2500,
    storageLife: 180,
    commonPests: ['woolly_aphid', 'codling_moth'],
    marketDemand: 'high' as const
  },
  {
    name: 'Ambri',
    harvestSeason: 'October - November',
    avgPricePerBin: 3000,
    storageLife: 200,
    commonPests: ['scale_insects', 'mites'],
    marketDemand: 'high' as const
  },
  {
    name: 'Red Delicious',
    harvestSeason: 'September',
    avgPricePerBin: 2200,
    storageLife: 150,
    commonPests: ['codling_moth', 'leaf_roller'],
    marketDemand: 'medium' as const
  },
  {
    name: 'Golden Delicious',
    harvestSeason: 'October',
    avgPricePerBin: 2800,
    storageLife: 170,
    commonPests: ['woolly_aphid', 'mites'],
    marketDemand: 'high' as const
  },
  {
    name: 'Gala',
    harvestSeason: 'August - September',
    avgPricePerBin: 2400,
    storageLife: 120,
    commonPests: ['codling_moth', 'leaf_roller'],
    marketDemand: 'medium' as const
  },
  {
    name: 'Fuji',
    harvestSeason: 'October - November',
    avgPricePerBin: 2700,
    storageLife: 190,
    commonPests: ['woolly_aphid', 'scale_insects'],
    marketDemand: 'high' as const
  }
];

// Crop rotation data for planning
export const cropRotationData = {
  'Winter Wheat': [
    {
      year: 1,
      crop: 'Winter Wheat',
      benefits: ['Soil structure improvement', 'Nitrogen fixation', 'Weed suppression'],
      plantingWindow: 'September - October'
    },
    {
      year: 2,
      crop: 'Spring Barley',
      benefits: ['Quick cash crop', 'Pest cycle break', 'Soil aeration'],
      plantingWindow: 'March - April'
    },
    {
      year: 3,
      crop: 'Oil Seed Rape',
      benefits: ['Deep rooting', 'Soil conditioning', 'High value crop'],
      plantingWindow: 'August - September'
    },
    {
      year: 4,
      crop: 'Grass Ley',
      benefits: ['Soil fertility restoration', 'Organic matter increase', 'Livestock feed'],
      plantingWindow: 'April - May'
    }
  ],
  'Apple Trees': [
    {
      year: 1,
      crop: 'Apple Trees',
      benefits: ['Primary crop', 'Long-term investment', 'High value fruit'],
      plantingWindow: 'March - April'
    },
    {
      year: 2,
      crop: 'Cover Crops',
      benefits: ['Soil protection', 'Organic matter', 'Weed suppression'],
      plantingWindow: 'September - October'
    },
    {
      year: 3,
      crop: 'Legume Intercrop',
      benefits: ['Nitrogen fixation', 'Soil improvement', 'Additional income'],
      plantingWindow: 'April - May'
    },
    {
      year: 4,
      crop: 'Fallow/Rest',
      benefits: ['Soil restoration', 'Pest break', 'Nutrient accumulation'],
      plantingWindow: 'Year-round'
    }
  ]
};