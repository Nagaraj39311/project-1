import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MUNICIPAL_DEPOTS, DEMO_USERS } from '../../data/seedData';
import { RouteStop } from '../../types';
import { optimizeRoute2Opt, calculateHaversineDistance } from '../../utils/algorithms';
import { InteractiveMap } from '../Map/InteractiveMap';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Fuel,
  MapPin,
  Play,
  RotateCcw,
  Route as RouteIcon,
  Send,
  Sparkles,
  Trash2,
  Truck,
  Users,
} from 'lucide-react';

export const RouteOptimizer: React.FC = () => {
  const { bins, complaints, routes, createCollectionRoute, setCurrentView } = useApp();

  const [selectedDepotIndex, setSelectedDepotIndex] = useState<number>(0);
  const selectedDepot = MUNICIPAL_DEPOTS[selectedDepotIndex];

  // Candidates for collection: overflowing bins + high/critical complaints
  const candidateStops = useMemo(() => {
    const list: RouteStop[] = [];

    // Add overflowing or full bins
    bins
      .filter((b) => b.currentFillPercent >= 80)
      .forEach((b, idx) => {
        list.push({
          stopNumber: idx + 1,
          binId: b.id,
          binNumber: b.binNumber,
          address: b.address,
          latitude: b.latitude,
          longitude: b.longitude,
          fillPercent: b.currentFillPercent,
          urgency: b.currentFillPercent >= 90 ? 'critical' : 'high',
          status: 'pending',
        });
      });

    // Add critical complaints
    complaints
      .filter((c) => (c.status === 'submitted' || c.status === 'under_review') && (c.priority === 'critical' || c.priority === 'high'))
      .forEach((c) => {
        // avoid duplicate if already in bin list
        if (!list.some((s) => s.binId === c.binId)) {
          list.push({
            stopNumber: list.length + 1,
            complaintId: c.id,
            address: c.address,
            latitude: c.latitude,
            longitude: c.longitude,
            complaintCategory: c.category,
            urgency: c.priority,
            status: 'pending',
          });
        }
      });

    return list;
  }, [bins, complaints]);

  // Selected stop IDs for this route run
  const [selectedStopKeys, setSelectedStopKeys] = useState<string[]>(() =>
    candidateStops.slice(0, 5).map((s) => s.binId || s.complaintId || s.address)
  );

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    DEMO_USERS.find((u) => u.role === 'worker')?.id || 'user_worker_1'
  );
  const [vehicleNumber, setVehicleNumber] = useState<string>('KA-04-GA-9821');

  // Filter actual selected stops
  const activeStops = useMemo(() => {
    return candidateStops.filter((s) =>
      selectedStopKeys.includes(s.binId || s.complaintId || s.address)
    );
  }, [candidateStops, selectedStopKeys]);

  // Run 2-Opt Optimization
  const optimizationResult = useMemo(() => {
    return optimizeRoute2Opt(selectedDepot, activeStops);
  }, [selectedDepot, activeStops]);

  const toggleStopSelection = (key: string) => {
    setSelectedStopKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleDispatchRoute = () => {
    const worker = DEMO_USERS.find((u) => u.id === selectedWorkerId);
    if (!worker) return;

    if (optimizationResult.optimizedStops.length === 0) {
      alert('Please select at least 1 collection point.');
      return;
    }

    const createdRoute = createCollectionRoute({
      workerId: worker.id,
      workerName: worker.name,
      vehicleNumber,
      status: 'assigned',
      date: new Date().toISOString().split('T')[0],
      depot: selectedDepot,
      stops: optimizationResult.optimizedStops,
      originalDistanceKm: optimizationResult.originalDistanceKm,
      optimizedDistanceKm: optimizationResult.optimizedDistanceKm,
      distanceSavedKm: optimizationResult.distanceSavedKm,
      estimatedDurationMinutes: optimizationResult.estimatedDurationMinutes,
    });

    alert(`Route ${createdRoute.routeCode} successfully dispatched to ${worker.name}!`);
    setCurrentView('dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Algorithm: Nearest Neighbor + 2-Opt Local Search</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Route Optimization Studio
          </h2>
          <p className="text-xs text-slate-500">
            Eliminates route self-intersections, minimizes municipal truck fuel consumption, and calculates optimal collection sequences.
          </p>
        </div>

        <button
          onClick={handleDispatchRoute}
          disabled={optimizationResult.optimizedStops.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch Route to Driver</span>
        </button>
      </div>

      {/* Metrics Comparison Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Unoptimized Distance</span>
          <div className="text-xl font-extrabold text-slate-600 mt-1 font-mono">
            {optimizationResult.originalDistanceKm} km
          </div>
          <span className="text-[11px] text-slate-400">Random/linear traversal</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
          <span className="text-xs text-emerald-800 font-semibold">2-Opt Optimized</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
            {optimizationResult.optimizedDistanceKm} km
          </div>
          <span className="text-[11px] text-emerald-600">Crossings eliminated</span>
        </div>

        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
          <span className="text-xs text-indigo-800 font-semibold">Distance Saved</span>
          <div className="text-xl font-extrabold text-indigo-700 mt-1 font-mono">
            {optimizationResult.distanceSavedKm} km
          </div>
          <span className="text-[11px] text-indigo-600">
            ~{Math.round((optimizationResult.distanceSavedKm / (optimizationResult.originalDistanceKm || 1)) * 100)}% route efficiency gain
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Estimated Time &amp; Stops</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {optimizationResult.estimatedDurationMinutes} min
          </div>
          <span className="text-[11px] text-slate-400">
            {optimizationResult.optimizedStops.length} collection stops
          </span>
        </div>
      </div>

      {/* Configuration & Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Config & Stops Selection */}
        <div className="space-y-4">
          {/* Depot & Vehicle Selection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Starting Depot &amp; Vehicle
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">Municipal Depot (HQ):</label>
              <select
                value={selectedDepotIndex}
                onChange={(e) => setSelectedDepotIndex(Number(e.target.value))}
                className="w-full mt-1 text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-800 outline-none"
              >
                {MUNICIPAL_DEPOTS.map((d, idx) => (
                  <option key={d.name} value={idx}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Assign Driver:</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full mt-1 text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 outline-none font-medium"
                >
                  {DEMO_USERS.filter((u) => u.role === 'worker').map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Vehicle Plate:</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full mt-1 text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-800 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Stops Pool Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Select Waypoints ({activeStops.length} of {candidateStops.length})
              </h3>
              <button
                onClick={() =>
                  setSelectedStopKeys(
                    candidateStops.map((s) => s.binId || s.complaintId || s.address)
                  )
                }
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Select All
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {candidateStops.map((stop) => {
                const key = stop.binId || stop.complaintId || stop.address;
                const isSelected = selectedStopKeys.includes(key);

                return (
                  <div
                    key={key}
                    onClick={() => toggleStopSelection(key)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 text-slate-900 font-medium'
                        : 'border-slate-100 bg-slate-50/40 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">
                          {stop.binNumber ? `Bin ${stop.binNumber}` : 'Citizen Report'}
                        </span>
                        <div className="text-[11px] text-slate-500 truncate">
                          {stop.address}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 ${
                        stop.fillPercent && stop.fillPercent >= 90
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {stop.fillPercent ? `${stop.fillPercent}%` : stop.urgency?.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Optimized Tour Sequence & Map Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tour Sequence Breadcrumbs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Calculated 2-Opt Waypoint Sequence
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold">
                Depot: {selectedDepot.name.split(' ')[0]}
              </span>

              {optimizationResult.optimizedStops.map((stop, idx) => (
                <React.Fragment key={idx}>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {stop.stopNumber}
                    </span>
                    <span className="truncate max-w-[140px]">
                      {stop.binNumber ? `Bin ${stop.binNumber}` : stop.address.split(',')[0]}
                    </span>
                  </div>
                </React.Fragment>
              ))}

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold">
                Return to Depot
              </span>
            </div>
          </div>

          {/* Interactive Map Visualizer */}
          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <InteractiveMap height="420px" />
          </div>
        </div>
      </div>
    </div>
  );
};
