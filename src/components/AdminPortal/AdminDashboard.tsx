import React from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../Map/InteractiveMap';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Flame,
  Fuel,
  MapPin,
  Play,
  PlusCircle,
  Route as RouteIcon,
  Trash2,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    bins,
    complaints,
    routes,
    setCurrentView,
    setSelectedComplaintForDetail,
    simulateIotSensorTick,
  } = useApp();

  // Metrics
  const totalBins = bins.length;
  const overflowingBins = bins.filter((b) => b.status === 'overflowing').length;
  const openComplaints = complaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'rejected'
  ).length;
  const highPriorityCount = complaints.filter(
    (c) => (c.priority === 'critical' || c.priority === 'high') && c.status !== 'resolved'
  ).length;
  const activeRoutesCount = routes.filter((r) => r.status === 'in_progress').length;
  const completedToday = complaints.filter((c) => c.status === 'resolved').length;
  const totalKmSaved = routes.reduce((acc, r) => acc + (r.distanceSavedKm || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <span>🏛️</span>
            <span>Municipal Sanitation Command Center</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">
            City Operations &amp; Dispatch Overview
          </h2>
          <p className="text-slate-300 text-xs">
            Real-time municipal telemetry across 25 smart bins, active citizen grievance tickets, and 2-Opt fleet routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentView('routes')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <RouteIcon className="w-4 h-4" />
            <span>2-Opt Route Planner</span>
          </button>
          <button
            onClick={() => setCurrentView('bins')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>IoT Bin Simulator</span>
          </button>
        </div>
      </div>

      {/* 8 Operational KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Smart Bins</span>
            <Trash2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {totalBins}
          </div>
          <p className="text-[11px] text-slate-400">Connected municipal nodes</p>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span>Overflowing Bins</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
            {overflowingBins}
          </div>
          <p className="text-[11px] text-rose-700">Immediate clearance required</p>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Critical / High Priority</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">
            {highPriorityCount}
          </div>
          <p className="text-[11px] text-amber-700">Multi-report / high fill</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Open Grievances</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1 font-mono">
            {openComplaints}
          </div>
          <p className="text-[11px] text-slate-400">In citizen queue</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Collection Routes</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {activeRoutesCount || 1}
          </div>
          <p className="text-[11px] text-slate-400">Trucks on municipal run</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {completedToday}
          </div>
          <p className="text-[11px] text-slate-400">Cleared &amp; verified</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Avg Resolution SLA</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            3.8h
          </div>
          <p className="text-[11px] text-slate-400">Below 6h statutory target</p>
        </div>

        <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 shadow-xs">
          <div className="flex items-center justify-between text-teal-800 text-xs font-semibold">
            <span>Route Km Saved</span>
            <Fuel className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-700 mt-1 font-mono">
            {totalKmSaved.toFixed(1)} km
          </div>
          <p className="text-[11px] text-teal-600">Via 2-Opt local search</p>
        </div>
      </div>

      {/* Main Layout: Live Operations Map & High-Urgency Dispatch Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Live City Operations Map
            </h3>
            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span>🟢 Normal</span>
              <span>🟡 Full</span>
              <span>🔴 Overflowing</span>
              <span>🟧 Citizen Ticket</span>
            </div>
          </div>

          <div className="h-[460px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <InteractiveMap height="460px" />
          </div>
        </div>

        {/* Right Col: High-Urgency Queue Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Actionable Ticket Queue
              </h3>
              <p className="text-xs text-slate-500">Unresolved complaints prioritized</p>
            </div>
            <button
              onClick={() => setCurrentView('complaints')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View All ({complaints.length})
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {complaints
              .filter((c) => c.status !== 'resolved' && c.status !== 'rejected')
              .slice(0, 6)
              .map((c) => {
                const isCritical = c.priority === 'critical';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaintForDetail(c)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {c.complaintNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.priority} ({c.priorityScore})
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {c.category.replace('_', ' ').toUpperCase()}
                    </div>

                    <div className="text-[11px] text-slate-500 truncate">
                      📍 {c.address}
                    </div>

                    <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200 truncate">
                      <b>Why:</b> {c.priorityReason}
                    </div>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() => setCurrentView('routes')}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Launch 2-Opt Route Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
