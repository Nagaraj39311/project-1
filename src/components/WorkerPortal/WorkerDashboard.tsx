import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteStop } from '../../types';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Truck,
  Upload,
  User,
  Wrench,
  Check,
} from 'lucide-react';
import { InteractiveMap } from '../Map/InteractiveMap';

export const WorkerDashboard: React.FC = () => {
  const { currentUser, routes, updateRouteStopStatus, updateBinFill, setCurrentView } = useApp();

  // Find active route for this driver
  const activeRoute = routes.find(
    (r) => r.workerId === currentUser.id || r.workerName?.includes(currentUser.name)
  ) || routes[0];

  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [workerNotes, setWorkerNotes] = useState<string>('');
  const [isDamagedReportOpen, setIsDamagedReportOpen] = useState<boolean>(false);

  if (!activeRoute) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
        <Truck className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Active Route Assigned</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The municipal dispatch admin has not assigned a collection route to vehicle {currentUser.vehicleNumber || 'your truck'} yet.
        </p>
      </div>
    );
  }

  const stops = activeRoute.stops;
  const currentStop = stops[activeStopIndex] || stops[0];
  const completedStopsCount = stops.filter((s) => s.status === 'collected').length;

  const handleMarkCollected = () => {
    updateRouteStopStatus(
      activeRoute.id,
      currentStop.stopNumber,
      'collected',
      workerNotes || 'Cleared by sanitation crew',
      proofImage || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500'
    );

    // Reset notes & proof for next stop
    setProofImage(null);
    setWorkerNotes('');

    // Advance to next pending stop if available
    const nextIdx = stops.findIndex(
      (s, idx) => idx > activeStopIndex && s.status !== 'collected'
    );
    if (nextIdx !== -1) {
      setActiveStopIndex(nextIdx);
    }
  };

  const handleMarkInProgress = () => {
    updateRouteStopStatus(activeRoute.id, currentStop.stopNumber, 'in_progress');
  };

  const handleReportDamaged = () => {
    if (currentStop.binId) {
      updateBinFill(currentStop.binId, 0); // triggers alert / damaged status
    }
    updateRouteStopStatus(
      activeRoute.id,
      currentStop.stopNumber,
      'skipped',
      'Bin hardware damaged. Maintenance team flagged.'
    );
    setIsDamagedReportOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Route Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              {activeRoute.routeCode}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Vehicle: <b className="text-white font-mono">{activeRoute.vehicleNumber}</b>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
            Driver Collection Cockpit
          </h2>
          <p className="text-slate-300 text-xs mt-0.5">
            Depot: {activeRoute.depot.name} · {stops.length} Waypoints · 2-Opt Optimized: {activeRoute.optimizedDistanceKm} km
          </p>
        </div>

        {/* Progress Counter */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right shrink-0">
          <div className="text-xs text-indigo-200 font-medium">Stops Progress</div>
          <div className="text-2xl font-black font-mono text-white mt-0.5">
            {completedStopsCount} / {stops.length}
          </div>
          <div className="w-28 bg-white/20 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(completedStopsCount / stops.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Stop Focus & Route Stop List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Stop Action Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentStop.stopNumber}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentStop.binNumber ? `Bin #${currentStop.binNumber}` : 'Citizen Grievance Point'}
                  </h3>
                  <span className="text-xs text-slate-500">Waypoint #{currentStop.stopNumber} of {stops.length}</span>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase font-mono ${
                  currentStop.status === 'collected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentStop.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentStop.status}
              </span>
            </div>

            {/* Address & Fill details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{currentStop.address}</div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Lat: {currentStop.latitude}, Lng: {currentStop.longitude}
                  </div>
                </div>
              </div>

              {currentStop.fillPercent && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Reported Fill Level:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {currentStop.fillPercent}%
                  </span>
                </div>
              )}
            </div>

            {/* Collection Actions */}
            {currentStop.status !== 'collected' ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Driver Collection Notes:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cleared 320kg wet waste, sanitized perimeter..."
                      value={workerNotes}
                      onChange={(e) => setWorkerNotes(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Upload Resolution Proof:
                    </label>
                    <label className="flex items-center gap-2 p-2 border border-dashed border-slate-300 rounded-lg cursor-pointer text-xs text-slate-600 hover:border-emerald-500 bg-slate-50">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>{proofImage ? 'Photo Attached ✓' : 'Snap / Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setProofImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={handleMarkInProgress}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Mark On Site</span>
                  </button>

                  <button
                    onClick={handleMarkCollected}
                    className="flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Bin Collected &amp; Cleared</span>
                  </button>

                  <button
                    onClick={() => setIsDamagedReportOpen(true)}
                    className="px-3 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Report Damage</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Collection Verified &amp; Recorded</span>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Completed at {currentStop.collectedAt || 'Just now'} · Bin level reset to 5%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = (activeStopIndex + 1) % stops.length;
                    setActiveStopIndex(next);
                  }}
                  className="px-3 py-1.5 bg-white text-emerald-900 border border-emerald-300 rounded-lg font-semibold hover:bg-emerald-100 text-xs"
                >
                  Next Stop →
                </button>
              </div>
            )}

            {/* Damage Report Drawer */}
            {isDamagedReportOpen && (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2 text-xs">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Flag Bin Hardware Breakdown
                </div>
                <p className="text-[11px] text-rose-700">
                  This will mark bin #{currentStop.binNumber} as 'Damaged' and notify the municipal maintenance repair crew.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsDamagedReportOpen(false)}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportDamaged}
                    className="px-3 py-1 bg-rose-600 text-white font-bold rounded hover:bg-rose-700"
                  >
                    Confirm Damaged Bin
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Navigation Map */}
          <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <InteractiveMap height="288px" highlightRouteId={activeRoute.id} />
          </div>
        </div>

        {/* Right Col: Sequence List of Stops */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Assigned Stop Sequence
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {stops.length} Stops Total
            </span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {stops.map((stop, idx) => {
              const isSelected = activeStopIndex === idx;
              const isDone = stop.status === 'collected';

              return (
                <div
                  key={idx}
                  onClick={() => setActiveStopIndex(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isDone ? '✓' : stop.stopNumber}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 truncate">
                        {stop.binNumber ? `Bin ${stop.binNumber}` : 'Complaint'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {stop.address}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 uppercase ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : stop.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {stop.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
