import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  PlusCircle,
  Trash2,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    bins,
    setIsReportModalOpen,
    setSelectedComplaintForDetail,
    setCurrentView,
  } = useApp();

  // Filter complaints submitted by this citizen
  const citizenComplaints = complaints.filter(
    (c) => c.citizenId === currentUser.id || c.citizenName === currentUser.name
  );

  const totalComplaints = citizenComplaints.length;
  const pendingCount = citizenComplaints.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review'
  ).length;
  const inProgressCount = citizenComplaints.filter(
    (c) => c.status === 'assigned' || c.status === 'in_progress'
  ).length;
  const resolvedCount = citizenComplaints.filter((c) => c.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Hero Action Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
            <span>🌿</span>
            <span>Civic Sanitation &amp; Clean City Initiative</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            See an overflowing or damaged garbage bin in your ward?
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Report within 30 seconds with automatic GPS location and optional photo evidence. Our municipal dispatch system prioritizes reports and assigns collection trucks immediately.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report Overflowing Bin</span>
            </button>
            <button
              onClick={() => setCurrentView('map')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-600/40 text-white font-semibold text-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>Explore Ward Bin Map</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Trash2 className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Reports</span>
            <Trash2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
            {totalComplaints}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Logged from your account</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Under Review / Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2 font-mono tabular-nums">
            {pendingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting dispatch review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Truck In Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono tabular-nums">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Collection vehicle dispatched</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Resolved &amp; Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono tabular-nums">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sanitized &amp; collected</p>
        </div>
      </div>

      {/* Main Content Layout: Recent Reports & Nearby Smart Bins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Complaints List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Your Reported Issues
              </h3>
              <p className="text-xs text-slate-500">
                Track status updates and driver assignment in real time
              </p>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              + New Report
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {citizenComplaints.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Trash2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  No complaints submitted yet
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you report an overflowing bin or missed garbage collection, your ticket and resolution timeline will appear here.
                </p>
              </div>
            ) : (
              citizenComplaints.map((c) => {
                const statusStyles: Record<string, string> = {
                  submitted: 'bg-slate-100 text-slate-700',
                  under_review: 'bg-amber-100 text-amber-800',
                  assigned: 'bg-indigo-100 text-indigo-800',
                  in_progress: 'bg-blue-100 text-blue-800 animate-pulse',
                  resolved: 'bg-emerald-100 text-emerald-800',
                  rejected: 'bg-rose-100 text-rose-800',
                  reopened: 'bg-purple-100 text-purple-800',
                };

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaintForDetail(c)}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt="Report thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Trash2 className="w-6 h-6" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {c.complaintNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              statusStyles[c.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {c.category.replace('_', ' ').toUpperCase()} — {c.address}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          "{c.description}"
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {c.createdAt}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Ward Smart Bins Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Nearby Smart Bins
            </h3>
            <button
              onClick={() => setCurrentView('map')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View on Map
            </button>
          </div>

          <div className="space-y-3">
            {bins.slice(0, 5).map((bin) => {
              const isOver = bin.status === 'overflowing';
              const isFull = bin.status === 'full';

              return (
                <div
                  key={bin.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      Bin #{bin.binNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isOver
                          ? 'bg-rose-100 text-rose-800'
                          : isFull
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {bin.currentFillPercent}% Fill
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isOver ? 'bg-rose-500' : isFull ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${bin.currentFillPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 truncate">
                    <span className="truncate">📍 {bin.address}</span>
                    <span className="capitalize font-medium ml-1 shrink-0">{bin.binType}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Civic Guidelines Box */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5 text-emerald-950">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              💡 Waste Segregation Tip
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Always separate organic kitchen waste (green bin) from dry plastics and packaging (blue bin). Avoid disposing construction debris in municipal domestic bins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
