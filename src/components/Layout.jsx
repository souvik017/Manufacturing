// components/Layout.jsx
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Layers,
  PackageSearch,
  LayoutGrid,
  Shapes,
  Scale,
  Factory,
  Handshake,
  Hash,
  BookMarked,
  GitMerge,
  Settings,
  ChevronDown,
  Search,
  ChevronRight,
  LogOut,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

/* ------------------ NAV CONFIG ------------------ */

const primaryNav = [
  // { icon: LayoutDashboard, to: "/dashboard", label: "Home" },
  { icon: Layers, label: "Master", isMaster: true },
  // { icon: PlusCircle, to: "/requisitions/add", label: "New" },
  { icon: ClipboardList, to: "/requisitions", label: "Orders" },
];

const masterNav = [
  { icon: PackageSearch,  to: "/masters/products",          label: "Products"           },
  { icon: LayoutGrid,     to: "/masters/productcategories", label: "Product Categories"  },
  { icon: Shapes,         to: "/masters/producttype",       label: "Product Types"       },
  { icon: Scale,          to: "/masters/uomcategories",     label: "UOM Categories"      },
  { icon: Factory,        to: "/masters/manufacturers",     label: "Manufacturers"       },
  { icon: Handshake,      to: "/masters/partners",          label: "Partners"            },
  { icon: Hash,           to: "/masters/project",           label: "Project Numbers"     },
  { icon: BookMarked,     to: "/masters/hsnlist",           label: "HSN"                 },
  { icon: GitMerge,       to: "/masters/bom",               label: "BOM"                 },
];

const searchablePages = [
  ...primaryNav.filter(i => !i.isMaster && i.to).map(i => ({
    label: i.label,
    path: i.to,
    icon: i.icon,
  })),
  ...masterNav.map(i => ({
    label: i.label,
    path: i.to,
    icon: i.icon,
  })),
];

/* ------------------ MASTER DROPDOWN ------------------ */

function MasterDropdown({ anchorRef, onMouseEnter, onMouseLeave }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        top: rect.top,
        left: rect.right + 6,
      });
    }
  }, [anchorRef]);

  return (
    <div
      style={{ ...style, position: "fixed", zIndex: 9999 }}
      className="bg-white rounded-xl shadow-2xl border border-gray-100 w-56 py-2 overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Master Data
        </span>
      </div>
      <div className="border-t border-gray-100 mb-1" />

      {masterNav.map((item) => {
        const isActive =
          location.pathname === item.to ||
          location.pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
              isActive
                ? "bg-[#1A1745] text-white"
                : "text-gray-700 hover:bg-[#f5f0f3] hover:text-[#1A1745]"
            }`}
          >
            <Icon
              size={15}
              className={isActive ? "text-white" : "text-[#1A1745]"}
            />
            <span className="font-medium">{item.label}</span>
            {isActive && <ChevronRight size={13} className="ml-auto" />}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------ PRIMARY SIDEBAR ------------------ */

function PrimarySidebar({ masterOpen, onMasterEnter, onMasterLeave }) {
  const location = useLocation();
  const navigate = useNavigate();  // ✅ FIX: added navigate
  const isMasterRoute = location.pathname.startsWith("/masters");
  const masterBtnRef = useRef(null);

  return (
    <>
      <aside
        className="w-[60px] flex flex-col items-center py-3 gap-1 h-full select-none"
        style={{ backgroundColor: "#1A1745" }}
      >
        {/* Brand mark */}
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3 shadow-inner">
          <span className="text-white font-black text-sm tracking-tight">MR</span>
        </div>

        <div className="w-full px-2 flex flex-col gap-1">
          {primaryNav.map((item, i) =>
            item.isMaster ? (
              <button
                key={i}
                ref={masterBtnRef}
                onMouseEnter={onMasterEnter}
                onMouseLeave={onMasterLeave}
                title="Master Data"
                className={`w-full h-12 flex flex-col items-center justify-center rounded-xl gap-0.5 transition-all relative ${
                  masterOpen || isMasterRoute
                    ? "bg-white/25 text-white"
                    : "text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                <item.icon size={17} />
                <span className="text-[8px] font-semibold uppercase tracking-wide leading-none mt-0.5">
                  {item.label}
                </span>
                {(masterOpen || isMasterRoute) && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-l-full" />
                )}
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  `w-full h-12 flex flex-col items-center justify-center rounded-xl gap-0.5 transition-all relative ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "text-white/70 hover:bg-white/15 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={17} />
                    <span className="text-[8px] font-semibold uppercase tracking-wide leading-none mt-0.5">
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-l-full" />
                    )}
                  </>
                )}
              </NavLink>
            )
          )}
        </div>

        <div className="flex-1" />

        <button
          title="Settings"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:bg-white/15 hover:text-white transition-all"
        >
          <Settings size={16} />
        </button>

        {/* Profile button - now navigate works */}
        <div
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-[#e8a825] flex items-center justify-center text-xs font-bold text-white shadow-md mt-1 mb-1 cursor-pointer relative z-10"
        >
          {/* Show user initials dynamically - we'll pass from parent or use Redux; but for simplicity, we'll rely on Topbar to show full name. */}
          {/* We'll keep as placeholder; can be improved later */}
          {window.innerWidth > 0 && "U"} {/* temporary */}
        </div>
      </aside>

      {masterOpen && (
        <MasterDropdown
          anchorRef={masterBtnRef}
          onMouseEnter={onMasterEnter}
          onMouseLeave={onMasterLeave}
        />
      )}
    </>
  );
}

/* ------------------ TOPBAR ------------------ */

function Topbar() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { member } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  // Get user initials (first letter of first name and last name, or first two letters of full name)
  const getUserInitials = () => {
    if (!member?.name) return "U";
    const nameParts = member.name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!member?.name) return "User";
    return member.name;
  };

  const filter = useCallback(
    (q) => searchablePages.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())),
    []
  );

  useEffect(() => {
    if (query) {
      const res = filter(query);
      setResults(res);
      setOpen(res.length > 0);
    } else {
      setOpen(false);
    }
  }, [query, filter]);

  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <header className="h-11 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shadow-sm">
      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg w-52 focus-within:border-[#1A1745] focus-within:bg-white transition-all">
          <Search size={12} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs outline-none w-full bg-transparent placeholder-gray-400"
            placeholder="Search pages..."
          />
        </div>

        {open && (
          <div className="absolute top-full mt-1 w-52 bg-white border border-gray-100 shadow-xl rounded-xl z-50 py-1 overflow-hidden">
            {results.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.path}
                  onClick={() => {
                    navigate(r.path);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-[#f5f0f3] hover:text-[#1A1745] transition-colors"
                >
                  <Icon size={14} className="text-gray-400" />
                  {r.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">


        {/* User Avatar & Name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#e8a825] text-white flex items-center justify-center text-xs font-bold shadow">
            {getUserInitials()}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {getUserDisplayName()}
          </span>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          {/* <span className="text-xs font-medium hidden sm:inline">Logout</span> */}
        </button>

      </div>
    </header>
  );
}

/* ------------------ MAIN LAYOUT ------------------ */

export default function Layout() {
  const [masterOpen, setMasterOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const handleMasterEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMasterOpen(true);
  }, []);

  const handleMasterLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setMasterOpen(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <PrimarySidebar
        masterOpen={masterOpen}
        onMasterEnter={handleMasterEnter}
        onMasterLeave={handleMasterLeave}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}