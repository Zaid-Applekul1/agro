export interface Field {
  id: string;
  name: string;
  area: number;
  crop: string;
  plantingDate: string;
  growthStage: 'seeding' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
  weedState: 'low' | 'medium' | 'high';
  fertilizerApplied: FertilizerApplication[];
  lastUpdated: string;
}

export interface FertilizerApplication {
  id: string;
  type: string;
  amount: number;
  date: string;
  cost: number;
}

export interface CropRotation {
  year: number;
  crop: string;
  benefits: string[];
  plantingWindow: string;
}

export interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  category: 'sales' | 'purchases' | 'equipment' | 'fertilizer' | 'pesticide' | 'labor' | 'other';
  amount: number;
  type: 'income' | 'expense';
}

export interface Inventory {
  id: string;
  name: string;
  type: 'fertilizer' | 'pesticide';
  quantity: number;
  unit: string;
  pricePerUnit: number;
  supplier: string;
  expiryDate?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  ownership: 'owned' | 'leased';
  dailyCost: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  lastMaintenance: string;
  nextService: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  joinDate: string;
  status: 'active' | 'pending';
}

export interface Tree {
  id: string;
  fieldId: string;
  variety: 'Ambri' | 'Royal Delicious' | 'Red Delicious' | 'Golden Delicious' | 'Gala' | 'Fuji';
  row: number;
  treeCount: number;
  status: 'healthy' | 'diseased' | 'pruned' | 'dormant';
  plantingYear: number;
  lastPruned?: string;
  yieldEstimate?: number;
}

export interface HarvestRecord {
  id: string;
  treeId: string;
  variety: string;
  binCount: number;
  lugCount: number;
  qualityGrade: 'premium' | 'standard' | 'processing';
  harvestDate: string;
  pricePerBin: number;
  totalRevenue: number;
  picker: string;
  storageLocation?: string;
  starchIndex?: number;
  shelfLifeDays?: number;
}

export interface PestTreatment {
  id: string;
  treeId: string;
  pestType: 'woolly_aphid' | 'codling_moth' | 'scale_insects' | 'mites' | 'leaf_roller';
  treatmentStep: number;
  chemical: string;
  dosage: string;
  applicationDate: string;
  completed: boolean;
  nextTreatmentDue?: string;
  cost: number;
  effectiveness?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ActivityTask {
  id: string;
  title: string;
  taskType: string;
  dueDate?: string;
  notes?: string;
  status: 'pending' | 'completed';
  completedAt?: string;
}

export interface AppleVarietyInfo {
  name: string;
  harvestSeason: string;
  avgPricePerBin: number;
  storageLife: number;
  commonPests: string[];
  marketDemand: 'high' | 'medium' | 'low';
}

export type ViewType = 'dashboard' | 'fields' | 'trees' | 'nursery' | 'harvest' | 'pest' | 'rotation' | 'finances' | 'inventory' | 'equipment' | 'users' | 'activity' | 'profile' | 'calendar' | 'suppliers' | 'budgets';