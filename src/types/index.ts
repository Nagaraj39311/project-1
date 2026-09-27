export type UserRole = 'citizen' | 'admin' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  wardZone?: string;
  vehicleNumber?: string;
  avatarUrl?: string;
}

export type BinType = 'general' | 'organic' | 'recyclable' | 'hazardous';
export type BinStatus = 'normal' | 'filling' | 'full' | 'overflowing' | 'damaged' | 'maintenance';

export interface Bin {
  id: string;
  binNumber: string;
  binType: BinType;
  latitude: number;
  longitude: number;
  address: string;
  wardZone: string;
  capacityLiters: number;
  currentFillPercent: number;
  status: BinStatus;
  lastCollectionTime: string;
  nextScheduledCollection: string;
  batteryLevelPercent: number;
  temperatureCelsius: number;
  hasSensorAlert: boolean;
}

export type ComplaintCategory =
  | 'overflowing_bin'
  | 'garbage_not_collected'
  | 'damaged_bin'
  | 'illegal_dumping'
  | 'waste_scattered'
  | 'missed_collection'
  | 'other';

export type ComplaintUrgency = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'reopened';

export interface Complaint {
  id: string;
  complaintNumber: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  category: ComplaintCategory;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  wardZone: string;
  binId?: string;
  binNumber?: string;
  priority: ComplaintUrgency;
  priorityReason: string;
  priorityScore: number;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedRouteId?: string;
  resolutionTime?: string;
  adminNotes?: string;
  workerNotes?: string;
  proofImageUrl?: string;
  duplicateOfId?: string;
}

export interface RouteStop {
  stopNumber: number;
  binId?: string;
  complaintId?: string;
  address: string;
  latitude: number;
  longitude: number;
  binNumber?: string;
  complaintCategory?: string;
  urgency?: ComplaintUrgency;
  fillPercent?: number;
  status: 'pending' | 'in_progress' | 'collected' | 'skipped';
  collectedAt?: string;
  notes?: string;
  proofImage?: string;
}

export interface CollectionRoute {
  id: string;
  routeCode: string;
  workerId: string;
  workerName: string;
  vehicleNumber: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  depot: {
    name: string;
    latitude: number;
    longitude: number;
  };
  stops: RouteStop[];
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  estimatedDurationMinutes: number;
  createdAt: string;
  completedAt?: string;
}

export interface AppNotification {
  id: string;
  recipientRole: UserRole | 'all';
  recipientId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  timestamp: string;
  linkId?: string;
}

export interface PriorityRuleConfig {
  weightNearbyReports: number; // weight for count of complaints within 150m
  weightFillLevel: number;     // weight for bin sensor fill level
  weightAgeHours: number;      // weight for hours elapsed since reported
  weightUrgency: number;       // weight for citizen reported urgency
}

export interface WardZone {
  id: string;
  name: string;
  code: string;
  areaSqKm: number;
  activeBins: number;
  openComplaints: number;
  depotName: string;
  centerLat: number;
  centerLng: number;
}
