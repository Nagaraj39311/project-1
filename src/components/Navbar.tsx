import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Bell,
  CheckCircle,
  FileCode,
  MapPin,
  Menu,
  Shield,
  Trash2,
  Truck,
  User,
  X,
  PlusCircle,
  BarChart3,
  Cpu,
  Route,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    currentView,
    setCurrentView,
    setIsReportModalOpen,
    setIsDocsModalOpen,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter notifications for current user role or 'all'
  const visibleNotifications = notifications.filter(
    (n) => n.recipientRole === 'all' || n.recipientRole === currentUser.role
  );
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const roleColors = {
    citizen: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    admin: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    worker: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const roleLabels = {
    citizen: 'Citizen Portal',
    admin: 'Municipal Admin Command',
    worker: 'Collection Crew / Driver',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Element */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                SmartWaste
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                Civic ERP
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links based on active role */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>

          {currentUser.role === 'citizen' && (
            <>
              <button
                onClick={() => setCurrentView('my_complaints')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'my_complaints'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Reports
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'map'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                City Bins Map
              </button>
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setCurrentView('map')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'map'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Operations Map
              </button>
              <button
                onClick={() => setCurrentView('complaints')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'complaints'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Complaints Queue
              </button>
              <button
                onClick={() => setCurrentView('routes')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'routes'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                2-Opt Routing
              </button>
              <button
                onClick={() => setCurrentView('bins')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'bins'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Bins &amp; IoT
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'analytics'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Analytics
              </button>
            </>
          )}

          {currentUser.role === 'worker' && (
            <>
              <button
                onClick={() => setCurrentView('my_route')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'my_route'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Assigned Stops
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === 'map'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Live Navigation
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Action button: citizen gets Report Bin, admin gets New Route */}
          {currentUser.role === 'citizen' && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Bin</span>
            </button>
          )}

          {/* Quick CSE Architecture / Docs trigger */}
          <button
            onClick={() => setIsDocsModalOpen(true)}
            title="View CSE Project Architecture, Algorithms & ER Schema"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors whitespace-nowrap"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">CSE Architecture</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <select
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition-colors ${roleColors[currentUser.role]}`}
            >
              <option value="citizen">👤 Citizen: Ananya</option>
              <option value="admin">🏛️ Admin: Rajesh (Officer)</option>
              <option value="worker">🚛 Driver: Vikram</option>
            </select>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      Notifications
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {unreadCount} unread
                    </span>
                  </div>
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-1">
                  {visibleNotifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications right now
                    </div>
                  ) : (
                    visibleNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                          n.read ? 'bg-transparent' : 'bg-slate-50/80 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
          <div className="px-2 py-1 text-xs text-slate-500">
            Active: <span className="font-semibold text-slate-800">{roleLabels[currentUser.role]}</span>
          </div>
          <button
            onClick={() => {
              setCurrentView('dashboard');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setCurrentView('map');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
          >
            Interactive Map
          </button>
          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  setCurrentView('complaints');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                Complaints Queue
              </button>
              <button
                onClick={() => {
                  setCurrentView('routes');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                2-Opt Route Optimizer
              </button>
              <button
                onClick={() => {
                  setCurrentView('bins');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                Smart Bins &amp; IoT Simulator
              </button>
              <button
                onClick={() => {
                  setCurrentView('analytics');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                Analytics &amp; Heatmap
              </button>
            </>
          )}
          {currentUser.role === 'worker' && (
            <button
              onClick={() => {
                setCurrentView('my_route');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
            >
              Today's Route &amp; Stops
            </button>
          )}
        </div>
      )}
    </header>
  );
};
