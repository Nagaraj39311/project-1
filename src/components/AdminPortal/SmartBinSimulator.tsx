import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bin, BinType, BinStatus } from '../../types';
import {
  AlertTriangle,
  Battery,
  Cpu,
  Layers,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Sliders,
  Thermometer,
  Trash2,
  Zap,
} from 'lucide-react';

export const SmartBinSimulator: React.FC = () => {
  const { bins, updateBinFill, addNewBin, simulateIotSensorTick, setCurrentView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New bin form state
  const [newBinAddress, setNewBinAddress] = useState('');
  const [newBinType, setNewBinType] = useState<BinType>('general');
  const [newBinCapacity, setNewBinCapacity] = useState(1100);
  const [newBinWard, setNewBinWard] = useState('Ward 18 - Central Commercial');
  const [newBinLat, setNewBinLat] = useState(12.9716);
  const [newBinLng, setNewBinLng] = useState(77.5946);

  const filteredBins = bins.filter((b) => {
    const matchesSearch =
      b.binNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || b.binType === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinAddress.trim()) {
      alert('Please enter bin address');
      return;
    }

    addNewBin({
      binType: newBinType,
      latitude: newBinLat,
      longitude: newBinLng,
      address: newBinAddress,
      wardZone: newBinWard,
      capacityLiters: newBinCapacity,
      currentFillPercent: 10,
      status: 'normal',
    });

    setIsAddModalOpen(false);
    setNewBinAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Simulated LoRaWAN / Ultrasonic IoT Telemetry</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mt-2">
              Smart Waste Bin Sensor Simulator
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed mt-1">
              In production, physical HC-SR04 ultrasonic sensors or radar telemetry modules send fill-level packets via LoRaWAN/NB-IoT. In this academic simulation console, you can interactively adjust individual bin levels or trigger continuous random waste accumulation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={simulateIotSensorTick}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Trigger IoT Sensor Pulse</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy New Bin</span>
            </button>
          </div>
        </div>

        {/* Real-world API Contract Notice */}
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
          <span>
            <b>Hardware Ingestion Endpoint:</b> <code className="text-indigo-300 font-mono">POST /api/sensors/bin/:bin_id</code> accepts <code>{'{ fill_level, battery, temp, timestamp }'}</code>
          </span>
          <span className="font-mono text-emerald-400">STATUS: Telemetry Mock Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Bin # or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'general', 'organic', 'recyclable', 'hazardous'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bins Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBins.map((bin) => {
          const isOverflowing = bin.currentFillPercent >= 90;
          const isFull = bin.currentFillPercent >= 80 && !isOverflowing;

          return (
            <div
              key={bin.id}
              className={`p-5 rounded-2xl border transition-all ${
                isOverflowing
                  ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono text-sm font-extrabold text-slate-900">
                      {bin.binNumber}
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {bin.binType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                    {bin.address}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-lg font-black ${
                      isOverflowing
                        ? 'text-rose-600'
                        : isFull
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {bin.currentFillPercent}%
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {bin.capacityLiters} L
                  </div>
                </div>
              </div>

              {/* Interactive Fill Slider */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <Sliders className="w-3 h-3" />
                    Simulate Ultrasonic Fill Level:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {bin.currentFillPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bin.currentFillPercent}
                  onChange={(e) => updateBinFill(bin.id, Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Telemetry Sensor Indicators */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-0.5">
                    <Battery className="w-3 h-3" /> Battery
                  </div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {bin.batteryLevelPercent}%
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-0.5">
                    <Thermometer className="w-3 h-3" /> Core Temp
                  </div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {bin.temperatureCelsius}°C
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-0.5">
                    <Radio className="w-3 h-3" /> Sensor
                  </div>
                  <div
                    className={`font-bold mt-0.5 text-[11px] ${
                      bin.hasSensorAlert ? 'text-rose-600 font-bold' : 'text-emerald-600'
                    }`}
                  >
                    {bin.hasSensorAlert ? 'ALERT' : 'OK'}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isOverflowing && (
                <div className="mt-3">
                  <button
                    onClick={() => setCurrentView('routes')}
                    className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Include in Route Optimization</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deploy Bin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Deploy New Municipal Smart Bin
            </h3>

            <form onSubmit={handleAddBin} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Location / Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100ft Road Metro Exit Pillar #42"
                  value={newBinAddress}
                  onChange={(e) => setNewBinAddress(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Bin Category
                  </label>
                  <select
                    value={newBinType}
                    onChange={(e) => setNewBinType(e.target.value as BinType)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="general">General Waste</option>
                    <option value="organic">Organic / Compost</option>
                    <option value="recyclable">Dry Recyclables</option>
                    <option value="hazardous">Hazardous / Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Capacity (Liters)
                  </label>
                  <select
                    value={newBinCapacity}
                    onChange={(e) => setNewBinCapacity(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value={400}>400 L</option>
                    <option value={660}>660 L</option>
                    <option value={1100}>1100 L (Standard Commercial)</option>
                    <option value={1500}>1500 L (Heavy Wholesale)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Municipal Ward Zone
                </label>
                <input
                  type="text"
                  value={newBinWard}
                  onChange={(e) => setNewBinWard(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  Deploy Bin Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
