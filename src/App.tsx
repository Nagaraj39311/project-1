import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { CitizenDashboard } from './components/CitizenPortal/CitizenDashboard';
import { ComplaintModal } from './components/CitizenPortal/ComplaintModal';
import { ComplaintDetailModal } from './components/CitizenPortal/ComplaintDetailModal';
import { RouteOptimizer } from './components/AdminPortal/RouteOptimizer';
import { SmartBinSimulator } from './components/AdminPortal/SmartBinSimulator';
import { ComplaintsManager } from './components/AdminPortal/ComplaintsManager';
import { AnalyticsStudio } from './components/AdminPortal/AnalyticsStudio';
import { WorkerDashboard } from './components/WorkerPortal/WorkerDashboard';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';

const MainContent: React.FC = () => {
  const { currentView, currentUser } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {currentView === 'dashboard' && (
        <>
          {currentUser.role === 'citizen' && <CitizenDashboard />}
          {currentUser.role === 'admin' && <AdminDashboard />}
          {currentUser.role === 'worker' && <WorkerDashboard />}
        </>
      )}

      {currentView === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Interactive Municipal Map Explorer
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Live OpenStreetMap Engine with IoT Telemetry Markers
            </span>
          </div>
          <InteractiveMap height="calc(100vh - 180px)" />
        </div>
      )}

      {currentView === 'my_complaints' && <CitizenDashboard />}

      {currentView === 'complaints' && <ComplaintsManager />}

      {currentView === 'routes' && <RouteOptimizer />}

      {currentView === 'bins' && <SmartBinSimulator />}

      {currentView === 'analytics' && <AnalyticsStudio />}

      {currentView === 'my_route' && <WorkerDashboard />}
    </main>
  );
};

// Need AdminDashboard import inside main scope
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <ComplaintModal />
        <ComplaintDetailModal />
        <ArchitectureDocsModal />

        {/* Clean, quiet, anti-slop footer adhering to Universal Design Constitution */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">SmartWaste</span>
              <span>·</span>
              <span>Municipal Smart Waste Collection &amp; Dispatch ERP</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Haversine / 2-Opt Routing Engine</span>
              <span>·</span>
              <span>Privacy-by-Design Spatial Aggregation</span>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
