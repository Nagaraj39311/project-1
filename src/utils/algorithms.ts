import { Complaint, Bin, PriorityRuleConfig, ComplaintUrgency, RouteStop } from '../types';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates total route distance visiting stops in order, starting and ending at depot
 */
export function calculateTourDistance(
  depot: { latitude: number; longitude: number },
  stops: RouteStop[]
): number {
  if (stops.length === 0) return 0;

  let total = 0;
  // Depot to first stop
  total += calculateHaversineDistance(
    depot.latitude,
    depot.longitude,
    stops[0].latitude,
    stops[0].longitude
  );

  // Stop to stop
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateHaversineDistance(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude
    );
  }

  // Last stop back to depot
  total += calculateHaversineDistance(
    stops[stops.length - 1].latitude,
    stops[stops.length - 1].longitude,
    depot.latitude,
    depot.longitude
  );

  return total;
}

/**
 * Nearest Neighbor Construction Heuristic
 * Generates initial baseline tour by repeatedly choosing the closest unvisited location
 */
export function solveNearestNeighbor(
  depot: { latitude: number; longitude: number },
  stops: RouteStop[]
): RouteStop[] {
  if (stops.length <= 1) return [...stops];

  const unvisited = [...stops];
  const tour: RouteStop[] = [];

  let currentLat = depot.latitude;
  let currentLng = depot.longitude;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateHaversineDistance(
        currentLat,
        currentLng,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    tour.push(nextStop);
    currentLat = nextStop.latitude;
    currentLng = nextStop.longitude;
  }

  return tour;
}

/**
 * 2-Opt Local Search Route Optimization Algorithm
 * Eliminates route self-intersections by swapping pairs of edges until no further improvement can be found
 */
export function optimizeRoute2Opt(
  depot: { latitude: number; longitude: number },
  initialStops: RouteStop[]
): {
  optimizedStops: RouteStop[];
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  estimatedDurationMinutes: number;
} {
  if (initialStops.length <= 2) {
    const dist = calculateTourDistance(depot, initialStops);
    return {
      optimizedStops: initialStops.map((s, idx) => ({ ...s, stopNumber: idx + 1 })),
      originalDistanceKm: Number(dist.toFixed(2)),
      optimizedDistanceKm: Number(dist.toFixed(2)),
      distanceSavedKm: 0,
      estimatedDurationMinutes: estimateTravelTime(dist, initialStops.length),
    };
  }

  // Start with Nearest Neighbor sequence as baseline
  const unoptimizedTour = [...initialStops];
  const originalDistance = calculateTourDistance(depot, unoptimizedTour);

  let currentTour = solveNearestNeighbor(depot, initialStops);
  let bestDistance = calculateTourDistance(depot, currentTour);

  let improved = true;
  let iterations = 0;
  const maxIterations = 200;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < currentTour.length - 1; i++) {
      for (let k = i + 1; k < currentTour.length; k++) {
        // Perform 2-opt swap: reverse the slice between i and k
        const candidateTour = twoOptSwap(currentTour, i, k);
        const candidateDistance = calculateTourDistance(depot, candidateTour);

        if (candidateDistance < bestDistance - 0.001) {
          currentTour = candidateTour;
          bestDistance = candidateDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  // Renumber stops 1..N
  const finalStops = currentTour.map((stop, idx) => ({
    ...stop,
    stopNumber: idx + 1,
  }));

  const optimizedDistance = Number(bestDistance.toFixed(2));
  const origDist = Number(originalDistance.toFixed(2));
  const saved = Math.max(0, Number((origDist - optimizedDistance).toFixed(2)));

  return {
    optimizedStops: finalStops,
    originalDistanceKm: origDist,
    optimizedDistanceKm: optimizedDistance,
    distanceSavedKm: saved,
    estimatedDurationMinutes: estimateTravelTime(optimizedDistance, finalStops.length),
  };
}

function twoOptSwap(route: RouteStop[], i: number, k: number): RouteStop[] {
  const newRoute: RouteStop[] = [];
  // 1. Take route[0] to route[i-1]
  for (let c = 0; c < i; c++) {
    newRoute.push(route[c]);
  }
  // 2. Reverse route[i] to route[k]
  for (let c = k; c >= i; c--) {
    newRoute.push(route[c]);
  }
  // 3. Take route[k+1] to end
  for (let c = k + 1; c < route.length; c++) {
    newRoute.push(route[c]);
  }
  return newRoute;
}

/**
 * Estimates duration in minutes assuming average urban municipal collection speed of 24 km/h
 * plus 5 minutes dwell time per collection stop
 */
export function estimateTravelTime(distanceKm: number, stopCount: number): number {
  const drivingTimeMinutes = (distanceKm / 24) * 60;
  const collectionDwellTimeMinutes = stopCount * 5;
  return Math.round(drivingTimeMinutes + collectionDwellTimeMinutes);
}

/**
 * Priority Scoring Engine
 * Generates transparent score (0-100) and human-readable explanation
 */
export function calculateComplaintPriority(
  complaintLat: number,
  complaintLon: number,
  category: string,
  citizenUrgency: ComplaintUrgency,
  existingComplaints: Complaint[],
  bin?: Bin,
  config: PriorityRuleConfig = {
    weightNearbyReports: 25,
    weightFillLevel: 30,
    weightAgeHours: 15,
    weightUrgency: 30,
  }
): { priority: ComplaintUrgency; priorityScore: number; priorityReason: string } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Nearby unresolved reports check within 150 meters
  const nearbyActiveCount = existingComplaints.filter((c) => {
    if (c.status === 'resolved' || c.status === 'rejected') return false;
    const distMeters = calculateHaversineDistance(complaintLat, complaintLon, c.latitude, c.longitude) * 1000;
    return distMeters <= 150;
  }).length;

  if (nearbyActiveCount >= 3) {
    score += config.weightNearbyReports;
    reasons.push(`${nearbyActiveCount} unresolved reports within 150m (hotspot area)`);
  } else if (nearbyActiveCount >= 1) {
    score += config.weightNearbyReports * 0.6;
    reasons.push(`${nearbyActiveCount} prior nearby unresolved report`);
  }

  // 2. Bin fill level factor
  if (bin) {
    if (bin.currentFillPercent >= 90) {
      score += config.weightFillLevel;
      reasons.push(`Bin #${bin.binNumber} fill level is at ${bin.currentFillPercent}% (overflow imminent)`);
    } else if (bin.currentFillPercent >= 75) {
      score += config.weightFillLevel * 0.7;
      reasons.push(`Bin #${bin.binNumber} fill level is at ${bin.currentFillPercent}%`);
    } else {
      score += config.weightFillLevel * 0.2;
    }
  } else {
    // If not associated with a specific smart bin, check category
    if (category === 'overflowing_bin' || category === 'illegal_dumping') {
      score += config.weightFillLevel * 0.75;
      reasons.push('High-impact sanitation event reported');
    }
  }

  // 3. Citizen reported urgency
  switch (citizenUrgency) {
    case 'critical':
      score += config.weightUrgency;
      reasons.push('Citizen marked urgency as Critical');
      break;
    case 'high':
      score += config.weightUrgency * 0.75;
      reasons.push('Citizen marked urgency as High');
      break;
    case 'medium':
      score += config.weightUrgency * 0.5;
      break;
    case 'low':
      score += config.weightUrgency * 0.2;
      break;
  }

  // Category specific boost
  if (category === 'illegal_dumping' || category === 'waste_scattered') {
    score += 10;
    reasons.push('Public health hazard factor');
  }

  // Map to urgency levels
  let priority: ComplaintUrgency = 'low';
  if (score >= 70) {
    priority = 'critical';
  } else if (score >= 50) {
    priority = 'high';
  } else if (score >= 30) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  const priorityReason = reasons.length > 0 ? reasons.join(' • ') : 'Standard municipal collection priority';

  return {
    priority,
    priorityScore: Math.min(100, Math.round(score)),
    priorityReason,
  };
}

/**
 * Duplicate Complaint Detection
 * Flags if another unresolved complaint exists within 75 meters with matching category
 */
export function checkDuplicateComplaint(
  latitude: number,
  longitude: number,
  category: string,
  existingComplaints: Complaint[]
): { isDuplicate: boolean; matchingComplaint?: Complaint; distanceMeters?: number } {
  for (const existing of existingComplaints) {
    if (existing.status === 'resolved' || existing.status === 'rejected') continue;

    const distMeters = Math.round(
      calculateHaversineDistance(latitude, longitude, existing.latitude, existing.longitude) * 1000
    );

    if (distMeters <= 75) {
      return {
        isDuplicate: true,
        matchingComplaint: existing,
        distanceMeters: distMeters,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Export data to CSV string format
 */
export function exportToCsv(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
