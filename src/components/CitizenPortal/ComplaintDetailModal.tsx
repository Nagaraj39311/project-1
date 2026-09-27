import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintStatus } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Shield,
  Truck,
  User,
  X,
  AlertOctagon,
  Image as ImageIcon,
} from 'lucide-react';

export const ComplaintDetailModal: React.FC = () => {
  const {
    selectedComplaintForDetail,
    setSelectedComplaintForDetail,
    updateComplaintStatus,
    currentUser,
    setCurrentView,
  } = useApp();

  const [reopenNote, setReopenNote] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);

  if (!selectedComplaintForDetail) return null;

  const cmp = selectedComplaintForDetail;

  const steps: { key: ComplaintStatus; label: string; desc: string }[] = [
    { key: 'submitted', label: 'Submitted', desc: 'Complaint registered by citizen' },
    { key: 'under_review', label: 'Under Review', desc: 'Verified by municipal sanitation admin' },
    { key: 'assigned', label: 'Assigned', desc: 'Driver & collection route scheduled' },
    { key: 'in_progress', label: 'In Progress', desc: 'Collection vehicle on site' },
    { key: 'resolved', label: 'Resolved', desc: 'Waste cleared and area sanitized' },
  ];

  const statusOrder: Record<ComplaintStatus, number> = {
    submitted: 0,
    under_review: 1,
    assigned: 2,
    in_progress: 3,
    resolved: 4,
    rejected: -1,
    reopened: 1,
  };

  const currentStepIndex = statusOrder[cmp.status] ?? 0;

  const handleReopen = () => {
    if (!reopenNote.trim()) {
      alert('Please add a brief note why this complaint is being reopened.');
      return;
    }
    updateComplaintStatus(cmp.id, 'reopened', undefined, `Reopened by citizen: ${reopenNote}`);
    setShowReopenBox(false);
    setSelectedComplaintForDetail(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded">
              {cmp.complaintNumber}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                cmp.priority === 'critical'
                  ? 'bg-rose-100 text-rose-800'
                  : cmp.priority === 'high'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {cmp.priority} Priority
            </span>
          </div>
          <button
            onClick={() => setSelectedComplaintForDetail(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Progress Timeline Tracker */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Resolution Lifecycle Progression
            </h4>
            <div className="relative flex items-center justify-between">
              {/* Line background */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, (currentStepIndex / 4) * 100))}%`,
                }}
              />

              {steps.map((st, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={st.key} className="relative z-10 flex flex-col items-center group">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] font-semibold ${
                        isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 text-sm">
                {cmp.category.replace('_', ' ').toUpperCase()}
              </div>
              <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                "{cmp.description}"
              </p>
              <div className="space-y-1 pt-1 text-slate-600">
                <p>
                  <b className="text-slate-700">Location:</b> {cmp.address}
                </p>
                <p>
                  <b className="text-slate-700">Zone:</b> {cmp.wardZone}
                </p>
                <p>
                  <b className="text-slate-700">Reported on:</b> {cmp.createdAt}
                </p>
                {cmp.binNumber && (
                  <p>
                    <b className="text-slate-700">Linked Bin:</b> #{cmp.binNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 text-sm flex items-center justify-between">
                <span>Dispatch &amp; Operations</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {cmp.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 pt-1 text-slate-600">
                <p>
                  <b className="text-slate-700">Assigned Driver:</b>{' '}
                  {cmp.assignedWorkerName || (
                    <span className="text-slate-400 italic">Pending assignment</span>
                  )}
                </p>
                {cmp.assignedRouteId && (
                  <p>
                    <b className="text-slate-700">Route Code:</b> {cmp.assignedRouteId}
                  </p>
                )}
                {cmp.resolutionTime && (
                  <p>
                    <b className="text-slate-700">Resolved At:</b> {cmp.resolutionTime}
                  </p>
                )}
                <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900 mt-2">
                  <div className="font-bold text-[11px]">Priority Engine Rationale:</div>
                  <div className="text-[11px] mt-0.5">{cmp.priorityReason}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {cmp.imageUrl && (
              <div className="space-y-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Citizen Report Photo
                </span>
                <img
                  src={cmp.imageUrl}
                  alt="Citizen report proof"
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            {cmp.proofImageUrl && (
              <div className="space-y-1">
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Collection Resolution Proof
                </span>
                <img
                  src={cmp.proofImageUrl}
                  alt="Worker completion proof"
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover rounded-xl border border-emerald-300"
                />
                {cmp.workerNotes && (
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    Driver note: {cmp.workerNotes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Citizen Reopen Complaint Option (if resolved or rejected) */}
          {(cmp.status === 'resolved' || cmp.status === 'rejected') && (
            <div className="pt-2 border-t border-slate-100">
              {!showReopenBox ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Is the waste still present or not cleared adequately?
                  </p>
                  <button
                    onClick={() => setShowReopenBox(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reopen Complaint
                  </button>
                </div>
              ) : (
                <div className="space-y-2 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="text-xs font-bold text-rose-900">
                    Why are you reopening this ticket?
                  </span>
                  <textarea
                    value={reopenNote}
                    onChange={(e) => setReopenNote(e.target.value)}
                    placeholder="e.g. Bin was only half emptied, debris remains scattered..."
                    rows={2}
                    className="w-full text-xs p-2 border border-rose-300 rounded-lg bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowReopenBox(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReopen}
                      className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded hover:bg-rose-700"
                    >
                      Confirm Reopen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-400">SmartWaste Municipal Tracking Token #626A</span>
          <button
            onClick={() => setSelectedComplaintForDetail(null)}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
