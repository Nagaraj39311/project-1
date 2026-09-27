import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintCategory, ComplaintUrgency } from '../../types';
import { checkDuplicateComplaint, calculateComplaintPriority } from '../../utils/algorithms';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Crosshair,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Upload,
  X,
  Search,
} from 'lucide-react';

export const ComplaintModal: React.FC = () => {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    addComplaint,
    currentUser,
    bins,
    complaints,
    priorityConfig,
    setSelectedComplaintForDetail,
  } = useApp();

  const [category, setCategory] = useState<ComplaintCategory>('overflowing_bin');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<ComplaintUrgency>('medium');
  const [latitude, setLatitude] = useState<number>(12.9718);
  const [longitude, setLongitude] = useState<number>(77.5985);
  const [address, setAddress] = useState('Brigade Road Junction, MG Road Corner');
  const [wardZone, setWardZone] = useState('Ward 18 - Central Commercial');
  const [selectedBinId, setSelectedBinId] = useState<string>('bin_101');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<any>(null);

  // Check duplicates whenever lat, lng, or category changes
  useEffect(() => {
    const check = checkDuplicateComplaint(latitude, longitude, category, complaints);
    if (check.isDuplicate && check.matchingComplaint) {
      setDuplicateWarning(check);
    } else {
      setDuplicateWarning(null);
    }
  }, [latitude, longitude, category, complaints]);

  // Compute live priority preview
  const associatedBin = bins.find((b) => b.id === selectedBinId);
  const priorityPreview = calculateComplaintPriority(
    latitude,
    longitude,
    category,
    urgency,
    complaints,
    associatedBin,
    priorityConfig
  );

  if (!isReportModalOpen) return null;

  // Use GPS location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setLatitude(lat);
        setLongitude(lng);
        setAddress(`GPS Lat: ${lat}, Lng: ${lng} (Near User Location)`);
        setIsLocating(false);
        setLocationStatus('Location captured successfully via device GPS.');
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('Location permission denied or unavailable. Fallback default used.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset location select
  const handlePresetSelect = (b: any) => {
    setSelectedBinId(b.id);
    setLatitude(b.latitude);
    setLongitude(b.longitude);
    setAddress(b.address);
    setWardZone(b.wardZone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a brief description of the waste issue.');
      return;
    }

    const created = addComplaint({
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      citizenPhone: currentUser.phone,
      category,
      description,
      imageUrl: imagePreview || 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500',
      latitude,
      longitude,
      address,
      wardZone,
      binId: selectedBinId || undefined,
      binNumber: associatedBin?.binNumber,
      urgency,
    });

    setSubmittedSuccess(created);
  };

  const handleClose = () => {
    setIsReportModalOpen(false);
    setSubmittedSuccess(null);
    setDescription('');
    setImagePreview(null);
    setDuplicateWarning(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ♻️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Report Waste or Overflowing Bin
              </h3>
              <p className="text-xs text-slate-500">
                Municipal civic complaint logging &amp; dynamic priority dispatch
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Complaint Successfully Registered!
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your ticket <span className="font-mono font-bold text-slate-900">{submittedSuccess.complaintNumber}</span> has been logged with the municipal dispatch center.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Priority Assigned:</span>
                <span className="font-bold text-rose-600 uppercase">
                  {submittedSuccess.priority} (Score: {submittedSuccess.priorityScore}/100)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority Reason:</span>
                <span className="font-medium text-slate-700">{submittedSuccess.priorityReason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-indigo-700">SUBMITTED</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedComplaintForDetail(submittedSuccess);
                  handleClose();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Track Status &amp; Timeline
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Duplicate Detection Alert Banner */}
            {duplicateWarning && duplicateWarning.matchingComplaint && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-800">
                    Similar Active Complaint Detected ({duplicateWarning.distanceMeters}m away)
                  </div>
                  <p className="text-amber-700">
                    A report for <span className="font-semibold">{duplicateWarning.matchingComplaint.category.replace('_', ' ')}</span> already exists at {duplicateWarning.matchingComplaint.address} ({duplicateWarning.matchingComplaint.status.toUpperCase()}).
                  </p>
                  <p className="text-[11px] text-amber-600">
                    You may still submit if this is a separate occurrence. Multiple reports raise the incident priority score!
                  </p>
                </div>
              </div>
            )}

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'overflowing_bin', label: 'Overflowing Bin', icon: '🗑️' },
                  { id: 'garbage_not_collected', label: 'Missed Collection', icon: '⏳' },
                  { id: 'waste_scattered', label: 'Scattered Debris', icon: '💨' },
                  { id: 'illegal_dumping', label: 'Illegal Dumping', icon: '🚫' },
                  { id: 'damaged_bin', label: 'Damaged Bin', icon: '🔧' },
                  { id: 'other', label: 'Other Hazard', icon: '⚠️' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as ComplaintCategory)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      category === cat.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description of Situation *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Bin has been overflowing for 24 hours, waste spilling onto footpaths, foul smell..."
                rows={2}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                required
              />
            </div>

            {/* Location selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Location &amp; Coordinates *
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                </button>
              </div>

              {locationStatus && (
                <p className="text-[11px] text-slate-500 italic">{locationStatus}</p>
              )}

              {/* Quick Pick Bin Location */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-semibold text-slate-600">
                  Select Associated Municipal Smart Bin (or use GPS):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {bins.slice(0, 8).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handlePresetSelect(b)}
                      className={`text-left text-[11px] p-2 rounded-lg border transition-all truncate flex items-center justify-between ${
                        selectedBinId === b.id
                          ? 'border-emerald-500 bg-white shadow-xs font-semibold text-slate-900'
                          : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                      }`}
                    >
                      <span className="truncate">
                        <b>{b.binNumber}:</b> {b.address}
                      </span>
                      <span className="ml-1 text-[10px] px-1 py-0.2 rounded bg-slate-100 font-mono">
                        {b.currentFillPercent}%
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Address / Landmark</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Coordinates (Lat, Lng)</span>
                    <input
                      type="text"
                      readOnly
                      value={`${latitude}, ${longitude}`}
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-100 font-mono text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Urgency & Citizen Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Perceived Urgency
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['low', 'medium', 'high', 'critical'] as ComplaintUrgency[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`py-1.5 text-xs font-bold rounded-lg uppercase transition-all ${
                        urgency === lvl
                          ? lvl === 'critical'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : lvl === 'high'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Optional Photo Proof (Max 5MB)
                </label>
                <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl cursor-pointer text-xs text-slate-600 transition-colors bg-white">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{imagePreview ? 'Change Photo' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {imagePreview && (
              <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Dynamic Priority Preview Engine Explainer */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-indigo-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Algorithmic Priority Evaluation
                </span>
                <span className="uppercase text-[11px] px-2 py-0.5 rounded bg-indigo-200 font-mono">
                  {priorityPreview.priority} ({priorityPreview.priorityScore}/100)
                </span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                <b>Rationale:</b> {priorityPreview.priorityReason}
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
              >
                Submit Citizen Complaint
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
