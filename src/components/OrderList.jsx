import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Loader2,
} from "lucide-react";
import useOrders from "../hooks/useOrders";

const STATUS_LABEL = {
  "1": "Draft",
  "2": "In progress",
  "3": "Complete",
};

const STATUS_DOT = {
  "1": "bg-gray-300",
  "2": "bg-blue-400",
  "3": "bg-green-400",
};

export default function OrderList() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { getOrders, loading } = useOrders();

  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef(null);
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  const fetchOrders = useCallback(
    async (requisition_no = "") => {
      try {
        setIsSearching(true);
        const res = await getOrders({ requisition_no });
        if (res?.success) {
          const innerData = res.data.data;
          setOrders(innerData?.data || []);
          setTotal(innerData?.total || 0);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [getOrders]
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      fetchOrders(val);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchOrders("");
    searchInputRef.current?.focus();
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(null);
    navigate(`/orders/edit/${id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (window.confirm("Are you sure you want to delete this order?")) {
      console.log("Delete order", id);
    }
  };

  const handleCopy = (e, order) => {
    e.stopPropagation();
    setOpenMenuId(null);
    console.log("Copy order", order);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  /* ── Collapsed strip ── */
  if (collapsed) {
    return (
      <div className="w-9 bg-white border-r border-gray-200 flex flex-col items-center py-2 gap-2 flex-shrink-0 h-full transition-all">
        {/* Expand button */}
        <button
          onClick={() => setCollapsed(false)}
          title="Show order list"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
        >
          <PanelLeftOpen size={15} />
        </button>

        {/* Add button */}
        <button
          onClick={() => navigate("/requisitions/add")}
          title="New order"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
        >
          <Plus size={15} />
        </button>

        {/* Vertical label */}
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Requisitions
          </span>
        </div>
      </div>
    );
  }

  /* ── Full sidebar ── */
  return (
    <div
      className="w-[300px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full"
      style={{ transition: "width 200ms ease" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white">
        <button 
          onClick={() => searchInputRef.current?.focus()}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Search size={13} className="text-gray-500" />
        </button>

        <button className="flex items-center gap-1 px-3 py-1.5 bg-[#2c2c2c] text-white rounded-full text-xs font-medium hover:bg-[#3c3c3c] transition-colors">
          All <span className="text-gray-300 text-xs ml-0.5">▾</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={() => navigate("/requisitions/add")}
          title="New order"
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Plus size={13} className="text-gray-500" />
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(true)}
          title="Hide order list"
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <PanelLeftClose size={13} className="text-gray-500" />
        </button>
      </div>

      {/* Enhanced Search Bar */}
      <div 
        className={`px-3 py-2.5 border-b transition-all ${
          searchFocused 
            ? "border-[#017e84] bg-[#f0fafa]" 
            : "border-gray-100 bg-white"
        }`}
      >
        <div className="relative flex items-center gap-2">
          <Search 
            size={14} 
            className={`flex-shrink-0 transition-colors ${
              searchFocused ? "text-[#017e84]" : "text-gray-400"
            }`}
          />
          <input
            ref={searchInputRef}
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search requisition number..."
            className="w-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent font-medium"
          />
          
          {/* Loading spinner or clear button */}
          {isSearching ? (
            <Loader2 size={14} className="flex-shrink-0 text-[#017e84] animate-spin" />
          ) : search ? (
            <button
              onClick={handleClearSearch}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X size={12} />
            </button>
          ) : null}
        </div>
        
        {/* Search results indicator */}
        {search && !isSearching && (
          <div className="mt-1.5 text-[10px] text-gray-500">
            {orders.length > 0 
              ? `${orders.length} result${orders.length !== 1 ? 's' : ''} found`
              : "No results found"
            }
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
        <SlidersHorizontal size={11} className="text-gray-400" />
        <span className="text-xs text-gray-400">Filters</span>
        {!search && total > 0 && (
          <span className="ml-auto text-xs text-gray-400">{total} total</span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading state */}
        {loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={24} className="text-[#017e84] animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading requisitions...</p>
          </div>
        )}

        {/* Empty state - no search */}
        {!loading && !search && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Search size={20} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 font-medium text-center">
              No requisitions yet
            </p>
            <p className="text-xs text-gray-400 text-center">
              Create your first requisition to get started
            </p>
            <button
              onClick={() => navigate("/requisitions/add")}
              className="mt-2 px-4 py-2 bg-[#017e84] text-white text-xs font-medium rounded-md hover:bg-[#016469] transition-colors"
            >
              Create Requisition
            </button>
          </div>
        )}

        {/* Empty state - with search */}
        {!loading && search && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Search size={20} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 font-medium text-center">
              No results for "{search}"
            </p>
            <p className="text-xs text-gray-400 text-center">
              Try a different search term
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-2 text-xs text-[#017e84] font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Orders list */}
        {orders.map((order) => {
          const isActive = String(order.id) === String(orderId);

          const totalItems = (order.boms || []).reduce(
            (sum, b) => sum + (b.items?.length || 0),
            0
          );

          const deliveredCount = (order.boms || [])
            .flatMap((b) => b.items || [])
            .filter((i) => i.delivered).length;

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/requisitions/${order.id}`)}
              className={`relative flex items-center gap-3 px-3 py-3 border-b border-gray-100 cursor-pointer transition-all ${
                isActive
                  ? "bg-[#e8f5f5] border-l-2 border-l-[#017e84]"
                  : "border-l-2 border-l-transparent hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 border border-gray-200">
                {order.requisition_no?.slice(-4) || "MRN"}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {order.requisition_no}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {order.project_name ? `${order.project_name} · ` : ""}
                  {order.requisition_date}
                </p>
                {deliveredCount > 0 ? (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-green-600 font-medium">
                      {deliveredCount} for delivery
                    </span>
                  </div>
                ) : totalItems > 0 ? (
                  <span className="text-xs text-gray-400 mt-1 block">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>

              {/* Three-dot menu */}
              <div
                className="relative"
                ref={openMenuId === order.id ? menuRef : null}
              >
                <button
                  onClick={(e) => toggleMenu(e, order.id)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200/80 text-gray-500 flex-shrink-0 transition-colors"
                >
                  <MoreVertical size={14} />
                </button>

                {openMenuId === order.id && (
                  <div className="absolute right-0 top-6 z-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      onClick={(e) => handleEdit(e, order.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleCopy(e, order)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={(e) => handleDelete(e, order.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}