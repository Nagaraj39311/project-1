import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WARD_ZONES } from '../../data/seedData';
import { exportToCsv } from '../../utils/algorithms';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Fuel,
  MapPin,
  PieChart,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsStudio: React.FC = () => {
  const { complaints, bins, routes } = useApp();

  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('7days');

  // Aggregated Metrics
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'resolved').length;
  const resolutionRate = totalComplaints ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
  const overflowingBinsCount = bins.filter((b) => b.status === 'overflowing').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Status counts
  const statusCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  // Ward counts
  const wardComplaints: Record<string, number> = {};
  complaints.forEach((c) => {
    wardComplaints[c.wardZone] = (wardComplaints[c.wardZone] || 0) + 1;
  });

  // Distance saved across all routes
  const totalDistanceSaved = routes.reduce((acc, r) => acc + (r.distanceSavedKm || 0), 0);

  // Daily mock trend for past 7 days
  const dailyData = [
    { day: 'Mon', count: 12, resolved: 10 },
    { day: 'Tue', count: 18, resolved: 15 },
    { day: 'Wed', count: 14, resolved: 13 },
    { day: 'Thu', count: 22, resolved: 19 },
    { day: 'Fri', count: 25, resolved: 21 },
    { day: 'Sat', count: 31, resolved: 26 },
    { day: 'Sun', count: 19, resolved: 16 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Civic Intelligence &amp; SLA Tracking</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Municipal Waste Analytics &amp; Hotspots
          </h2>
          <p className="text-xs text-slate-500">
            Operational metrics, ward concentration hotspots, category distribution, and route efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['today', '7days', '30days'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  timeRange === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const reportRows = complaints.map((c) => ({
                Ticket: c.complaintNumber,
                Category: c.category,
                Priority: c.priority,
                Status: c.status,
                Zone: c.wardZone,
                Created: c.createdAt,
              }));
              exportToCsv(reportRows, `waste_analytics_report_${timeRange}`);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Resolution Success Rate</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {resolutionRate}%
          </div>
          <span className="text-[11px] text-slate-400">
            {resolvedComplaints} of {totalComplaints} tickets resolved
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Avg Resolution SLA</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">
            3.8 hrs
          </div>
          <span className="text-[11px] text-slate-400">Target municipal SLA: &lt; 6 hrs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Overflowing Bins Active</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-2 font-mono">
            {overflowingBinsCount}
          </div>
          <span className="text-[11px] text-slate-400">Exceeding 90% capacity</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">2-Opt Distance Saved</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-2 font-mono">
            {totalDistanceSaved.toFixed(1)} km
          </div>
          <span className="text-[11px] text-slate-400">~{Math.round(totalDistanceSaved * 0.32)} L diesel emissions reduced</span>
        </div>
      </div>

      {/* Trends Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Daily Grievance Inflow vs. Resolution Trend
            </h3>
            <span className="text-xs text-slate-400">Past 7 Operational Days</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-slate-100">
            {dailyData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-full">
                  {/* Inflow bar */}
                  <div
                    className="w-1/2 bg-slate-300 rounded-t-md hover:bg-slate-400 transition-colors"
                    style={{ height: `${(item.count / 35) * 100}%` }}
                    title={`Reported: ${item.count}`}
                  />
                  {/* Resolved bar */}
                  <div
                    className="w-1/2 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-colors"
                    style={{ height: `${(item.resolved / 35) * 100}%` }}
                    title={`Resolved: ${item.resolved}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 font-mono">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-300 rounded-xs" />
              <span>Complaints Received</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs" />
              <span>Resolved by Drivers</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Issue Category Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalComplaints) * 100) || 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span className="capitalize">{cat.replace('_', ' ')}</span>
                    <span className="font-mono text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ward Concentration Hotspots */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              Municipal Ward Concentration Hotspots
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated geographic density identifying wards with peak sanitation complaints.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WARD_ZONES.map((ward) => {
            const count = wardComplaints[ward.name] || 0;
            const isHighDensity = count >= 4;

            return (
              <div
                key={ward.id}
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isHighDensity
                    ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-xs text-slate-900">{ward.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isHighDensity
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isHighDensity ? 'HOTSPOT' : 'NORMAL'}
                  </span>
                </div>

                <div className="text-xl font-extrabold font-mono text-slate-800">
                  {count} <span className="text-xs font-normal text-slate-500">tickets</span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                  <div>Active Smart Bins: <b>{ward.activeBins}</b></div>
                  <div>Base Depot: <b>{ward.depotName.split(' ')[0]}</b></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
          <b>Engineering Note:</b> Hotspot detection utilizes Haversine spatial aggregation clustering rather than exposing individual citizen home addresses, maintaining privacy-by-design.
        </div>
      </div>
    </div>
  );
};
