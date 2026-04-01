import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  HomeIcon, Plus, DollarSign, Settings, LayoutGrid, Bell, Search,
  ChevronDown, Package, Tag, Box, Factory, Users, FileText,
  FolderOpen, X
} from "lucide-react";

/* ------------------ NAV CONFIG ------------------ */

const primaryNav = [
  { icon: HomeIcon, to: "/dashboard", label: "Home" },
  { icon: Plus, to: "/orders/add", label: "New" },
  { icon: DollarSign, to: "/orders", label: "Orders" },
  { icon: FolderOpen, label: "Master", isMaster: true },
];

const masterNav = [
  { icon: Package, to: "/masters/products", label: "Products" },
  { icon: Tag, to: "/masters/productcategories", label: "Product Categories" },
  { icon: Box, to: "/masters/uomcategories", label: "UOM Categories" },
  { icon: Factory, to: "/masters/manufacturers", label: "Manufacturers" },
  { icon: Users, to: "/masters/partners", label: "Partners" },
  { icon: FileText, to: "/masters/project", label: "Project Numbers" },
  { icon: FileText, to: "/masters/bom", label: "BOM" },
];

/* ------------------ PRIMARY SIDEBAR ------------------ */

function PrimarySidebar({ masterOpen, setMasterOpen }) {
  const location = useLocation();

  const isMasterRoute = location.pathname.startsWith("/masters");

  return (
    <aside className="w-14 bg-[#2c2c2c] flex flex-col items-center py-2 gap-1 h-full">
      {primaryNav.map((item, i) =>
        item.isMaster ? (
          <button
            key={i}
            onClick={() => setMasterOpen(!masterOpen)}
            title={item.label}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition
              ${
                masterOpen || isMasterRoute
                  ? "bg-[#017e84] text-white"
                  : "text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200"
              }`}
          >
            <item.icon size={17} />
          </button>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              `w-10 h-10 flex items-center justify-center rounded-md transition ${
                isActive
                  ? "bg-[#017e84] text-white"
                  : "text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200"
              }`
            }
          >
            <item.icon size={17} />
          </NavLink>
        )
      )}

      <div className="flex-1" />

      <div className="w-8 h-8 rounded-full bg-[#e8a825] flex items-center justify-center text-xs font-bold text-white mb-2">
        JD
      </div>

      <button className="w-10 h-10 flex items-center justify-center rounded-md text-gray-400 hover:bg-[#3a3a3a]">
        <LayoutGrid size={17} />
      </button>

      <button className="w-10 h-10 flex items-center justify-center rounded-md text-gray-400 hover:bg-[#3a3a3a]">
        <Settings size={17} />
      </button>
    </aside>
  );
}

/* ------------------ SECONDARY SIDEBAR ------------------ */

function SecondarySidebar({ open, onClose }) {
  const location = useLocation();
  const isMasterRoute = location.pathname.startsWith("/masters");

  if (!open && !isMasterRoute) return null;

  return (
    <aside className="w-64 bg-[#2c2c2c] flex flex-col h-full border-l border-gray-700 shadow-lg">
      
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 text-white text-sm font-semibold border-b border-gray-700">
        <span>Master Data</span>
        {!isMasterRoute && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-2">
        {masterNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm transition ${
                isActive
                  ? "bg-[#017e84] text-white"
                  : "text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

/* ------------------ TOPBAR ------------------ */

function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const parts = location.pathname.split("/").filter(Boolean);

  const crumbs = parts.map((part, i) => {
    const path = "/" + parts.slice(0, i + 1).join("/");
    const label =
      part.startsWith("MO-")
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    return { label, path };
  });

  return (
    <header className="h-11 bg-white border-b flex items-center px-4 gap-3">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm flex-1">
        {crumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="text-gray-700 font-medium">
                {crumb.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(crumb.path)}
                className="text-[#017e84] hover:underline"
              >
                {crumb.label}
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-1 border rounded px-2 py-1 w-48">
        <Search size={12} className="text-gray-400" />
        <input
          placeholder="Search..."
          className="text-xs bg-transparent outline-none w-full"
        />
      </div>

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
        <Bell size={15} className="text-gray-500" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      {/* Profile */}
      <button className="flex items-center gap-1 text-xs border px-2 py-1 rounded">
        <div className="w-5 h-5 rounded-full bg-[#e8a825] flex items-center justify-center text-white text-xs">
          JD
        </div>
        <span>John Doe</span>
        <ChevronDown size={11} />
      </button>
    </header>
  );
}

/* ------------------ MAIN LAYOUT ------------------ */

export default function Layout() {
  const location = useLocation();
  const [masterOpen, setMasterOpen] = useState(false);

  const isMasterRoute = location.pathname.startsWith("/masters");

  useEffect(() => {
    if (isMasterRoute) {
      setMasterOpen(true);
    }
  }, [isMasterRoute]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <PrimarySidebar
        masterOpen={masterOpen}
        setMasterOpen={setMasterOpen}
      />

      <SecondarySidebar
        open={masterOpen}
        onClose={() => setMasterOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}