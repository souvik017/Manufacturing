import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Package, CheckSquare,
  BarChart2, Settings, Bell, Search, ChevronDown,
  Zap, Users, Truck,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: ClipboardList,   label: "Orders",    to: "/orders"    },
  { icon: Package,         label: "Inventory", to: "/inventory" },
  { icon: Truck,           label: "Delivery",  to: "/delivery"  },
  { icon: CheckSquare,     label: "Quality",   to: "/quality"   },
  { icon: BarChart2,       label: "Reports",   to: "/reports"   },
  { icon: Users,           label: "Team",      to: "/team"      },
];

function Sidebar() {
  return (
    <aside className="w-[12vw] bg-gray-900 flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-white font-bold text-sm tracking-wide">ManufactureOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${
                isActive
                  ? "bg-violet-600 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-gray-800">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
        >
          <Settings size={16} />
          Settings
        </NavLink>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            JD
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-200 font-medium truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">Engineer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const location = useLocation();
  const navigate  = useNavigate();

  const parts  = location.pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, i) => {
    const path  = "/" + parts.slice(0, i + 1).join("/");
    const label = part.startsWith("MO-")
      ? part
      : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    return { label, path };
  });

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        {crumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-gray-300">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="text-gray-800 font-medium truncate">{crumb.label}</span>
            ) : (
              <button
                onClick={() => navigate(crumb.path)}
                className="text-gray-400 hover:text-gray-600 truncate transition-colors"
              >
                {crumb.label}
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 w-56 bg-gray-50">
        <Search size={13} className="text-gray-400" />
        <input
          placeholder="Search orders..."
          className="text-xs bg-transparent focus:outline-none text-gray-600 placeholder-gray-400 w-full"
        />
      </div>

      {/* Bell */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
        <Bell size={16} className="text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User */}
      <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
          JD
        </div>
        <span className="text-xs text-gray-700 font-medium">John Doe</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>
    </header>
  );
}

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        {/* main fills remaining height; orders pages manage their own scroll internally */}
        <main className="flex-1 overflow-hidden min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
