import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Check,
  Copy,
  Cpu,
  Database,
  FileCode,
  FolderTree,
  GitBranch,
  HelpCircle,
  Layers,
  Network,
  Route,
  Server,
  Shield,
  Terminal,
  X,
} from 'lucide-react';

export const ArchitectureDocsModal: React.FC = () => {
  const { isDocsModalOpen, setIsDocsModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<
    'system_arch' | 'db_schema' | 'algorithms' | 'api_spec' | 'interview_guide' | 'docker_git'
  >('system_arch');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isDocsModalOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
              CSE
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>SmartWaste — System Engineering &amp; Portfolio Dossier</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                  3rd Year CSE Spec
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Architectural blueprints, ER diagrams, 2-Opt TSP algorithm math, REST API contracts &amp; interview defense.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDocsModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto shrink-0 py-2">
          {[
            { id: 'system_arch', label: '1. System Architecture', icon: Network },
            { id: 'db_schema', label: '2. PostgreSQL ER Schema', icon: Database },
            { id: 'algorithms', label: '3. 2-Opt & Priority Math', icon: Route },
            { id: 'api_spec', label: '4. REST API Endpoints', icon: Server },
            { id: 'interview_guide', label: '5. Interview Q&A Defense', icon: HelpCircle },
            { id: 'docker_git', label: '6. Repo & Docker Plan', icon: GitBranch },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
          {/* TAB 1: SYSTEM ARCHITECTURE */}
          {activeTab === 'system_arch' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-[11px] leading-snug overflow-x-auto">
                <pre>{`========================================================================================
                          SMARTWASTE — SYSTEM ARCHITECTURE
========================================================================================

  [CITIZEN PORTAL]             [MUNICIPAL ADMIN COMMAND]          [DRIVER COCKPIT]
 (Web/Mobile Browser)           (Desktop Ops Console)            (In-Truck Tablet/PWA)
         |                                |                               |
         | HTTPS/JSON                     | HTTPS/JSON                    | HTTPS/JSON
         v                                v                               v
+--------------------------------------------------------------------------------------+
|                               API GATEWAY / REVERSE PROXY                            |
|                          (TLS Termination, Rate Limiting, CORS)                      |
+--------------------------------------------------------------------------------------+
                                          |
                                          v
+--------------------------------------------------------------------------------------+
|                                BACKEND APPLICATION SERVER                            |
|                       (Node.js / Express or Python / FastAPI)                        |
|                                                                                      |
|  +-------------------+  +--------------------+  +---------------------------------+  |
|  |   Auth & RBAC     |  | Priority Engine    |  |  Route Optimization Engine      |  |
|  | (JWT, Bcrypt,     |  | (Dynamic scoring,  |  |  (Haversine Distance, Nearest   |  |
|  |  Role Middleware) |  |  Duplicate Check)  |  |   Neighbor, 2-Opt Local Search)|  |
|  +-------------------+  +--------------------+  +---------------------------------+  |
|                                                                                      |
|  +-------------------+  +--------------------+  +---------------------------------+  |
|  | Complaint Lifecycle|  | IoT Telemetry      |  |  Analytics & Reporting Module   |  |
|  | (Submit->Review-> |  | (Ultrasonic level  |  |  (SLA Trends, Ward Hotspots,    |  |
|  |  Assign->Resolve) |  |  threshold alarms) |  |   Fuel & Emission Savings)      |  |
|  +-------------------+  +--------------------+  +---------------------------------+  |
+--------------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
+------------------------------------+             +-----------------------------------+
|     POSTGRESQL RELATIONAL DB       |             |         OBJECT STORAGE            |
| (ACID compliance, PostGIS spatial  |             | (Encrypted images: citizen photos |
|  indexing, normalized tables)      |             |  & driver resolution proofs)      |
+------------------------------------+             +-----------------------------------+`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Technology Choices Justification</h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                    <li>
                      <b>PostgreSQL:</b> Relational ACID guarantees ensure no lost complaint tickets or duplicate status collisions. Geometry/spatial indexing allows sub-millisecond Haversine proximity queries.
                    </li>
                    <li>
                      <b>Leaflet + OpenStreetMap:</b> Zero vendor lock-in, zero paid tile API keys, low latency vector rendering with lightweight DOM marker clustering.
                    </li>
                    <li>
                      <b>2-Opt Heuristic:</b> Solves NP-hard Traveling Salesperson Problem (TSP) in polynomial time ($O(n^2)$) suitable for real-time dispatch calculations without requiring heavy external routing servers.
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Real-World Municipal Data Pipeline</h4>
                  <ol className="space-y-1.5 list-decimal pl-4 text-slate-600">
                    <li><b>Citizen Input:</b> Citizen reports overflowing bin; client requests GPS permission and validates file size (&lt;5MB).</li>
                    <li><b>Proximity De-duplication:</b> Server executes radial check (&lt;75m) to flag existing tickets.</li>
                    <li><b>Priority Calculation:</b> Score dynamically computed from bin fill %, age, nearby complaints, and public safety severity.</li>
                    <li><b>2-Opt Optimization:</b> Admin groups open stops and executes 2-opt edge-swap heuristic to minimize truck travel distance.</li>
                    <li><b>Driver Resolution:</b> Driver inspects turn-by-turn waypoints, marks collected, and uploads photo proof.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE SCHEMA & DDL */}
          {activeTab === 'db_schema' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">
                  Production PostgreSQL DDL Script (Normalized 3NF)
                </h3>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `-- SmartWaste Production PostgreSQL DDL Schema...`,
                      'ddl'
                    )
                  }
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSection === 'ddl' ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-96">
                <pre>{`-- 1. ROLES & USERS
CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'worker');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'citizen',
    ward_zone VARCHAR(100),
    vehicle_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role ON users(role);

-- 2. SMART BINS
CREATE TYPE bin_type AS ENUM ('general', 'organic', 'recyclable', 'hazardous');
CREATE TYPE bin_status AS ENUM ('normal', 'filling', 'full', 'overflowing', 'damaged', 'maintenance');

CREATE TABLE bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_number VARCHAR(50) UNIQUE NOT NULL,
    bin_type bin_type NOT NULL DEFAULT 'general',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    ward_zone VARCHAR(100) NOT NULL,
    capacity_liters INTEGER NOT NULL DEFAULT 1100,
    current_fill_percent INTEGER NOT NULL DEFAULT 0 CHECK (current_fill_percent BETWEEN 0 AND 100),
    status bin_status NOT NULL DEFAULT 'normal',
    battery_level_percent INTEGER DEFAULT 100,
    temperature_celsius NUMERIC(4, 1) DEFAULT 25.0,
    last_collection_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bins_coords ON bins(latitude, longitude);
CREATE INDEX idx_bins_fill ON bins(current_fill_percent);

-- 3. COMPLAINTS & GRIEVANCES
CREATE TYPE complaint_status AS ENUM ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened');
CREATE TYPE complaint_urgency AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number VARCHAR(50) UNIQUE NOT NULL,
    citizen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    ward_zone VARCHAR(100) NOT NULL,
    bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
    priority complaint_urgency NOT NULL DEFAULT 'medium',
    priority_score INTEGER NOT NULL DEFAULT 50,
    priority_reason TEXT,
    status complaint_status NOT NULL DEFAULT 'submitted',
    assigned_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_route_id UUID,
    resolution_time TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    worker_notes TEXT,
    proof_image_url TEXT,
    duplicate_of_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_complaints_coords ON complaints(latitude, longitude);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority_score DESC);

-- 4. COLLECTION ROUTES & STOPS
CREATE TABLE collection_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_code VARCHAR(50) UNIQUE NOT NULL,
    worker_id UUID NOT NULL REFERENCES users(id),
    vehicle_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned',
    depot_name VARCHAR(100) NOT NULL,
    depot_lat DOUBLE PRECISION NOT NULL,
    depot_lng DOUBLE PRECISION NOT NULL,
    original_distance_km NUMERIC(6, 2) NOT NULL,
    optimized_distance_km NUMERIC(6, 2) NOT NULL,
    distance_saved_km NUMERIC(6, 2) NOT NULL,
    estimated_duration_min INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES collection_routes(id) ON DELETE CASCADE,
    stop_number INTEGER NOT NULL,
    bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
    complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    collected_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    proof_image_url TEXT,
    UNIQUE(route_id, stop_number)
);`}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: ALGORITHM DESIGN */}
          {activeTab === 'algorithms' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-2">
                <h4 className="font-bold text-indigo-900 text-sm">
                  1. Haversine Great-Circle Distance Formula
                </h4>
                <p className="text-indigo-800">
                  Calculates the shortest surface distance between two geographic coordinates on a sphere:
                </p>
                <div className="bg-white p-3 rounded-lg font-mono text-xs text-slate-800 border border-indigo-100">
                  d = 2R · arcsin( √( sin²(Δφ/2) + cos(φ₁) · cos(φ₂) · sin²(Δλ/2) ) )
                  <br />
                  <span className="text-[11px] text-slate-500">
                    Where R = 6,371 km (Earth radius), φ = latitude in radians, λ = longitude in radians.
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm">
                  2. 2-Opt Local Search Heuristic for Route Optimization
                </h4>
                <p className="text-emerald-800">
                  The Traveling Salesperson Problem is NP-hard. 2-Opt begins with a Nearest Neighbor initial tour, then tests edge swaps (i, i+1) and (k, k+1) to eliminate crossing paths.
                </p>
                <div className="bg-white p-3 rounded-lg font-mono text-[11px] text-slate-800 border border-emerald-100">
                  {`Algorithm: 2-Opt Optimization
Input: Initial tour T, Depot D
Repeat:
  improved = false
  For i = 0 to length(T) - 2:
    For k = i + 1 to length(T) - 1:
      newTour = 2OptSwap(T, i, k)  // reverses subroute T[i..k]
      if distance(newTour) < distance(T) - ε:
        T = newTour
        improved = true
Until not improved

Time Complexity: Worst case O(n²), with average run-time < 50ms for n <= 30 municipal stops.`}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-900 text-sm">
                  3. Dynamic Priority Evaluation Function
                </h4>
                <p className="text-amber-800">
                  Score = W_nearby · f(count_150m) + W_fill · (fill% / 100) + W_urgency · f(urgency) + Category_Hazard
                </p>
                <p className="text-[11px] text-amber-900">
                  This transparent mathematical formulation explains directly to citizens and admins <i>why</i> a ticket received a high/critical priority rating.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: REST API SPECIFICATION */}
          {activeTab === 'api_spec' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                RESTful API Contracts (OpenAPI Specification)
              </h3>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {[
                  {
                    method: 'POST',
                    path: '/api/auth/register',
                    desc: 'Register citizen, validate inputs, hash password with Bcrypt',
                    auth: 'Public',
                  },
                  {
                    method: 'POST',
                    path: '/api/auth/login',
                    desc: 'Authenticate user, issue signed JSON Web Token (JWT)',
                    auth: 'Public',
                  },
                  {
                    method: 'GET',
                    path: '/api/complaints',
                    desc: 'List complaints (Role-filtered: Citizens see own, Admin sees all, pagination support)',
                    auth: 'JWT (Citizen/Admin)',
                  },
                  {
                    method: 'POST',
                    path: '/api/complaints',
                    desc: 'Submit grievance, run duplicate detector, calculate dynamic priority',
                    auth: 'JWT (Citizen)',
                  },
                  {
                    method: 'PUT',
                    path: '/api/complaints/:id/status',
                    desc: 'Transition ticket state (under_review, in_progress, resolved, rejected)',
                    auth: 'JWT (Admin/Worker)',
                  },
                  {
                    method: 'POST',
                    path: '/api/routes/optimize',
                    desc: 'Accepts stops & depot, runs 2-Opt heuristic, returns distance savings & sequence',
                    auth: 'JWT (Admin)',
                  },
                  {
                    method: 'POST',
                    path: '/api/sensors/bin/:bin_id',
                    desc: 'Ingests IoT ultrasonic fill-level, temperature, and battery telemetry',
                    auth: 'API Key / HMAC',
                  },
                ].map((ep, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="font-mono font-semibold text-slate-800">{ep.path}</code>
                      <span className="text-slate-500 hidden sm:inline">{ep.desc}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{ep.auth}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INTERVIEW DEFENSE GUIDE */}
          {activeTab === 'interview_guide' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Technical Interview Defense: Questions &amp; Answers
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Q: "What real-world problem does your project solve?"
                  </h4>
                  <p className="text-slate-600 text-xs">
                    <b>Answer:</b> Municipal waste collection currently operates on static, rigid schedules regardless of whether bins are empty or overflowing. SmartWaste transitions municipalities from blind scheduled collection to data-driven, demand-responsive collection by integrating citizen reporting, automated IoT fill thresholds, and 2-Opt route optimization, reducing truck fuel consumption and eliminating public health hazards.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Q: "How does your route optimization work? Why not just sort by Lat/Lng?"
                  </h4>
                  <p className="text-slate-600 text-xs">
                    <b>Answer:</b> Sorting coordinates by latitude or longitude fails because urban geography is two-dimensional and often circular. The collection routing problem is modeled as a Traveling Salesperson Problem (TSP). We calculate true great-circle distances using the Haversine formula, generate an initial feasible tour using a Nearest Neighbor greedy heuristic, and then apply 2-Opt local search to systematically untangle crossing path segments until no 2-edge swap improves total distance.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Q: "What happens when two users report the exact same overflowing bin?"
                  </h4>
                  <p className="text-slate-600 text-xs">
                    <b>Answer:</b> We implemented a spatial Duplicate Complaint Detector. When a citizen submits a report, the server queries active unresolved complaints within a 75-meter radius with matching categories. The citizen is shown a non-blocking alert that an active ticket already exists, but can still submit to confirm severity. Multiple reports in the same radius dynamically increment the priority score of that location.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Q: "What are the limitations of your system and what would you improve at city scale?"
                  </h4>
                  <p className="text-slate-600 text-xs">
                    <b>Answer:</b> At city scale with hundreds of trucks, we would upgrade from pure TSP to Capacitated Vehicle Routing Problem (CVRP) with time windows (VRPTW), incorporate OpenStreetMap OSRM road graph network routing (accounting for one-way streets and real-time traffic), and deploy LoRaWAN sensor nodes with deep-sleep power management.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCKER & GITHUB PLAN */}
          {activeTab === 'docker_git' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Production Docker Compose &amp; Repository Layout
              </h3>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto">
                <pre>{`version: '3.8'

services:
  database:
    image: postgres:16-alpine
    container_name: smartwaste_db
    environment:
      POSTGRES_DB: smartwaste_db
      POSTGRES_USER: smartwaste_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  api_backend:
    build: ./backend
    container_name: smartwaste_api
    depends_on:
      - database
    environment:
      DATABASE_URL: postgresql://smartwaste_admin:\${DB_PASSWORD}@database:5432/smartwaste_db
      JWT_SECRET: \${JWT_SECRET}
    ports:
      - "8000:8000"

  frontend_app:
    build: ./frontend
    container_name: smartwaste_web
    ports:
      - "3000:3000"
    depends_on:
      - api_backend

volumes:
  postgres_data:`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">
            SmartWaste Architecture Spec v2.4 · Prepared for Tech Placements &amp; Internships
          </span>
          <button
            onClick={() => setIsDocsModalOpen(false)}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
