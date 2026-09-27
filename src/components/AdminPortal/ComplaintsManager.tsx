import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintStatus, ComplaintUrgency } from '../../types';
import { exportToCsv } from '../../utils/algorithms';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  MapPin,
  Search,
  Truck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { DEMO_USERS } from '../../data/seedData';

export const ComplaintsManager: React.FC = () => {
  const {
    complaints,
    updateComplaintStatus,
    assignComplaint,
    setSelectedComplaintForDetail,
    setCurrentView,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedWorkerMap, setSelectedWorkerMap] = useState<Record<string, string>>({});

  const workers = DEMO_USERS.filter((u) => u.role === 'worker');

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaintNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.wardZone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleExportCsv = () => {
    const exportData = filteredComplaints.map((c) => ({
      'Complaint ID': c.complaintNumber,
      'Citizen Name': c.citizenName,
      Category: c.category,
      Status: c.status,
      Priority: c.priority,
      Address: c.address,
      Zone: c.wardZone,
      'Reported Time': c.createdAt,
      'Assigned Driver': c.assignedWorkerName || 'Unassigned',
      'Resolution Time': c.resolutionTime || 'N/A',
      Description: c.description,
    }));
    exportToCsv(exportData, `smartwaste_complaints_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Municipal Complaints &amp; Civic Grievance Queue
            </h2>
            <p className="text-xs text-slate-500">
              Manage incoming citizen reports, prioritize by urgency score, and assign collection crews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setCurrentView('routes')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Batch Route Dispatch</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, citizen, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 outline-none"
            >
              <option value="all">All Statuses ({complaints.length})</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ticket &amp; Priority</th>
                <th className="py-3 px-4">Category &amp; Details</th>
                <th className="py-3 px-4">Location / Zone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No complaints match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const isCritical = c.priority === 'critical';
                  const isHigh = c.priority === 'high';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ticket & Priority */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">{c.complaintNumber}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isHigh
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {c.priority} ({c.priorityScore})
                          </span>
                        </div>
                      </td>

                      {/* Category & Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800">
                          {c.category.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate max-w-[220px]">
                          "{c.description}"
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Citizen: {c.citizenName} · {c.createdAt}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="text-slate-700 truncate font-medium">{c.address}</div>
                        <div className="text-slate-400 text-[11px]">{c.wardZone}</div>
                        {c.binNumber && (
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">
                            Bin #{c.binNumber}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            updateComplaintStatus(c.id, e.target.value as ComplaintStatus)
                          }
                          className="text-[11px] font-bold p-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 cursor-pointer outline-none uppercase"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                          <option value="reopened">Reopened</option>
                        </select>
                      </td>

                      {/* Assign Driver */}
                      <td className="py-3.5 px-4">
                        <select
                          value={c.assignedWorkerId || selectedWorkerMap[c.id] || ''}
                          onChange={(e) => {
                            setSelectedWorkerMap({ ...selectedWorkerMap, [c.id]: e.target.value });
                            assignComplaint(c.id, e.target.value);
                          }}
                          className="text-[11px] p-1 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none w-36"
                        >
                          <option value="">Select Crew...</option>
                          {workers.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name} ({w.vehicleNumber})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedComplaintForDetail(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
