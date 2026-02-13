/* =========================
   CORE FARM / FIELD TYPES
========================= */

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

/* =========================
   FINANCIAL / INVENTORY
========================= */

export interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  category:
    | 'sales'
    | 'purchases'
    | 'equipment'
    | 'fertilizer'
    | 'pesticide'
    | 'labor'
    | 'other';
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

/* =========================
   USER / ACCESS
========================= */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  joinDate: string;
  status: 'active' | 'pending';
}

/* =========================
   TREE & ORCHARD DOMAIN
========================= */

/** Production / Yield based tree */
export interface OrchardTree {
  id: string;
  fieldId: string;
  variety:
    | 'Ambri'
    | 'Royal Delicious'
    | 'Red Delicious'
    | 'Golden Delicious'
    | 'Gala'
    | 'Fuji';
  row: number;
  treeCount: number;
  status: 'healthy' | 'diseased' | 'pruned' | 'dormant';
  plantingYear: number;
  lastPruned?: string;
  yieldEstimate?: number;
}

/** GPS / Map based tree */
export interface GeoTree {
  id: string;
  type: string;
  age: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  location: {
    lat: number;
    lng: number;
  };
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

/* =========================
   PEST & ACTIVITY
========================= */

export interface PestTreatment {
  id: string;
  treeId: string;
  pestType:
    | 'woolly_aphid'
    | 'codling_moth'
    | 'scale_insects'
    | 'mites'
    | 'leaf_roller';
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

/* =========================
   ORCHARD & SOIL
========================= */

export interface Orchard {
  id: string;
  name: string;
  location: string;
  size: number;
  cropType: string;
  mapData: any;
  trees: GeoTree[];
  soilTests: SoilTest[];
  problems: string[];
}

export interface SoilTest {
  id: string;
  testDate: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
}

/* =========================
   AGRONOMIST MODULE
========================= */

export interface Agronomist {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  experience: number;
  specializations: string[];
  qualifications: Qualification[];
  regionCoverage: string[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  bio: string;
  consultationFee: number;
  rejectionReason?: string;
}

export interface Qualification {
  id: string;
  title: string;
  institution: string;
  year: number;
  certificate: string;
  verified: boolean;
}

export interface OrchardOwnerOrchard {
  id: string;
  name: string;
  location: string;
  size: number;
  cropType: string;
  trees: GeoTree[];
}

export interface OrchardOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  orchards: OrchardOwnerOrchard[];
}

export interface Review {
  id: string;
  agronomistId: string;
  orchardOwnerId: string;
  ownerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  agronomistId: string;
  orchardOwnerId: string;
  orchardId?: string | null;
  agronomistName?: string;
  orchardDetails?: OrchardOwnerOrchard;
  problems?: string[];
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  status:
    | 'pending'
    | 'accepted'
    | 'in-progress'
    | 'completed'
    | 'cancelled';
  scheduledDate: string;
  createdAt: string;
  completedAt?: string;
  notes: string;
  fee: number;
}

export interface Treatment {
  id: string;
  bookingId: string;
  agronomistId: string;
  orchardId?: string | null;
  recommendations: Recommendation[];
  createdAt: string;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'implemented';
}

export interface Recommendation {
  id: string;
  type: 'fertilizer' | 'pesticide' | 'irrigation' | 'pruning' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost: number;
  timeline: string;
  products: string[];
}

/* =========================
   UI / NAVIGATION
========================= */

export type ViewType =
  | 'dashboard'
  | 'fields'
  | 'trees'
  | 'nursery'
  | 'roi'
  | 'spray'
  | 'harvest'
  | 'pest'
  | 'rotation'
  | 'finances'
  | 'inventory'
  | 'equipment'
  | 'users'
  | 'activity'
  | 'profile'
  | 'calendar'
  | 'suppliers'
  | 'budgets'
  | 'agronomists';
