import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Bin, Complaint, CollectionRoute } from '../../types';
import {
  Layers,
  Filter,
  AlertTriangle,
  Trash2,
  Navigation,
  Compass,
  MapPin,
  Clock,
  User,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface InteractiveMapProps {
  onLocationSelect?: (lat: number, lng: number, addressHint?: string) => void;
  selectionMode?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
  highlightRouteId?: string;
  focusBinId?: string;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onLocationSelect,
  selectionMode = false,
  selectedLocation = null,
  highlightRouteId,
  focusBinId,
  height = 'calc(100vh - 120px)',
}) => {
  const { bins, complaints, routes, currentUser, setSelectedComplaintForDetail, setIsReportModalOpen } =
    useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'all' | 'overflowing' | 'high_priority' | 'unresolved' | 'routes'>('all');
  const [selectedItem, setSelectedItem] = useState<{ type: 'bin' | 'complaint'; data: any } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on central municipal area (12.9716, 77.5946)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle map click for location selection
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelect) {
        onLocationSelect(Number(lat.toFixed(5)), Number(lng.toFixed(5)));
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update selection marker if in selection mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (selectedLocation) {
      const pinIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `<div style="background-color: #2563eb; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      tempMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: pinIcon,
      }).addTo(map);

      map.panTo([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  // Render markers and routes whenever bins/complaints/routes/filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;

    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    // 1. Render Bins
    bins.forEach((bin) => {
      if (activeFilter === 'overflowing' && bin.status !== 'overflowing') return;
      if (activeFilter === 'high_priority' && bin.currentFillPercent < 85) return;

      const isOverflowing = bin.status === 'overflowing';
      const isFull = bin.status === 'full';
      const isDamaged = bin.status === 'damaged';

      let bgColor = '#10b981'; // Green
      if (isOverflowing) bgColor = '#ef4444'; // Red
      else if (isFull) bgColor = '#f59e0b'; // Amber
      else if (bin.currentFillPercent >= 50) bgColor = '#3b82f6'; // Blue
      else if (isDamaged) bgColor = '#6b7280'; // Gray

      const binMarkerIcon = L.divIcon({
        className: `custom-bin-marker ${isOverflowing ? 'pulse-urgent' : ''}`,
        html: `<div style="background-color: ${bgColor}; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid white; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
                 <span>${bin.currentFillPercent}%</span>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([bin.latitude, bin.longitude], { icon: binMarkerIcon });

      marker.on('click', () => {
        setSelectedItem({ type: 'bin', data: bin });
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <b style="font-size: 14px; color: #0f172a;">Bin ${bin.binNumber}</b>
            <span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${bgColor}20; color: ${bgColor};">
              ${bin.status.toUpperCase()} (${bin.currentFillPercent}%)
            </span>
          </div>
          <div style="color: #475569; margin-bottom: 4px;">📍 ${bin.address}</div>
          <div style="color: #64748b; font-size: 11px;">Zone: ${bin.wardZone}</div>
          <div style="color: #64748b; font-size: 11px;">Capacity: ${bin.capacityLiters} L · Type: ${bin.binType}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Temp: ${bin.temperatureCelsius}°C · Battery: ${bin.batteryLevelPercent}%</div>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // 2. Render Complaints
    complaints.forEach((cmp) => {
      if (activeFilter === 'overflowing' && cmp.category !== 'overflowing_bin') return;
      if (activeFilter === 'high_priority' && cmp.priority !== 'critical' && cmp.priority !== 'high')
        return;
      if (activeFilter === 'unresolved' && (cmp.status === 'resolved' || cmp.status === 'rejected'))
        return;

      const isResolved = cmp.status === 'resolved';
      const isCritical = cmp.priority === 'critical';

      let pinColor = '#f97316'; // Orange default
      if (isResolved) pinColor = '#10b981';
      else if (isCritical) pinColor = '#dc2626';
      else if (cmp.priority === 'high') pinColor = '#ea580c';

      const cmpIcon = L.divIcon({
        className: 'custom-complaint-marker',
        html: `<div style="background-color: ${pinColor}; width: 26px; height: 26px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); font-weight: bold; font-size: 11px;">
                 !
               </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([cmp.latitude, cmp.longitude], { icon: cmpIcon });

      marker.on('click', () => {
        setSelectedItem({ type: 'complaint', data: cmp });
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <b style="color: #0f172a;">${cmp.complaintNumber}</b>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${pinColor};">
              ${cmp.priority}
            </span>
          </div>
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${cmp.category.replace('_', ' ')}</div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">📍 ${cmp.address}</div>
          <div style="color: #64748b; font-size: 11px;">Status: <b>${cmp.status.replace('_', ' ').toUpperCase()}</b></div>
          ${cmp.assignedWorkerName ? `<div style="color: #0284c7; font-size: 11px; margin-top: 3px;">🚛 Driver: ${cmp.assignedWorkerName}</div>` : ''}
          <div style="margin-top: 6px; font-size: 11px; color: #475569; background: #f8fafc; padding: 4px; border-radius: 4px;">
            ${cmp.priorityReason}
          </div>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // 3. Render Active Routes and Polylines
    routes.forEach((route) => {
      if (highlightRouteId && route.id !== highlightRouteId) return;

      const routeColor = '#4f46e5'; // Indigo

      // Depot Marker
      const depotIcon = L.divIcon({
        className: 'custom-depot-marker',
        html: `<div style="background-color: #1e1b4b; width: 28px; height: 28px; border-radius: 8px; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
                 HQ
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const depotMarker = L.marker([route.depot.latitude, route.depot.longitude], {
        icon: depotIcon,
      }).bindPopup(`<b>Depot:</b> ${route.depot.name}<br/>Vehicle: ${route.vehicleNumber}`);
      routeLayer.addLayer(depotMarker);

      // Connect stops with line: Depot -> Stop 1 -> Stop 2 -> ... -> Depot
      const latlngs: [number, number][] = [
        [route.depot.latitude, route.depot.longitude],
        ...route.stops.map((s) => [s.latitude, s.longitude] as [number, number]),
        [route.depot.latitude, route.depot.longitude],
      ];

      const polyline = L.polyline(latlngs, {
        color: routeColor,
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 6',
      });
      routeLayer.addLayer(polyline);

      // Stop number markers
      route.stops.forEach((stop) => {
        const isDone = stop.status === 'collected';
        const stopBadgeIcon = L.divIcon({
          className: 'custom-stop-badge',
          html: `<div style="background-color: ${isDone ? '#10b981' : '#4f46e5'}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">
                   ${stop.stopNumber}
                 </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const stopMarker = L.marker([stop.latitude, stop.longitude], { icon: stopBadgeIcon });
        stopMarker.bindPopup(`
          <div style="font-size: 12px;">
            <b>Stop #${stop.stopNumber}</b> (${stop.status.toUpperCase()})<br/>
            📍 ${stop.address}<br/>
            ${stop.fillPercent ? `Fill: ${stop.fillPercent}%` : ''}
          </div>
        `);
        routeLayer.addLayer(stopMarker);
      });
    });

    // Focus on specific bin if requested
    if (focusBinId) {
      const targetBin = bins.find((b) => b.id === focusBinId);
      if (targetBin) {
        map.setView([targetBin.latitude, targetBin.longitude], 16);
      }
    }
  }, [bins, complaints, routes, activeFilter, highlightRouteId, focusBinId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      {/* Map Filter Controls Bar */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-24px)]">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          Filter:
        </span>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Nodes
        </button>
        <button
          onClick={() => setActiveFilter('overflowing')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
            activeFilter === 'overflowing'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚠️ Overflowing Bins
        </button>
        <button
          onClick={() => setActiveFilter('high_priority')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
            activeFilter === 'high_priority'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Critical Complaints
        </button>
        <button
          onClick={() => setActiveFilter('unresolved')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
            activeFilter === 'unresolved'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unresolved
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-slate-200 hidden sm:block text-xs">
        <div className="font-semibold text-slate-800 mb-1 text-[11px] uppercase tracking-wide">
          Map Legend
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Bin Normal (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Bin Full (80-89%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Overflowing (&gt;90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-orange-500" />
            <span>Citizen Report (!)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-900" />
            <span>Depot Yard (HQ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 border-t-2 border-dashed border-indigo-600 inline-block" />
            <span>2-Opt Route Path</span>
          </div>
        </div>
      </div>

      {/* Selection Mode Guide Overlay */}
      {selectionMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-indigo-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <MapPin className="w-4 h-4 text-amber-300" />
          <span>Click anywhere on the map to place the complaint pin</span>
        </div>
      )}

      {/* Selected Item Drawer (Right side) */}
      {selectedItem && (
        <div className="absolute top-3 right-3 bottom-3 z-[1000] w-80 bg-white/98 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 p-4 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selectedItem.type === 'bin' ? 'Smart Bin Details' : 'Complaint Dossier'}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 text-xs p-1"
              >
                ✕
              </button>
            </div>

            {selectedItem.type === 'bin' && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">
                    Bin {selectedItem.data.binNumber}
                  </h4>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      selectedItem.data.status === 'overflowing'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedItem.data.status.toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Fill Level (IoT Sensor)</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedItem.data.currentFillPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedItem.data.currentFillPercent >= 90
                          ? 'bg-rose-500'
                          : selectedItem.data.currentFillPercent >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedItem.data.currentFillPercent}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600">
                  <p>
                    <b className="text-slate-700">Location:</b> {selectedItem.data.address}
                  </p>
                  <p>
                    <b className="text-slate-700">Ward:</b> {selectedItem.data.wardZone}
                  </p>
                  <p>
                    <b className="text-slate-700">Capacity:</b> {selectedItem.data.capacityLiters} L
                  </p>
                  <p>
                    <b className="text-slate-700">Type:</b> {selectedItem.data.binType}
                  </p>
                  <p>
                    <b className="text-slate-700">Battery:</b> {selectedItem.data.batteryLevelPercent}%
                  </p>
                  <p>
                    <b className="text-slate-700">Internal Temp:</b> {selectedItem.data.temperatureCelsius}°C
                  </p>
                  <p>
                    <b className="text-slate-700">Last Collection:</b> {selectedItem.data.lastCollectionTime}
                  </p>
                </div>
              </div>
            )}

            {selectedItem.type === 'complaint' && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedItem.data.complaintNumber}
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                    {selectedItem.data.priority}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800">
                  {selectedItem.data.category.replace('_', ' ').toUpperCase()}
                </p>

                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  "{selectedItem.data.description}"
                </p>

                <div className="text-xs space-y-1.5 text-slate-600">
                  <p>
                    <b className="text-slate-700">Address:</b> {selectedItem.data.address}
                  </p>
                  <p>
                    <b className="text-slate-700">Reported By:</b> {selectedItem.data.citizenName}
                  </p>
                  <p>
                    <b className="text-slate-700">Status:</b>{' '}
                    <span className="font-semibold text-indigo-700">
                      {selectedItem.data.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  {selectedItem.data.assignedWorkerName && (
                    <p>
                      <b className="text-slate-700">Assigned Driver:</b>{' '}
                      {selectedItem.data.assignedWorkerName}
                    </p>
                  )}
                  <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    <span className="font-bold">Priority Factor:</span> {selectedItem.data.priorityReason}
                  </div>
                </div>

                {selectedItem.data.imageUrl && (
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold text-slate-500">Citizen Photo:</span>
                    <img
                      src={selectedItem.data.imageUrl}
                      alt="Complaint attachment"
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover rounded-lg mt-1 border border-slate-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            {selectedItem.type === 'complaint' && (
              <button
                onClick={() => {
                  setSelectedComplaintForDetail(selectedItem.data);
                  setSelectedItem(null);
                }}
                className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold text-center transition-colors"
              >
                Inspect Timeline
              </button>
            )}
            {selectedItem.type === 'bin' && currentUser.role === 'citizen' && (
              <button
                onClick={() => {
                  setIsReportModalOpen(true);
                  setSelectedItem(null);
                }}
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold text-center transition-colors"
              >
                Report Issue Here
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
