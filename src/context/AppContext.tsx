import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Bin,
  Complaint,
  CollectionRoute,
  AppNotification,
  PriorityRuleConfig,
  ComplaintUrgency,
  ComplaintStatus,
} from '../types';
import {
  DEMO_USERS,
  SEED_BINS,
  SEED_COMPLAINTS,
  SEED_ROUTES,
  SEED_NOTIFICATIONS,
} from '../data/seedData';
import { calculateComplaintPriority } from '../utils/algorithms';

interface AppContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  bins: Bin[];
  complaints: Complaint[];
  routes: CollectionRoute[];
  notifications: AppNotification[];
  priorityConfig: PriorityRuleConfig;
  updatePriorityConfig: (config: PriorityRuleConfig) => void;
  addComplaint: (
    data: {
      citizenId: string;
      citizenName: string;
      citizenPhone?: string;
      category: Complaint['category'];
      description: string;
      imageUrl?: string;
      latitude: number;
      longitude: number;
      address: string;
      wardZone: string;
      binId?: string;
      binNumber?: string;
      urgency: ComplaintUrgency;
    }
  ) => Complaint;
  updateComplaintStatus: (
    complaintId: string,
    status: ComplaintStatus,
    adminNotes?: string,
    workerNotes?: string,
    proofImageUrl?: string
  ) => void;
  assignComplaint: (complaintId: string, workerId: string, routeId?: string) => void;
  updateBinFill: (binId: string, newFill: number) => void;
  addNewBin: (binData: Omit<Bin, 'id' | 'binNumber' | 'lastCollectionTime' | 'nextScheduledCollection' | 'batteryLevelPercent' | 'temperatureCelsius' | 'hasSensorAlert'>) => Bin;
  createCollectionRoute: (
    routeData: Omit<CollectionRoute, 'id' | 'routeCode' | 'createdAt'>
  ) => CollectionRoute;
  updateRouteStopStatus: (
    routeId: string,
    stopNumber: number,
    status: 'pending' | 'in_progress' | 'collected' | 'skipped',
    notes?: string,
    proofImage?: string
  ) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  simulateIotSensorTick: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedComplaintForDetail: Complaint | null;
  setSelectedComplaintForDetail: (c: Complaint | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isDocsModalOpen: boolean;
  setIsDocsModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states or localStorage
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('smartwaste_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0]; // Defaults to citizen
  });

  const [bins, setBins] = useState<Bin[]>(() => {
    const saved = localStorage.getItem('smartwaste_bins');
    return saved ? JSON.parse(saved) : SEED_BINS;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('smartwaste_complaints');
    return saved ? JSON.parse(saved) : SEED_COMPLAINTS;
  });

  const [routes, setRoutes] = useState<CollectionRoute[]>(() => {
    const saved = localStorage.getItem('smartwaste_routes');
    return saved ? JSON.parse(saved) : SEED_ROUTES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('smartwaste_notifications');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [priorityConfig, setPriorityConfig] = useState<PriorityRuleConfig>({
    weightNearbyReports: 25,
    weightFillLevel: 30,
    weightAgeHours: 15,
    weightUrgency: 30,
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedComplaintForDetail, setSelectedComplaintForDetail] = useState<Complaint | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // Sync to storage
  useEffect(() => {
    localStorage.setItem('smartwaste_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('smartwaste_bins', JSON.stringify(bins));
  }, [bins]);

  useEffect(() => {
    localStorage.setItem('smartwaste_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('smartwaste_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('smartwaste_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Switch role handler
  const switchRole = (role: UserRole) => {
    const targetUser = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(targetUser);
    setCurrentView('dashboard');
  };

  const updatePriorityConfig = (config: PriorityRuleConfig) => {
    setPriorityConfig(config);
  };

  // Add new citizen complaint
  const addComplaint = (data: {
    citizenId: string;
    citizenName: string;
    citizenPhone?: string;
    category: Complaint['category'];
    description: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    address: string;
    wardZone: string;
    binId?: string;
    binNumber?: string;
    urgency: ComplaintUrgency;
  }) => {
    const associatedBin = bins.find((b) => b.id === data.binId);
    const { priority, priorityScore, priorityReason } = calculateComplaintPriority(
      data.latitude,
      data.longitude,
      data.category,
      data.urgency,
      complaints,
      associatedBin,
      priorityConfig
    );

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const idCount = complaints.length + 1;
    const complaintNumber = `CMP-${now.getFullYear()}-${String(idCount).padStart(4, '0')}`;

    const newComplaint: Complaint = {
      id: `cmp_${Date.now()}`,
      complaintNumber,
      citizenId: data.citizenId,
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone,
      category: data.category,
      description: data.description,
      imageUrl: data.imageUrl,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      wardZone: data.wardZone,
      binId: data.binId,
      binNumber: data.binNumber,
      priority,
      priorityScore,
      priorityReason,
      status: 'submitted',
      createdAt: timestampStr,
      updatedAt: timestampStr,
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Create notifications for citizen and admin
    const newAdminNotif: AppNotification = {
      id: `notif_${Date.now()}_1`,
      recipientRole: 'admin',
      title: `New ${priority.toUpperCase()} Complaint: ${complaintNumber}`,
      message: `${data.category.replace('_', ' ')} reported at ${data.address}`,
      type: priority === 'critical' ? 'alert' : 'info',
      read: false,
      timestamp: 'Just now',
      linkId: newComplaint.id,
    };

    const newCitizenNotif: AppNotification = {
      id: `notif_${Date.now()}_2`,
      recipientRole: 'citizen',
      recipientId: data.citizenId,
      title: `Complaint Submitted: ${complaintNumber}`,
      message: `Your report has been logged. Our dispatch team is reviewing it.`,
      type: 'success',
      read: false,
      timestamp: 'Just now',
      linkId: newComplaint.id,
    };

    setNotifications((prev) => [newAdminNotif, newCitizenNotif, ...prev]);

    return newComplaint;
  };

  // Update complaint status
  const updateComplaintStatus = (
    complaintId: string,
    status: ComplaintStatus,
    adminNotes?: string,
    workerNotes?: string,
    proofImageUrl?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let resolvedTime: string | undefined = undefined;
    if (status === 'resolved') {
      resolvedTime = now;
    }

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            updatedAt: now,
            resolutionTime: resolvedTime || c.resolutionTime,
            adminNotes: adminNotes ?? c.adminNotes,
            workerNotes: workerNotes ?? c.workerNotes,
            proofImageUrl: proofImageUrl ?? c.proofImageUrl,
          };
        }
        return c;
      })
    );

    // Also update any route stop associated with this complaint
    setRoutes((prevRoutes) =>
      prevRoutes.map((rt) => ({
        ...rt,
        stops: rt.stops.map((stop) => {
          if (stop.complaintId === complaintId) {
            return {
              ...stop,
              status: status === 'resolved' ? 'collected' : stop.status,
              collectedAt: status === 'resolved' ? now : stop.collectedAt,
              notes: workerNotes ?? stop.notes,
              proofImage: proofImageUrl ?? stop.proofImage,
            };
          }
          return stop;
        }),
      }))
    );

    // Citizen notification on resolution or progress
    const target = complaints.find((c) => c.id === complaintId);
    if (target) {
      const statusTitle =
        status === 'resolved'
          ? `Issue Resolved: ${target.complaintNumber}`
          : status === 'in_progress'
          ? `Collection Started: ${target.complaintNumber}`
          : `Status Updated: ${target.complaintNumber}`;

      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          recipientRole: 'citizen',
          recipientId: target.citizenId,
          title: statusTitle,
          message: `Your complaint is now marked as ${status.replace('_', ' ').toUpperCase()}`,
          type: status === 'resolved' ? 'success' : 'info',
          read: false,
          timestamp: 'Just now',
          linkId: target.id,
        },
        ...prev,
      ]);
    }
  };

  // Assign complaint to worker
  const assignComplaint = (complaintId: string, workerId: string, routeId?: string) => {
    const worker = DEMO_USERS.find((u) => u.id === workerId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'assigned',
            assignedWorkerId: workerId,
            assignedWorkerName: worker?.name,
            assignedRouteId: routeId,
            updatedAt: now,
          };
        }
        return c;
      })
    );

    // Notify worker
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        recipientRole: 'worker',
        recipientId: workerId,
        title: 'New Complaint Assigned',
        message: `You have been assigned to handle complaint #${complaintId.slice(-4)}.`,
        type: 'info',
        read: false,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  // Update bin fill level (Smart Bin Simulator)
  const updateBinFill = (binId: string, newFill: number) => {
    const clamped = Math.max(0, Math.min(100, newFill));
    let status: Bin['status'] = 'normal';
    if (clamped >= 90) status = 'overflowing';
    else if (clamped >= 80) status = 'full';
    else if (clamped >= 40) status = 'filling';

    const hasSensorAlert = clamped >= 85;

    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            currentFillPercent: clamped,
            status: b.status === 'damaged' ? 'damaged' : status,
            hasSensorAlert,
          };
        }
        return b;
      })
    );

    if (hasSensorAlert) {
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          recipientRole: 'admin',
          title: `Sensor Alert: Bin Fill at ${clamped}%`,
          message: `Smart ultrasonic sensor threshold exceeded for bin #${binId}.`,
          type: 'alert',
          read: false,
          timestamp: 'Just now',
          linkId: binId,
        },
        ...prev,
      ]);
    }
  };

  // Add new bin
  const addNewBin = (binData: Omit<Bin, 'id' | 'binNumber' | 'lastCollectionTime' | 'nextScheduledCollection' | 'batteryLevelPercent' | 'temperatureCelsius' | 'hasSensorAlert'>) => {
    const idNum = bins.length + 101;
    const newBin: Bin = {
      ...binData,
      id: `bin_${idNum}`,
      binNumber: `BN-${idNum}`,
      lastCollectionTime: 'Never',
      nextScheduledCollection: 'Tomorrow 08:00',
      batteryLevelPercent: 98,
      temperatureCelsius: 26.0,
      hasSensorAlert: binData.currentFillPercent >= 85,
    };

    setBins((prev) => [...prev, newBin]);
    return newBin;
  };

  // Create collection route
  const createCollectionRoute = (
    routeData: Omit<CollectionRoute, 'id' | 'routeCode' | 'createdAt'>
  ) => {
    const now = new Date();
    const routeCode = `ROUTE-${now.getFullYear().toString().slice(-2)}-${String(routes.length + 1).padStart(3, '0')}`;
    const newRoute: CollectionRoute = {
      ...routeData,
      id: `rt_${Date.now()}`,
      routeCode,
      createdAt: now.toISOString().replace('T', ' ').substring(0, 16),
    };

    setRoutes((prev) => [newRoute, ...prev]);

    // Notify assigned worker
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        recipientRole: 'worker',
        recipientId: routeData.workerId,
        title: `New Route Dispatched: ${routeCode}`,
        message: `${routeData.stops.length} collection stops scheduled for your vehicle.`,
        type: 'info',
        read: false,
        timestamp: 'Just now',
        linkId: newRoute.id,
      },
      ...prev,
    ]);

    return newRoute;
  };

  // Update specific stop status in route
  const updateRouteStopStatus = (
    routeId: string,
    stopNumber: number,
    status: 'pending' | 'in_progress' | 'collected' | 'skipped',
    notes?: string,
    proofImage?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setRoutes((prevRoutes) =>
      prevRoutes.map((rt) => {
        if (rt.id === routeId) {
          const updatedStops = rt.stops.map((stop) => {
            if (stop.stopNumber === stopNumber) {
              // If stop is collected, also reset bin fill level!
              if (status === 'collected' && stop.binId) {
                updateBinFill(stop.binId, 5); // Cleared bin
              }

              // If linked to a complaint, resolve complaint
              if (status === 'collected' && stop.complaintId) {
                updateComplaintStatus(stop.complaintId, 'resolved', undefined, notes || 'Collected during route run', proofImage);
              }

              return {
                ...stop,
                status,
                collectedAt: status === 'collected' ? now : stop.collectedAt,
                notes: notes ?? stop.notes,
                proofImage: proofImage ?? stop.proofImage,
              };
            }
            return stop;
          });

          // Check if all stops collected
          const allCollected = updatedStops.every(
            (s) => s.status === 'collected' || s.status === 'skipped'
          );

          return {
            ...rt,
            stops: updatedStops,
            status: allCollected ? 'completed' : 'in_progress',
            completedAt: allCollected ? now : undefined,
          };
        }
        return rt;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulator tick: randomly increases waste in 3 random bins
  const simulateIotSensorTick = () => {
    setBins((prev) => {
      const copy = [...prev];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * copy.length);
        const bin = copy[randomIndex];
        const increment = Math.floor(Math.random() * 15) + 5;
        const newFill = Math.min(100, bin.currentFillPercent + increment);
        let status = bin.status;
        if (newFill >= 90) status = 'overflowing';
        else if (newFill >= 80) status = 'full';
        else if (newFill >= 40) status = 'filling';

        copy[randomIndex] = {
          ...bin,
          currentFillPercent: newFill,
          status: bin.status === 'damaged' ? 'damaged' : status,
          hasSensorAlert: newFill >= 85,
          temperatureCelsius: Number((bin.temperatureCelsius + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        };
      }
      return copy;
    });

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        recipientRole: 'admin',
        title: 'IoT Sensor Telemetry Received',
        message: 'Simulated LoRaWAN ultrasonic sensor payload processed across 25 nodes.',
        type: 'info',
        read: false,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        bins,
        complaints,
        routes,
        notifications,
        priorityConfig,
        updatePriorityConfig,
        addComplaint,
        updateComplaintStatus,
        assignComplaint,
        updateBinFill,
        addNewBin,
        createCollectionRoute,
        updateRouteStopStatus,
        markNotificationRead,
        clearAllNotifications,
        simulateIotSensorTick,
        currentView,
        setCurrentView,
        selectedComplaintForDetail,
        setSelectedComplaintForDetail,
        isReportModalOpen,
        setIsReportModalOpen,
        isDocsModalOpen,
        setIsDocsModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
