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
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import useOrders from "../hooks/useOrders";

export default function OrderList() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { getOrders, loading } = useOrders();

  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const fetchOrders = useCallback(
    async (searchTerm = "", page = 1, filter = activeFilter, itemsPerPage = limit) => {
      try {
        setIsSearching(true);
        
        // Build params object
        const params = {};
        
        // If search term exists, only send search
        if (searchTerm && searchTerm.trim() !== "") {
          params.search = searchTerm;
          console.log("Sending search to backend:", searchTerm);
        } else {
          // Only send page, limit, and status when no search
          params.page = page;
          params.limit = itemsPerPage;
          
          // Add status only for draft filter
          if (filter === "draft") {
            params.status = "0";
          }
        }
        
        console.log("Sending params to API:", params);
        
        const res = await getOrders(params);
        
        if (res?.success) {
          const responseData = res.data;
          // Handle different response structures
          const ordersData = searchTerm 
            ? (responseData?.data || responseData?.orders || responseData || [])
            : (responseData?.data?.data || responseData?.data || []);
          
          const totalCount = searchTerm
            ? (ordersData.length || responseData?.total || 0)
            : (responseData?.data?.total || responseData?.total || 0);
          
          setOrders(ordersData);
          setTotal(totalCount);
          
          // Only calculate total pages when not searching
          if (!searchTerm) {
            setTotalPages(Math.ceil(totalCount / itemsPerPage));
          } else {
            setTotalPages(1); // Reset pagination when searching
          }
        } else {
          setOrders([]);
          setTotal(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
        setOrders([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsSearching(false);
      }
    },
    [activeFilter, limit, ]
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Fetch orders when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setCurrentPage(1); // Reset to first page when search changes
      fetchOrders(debouncedSearch, 1, activeFilter, limit);
    }
  }, [debouncedSearch, activeFilter, limit, ]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchOrders(search, currentPage, activeFilter, limit);
    setIsRefreshing(false);
  }, [search, currentPage, activeFilter, limit, ]);

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
    // Don't fetch here, let the debounce effect handle it
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setCurrentPage(1);
    fetchOrders("", 1, activeFilter, limit);
    searchInputRef.current?.focus();
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setSearch("");
    setDebouncedSearch("");
    fetchOrders("", 1, filter, limit);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
    fetchOrders(debouncedSearch, 1, activeFilter, newLimit);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchOrders(debouncedSearch, newPage, activeFilter, limit);
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

  const handleOrderClick = (order) => {
    if (order.order_status === 0 || order.status === "0") {
      navigate(`/requisitions/draft/edit/${order.id}`, { state: { order } });
    } else {
      navigate(`/requisitions/${order.id}`);
    }
  };

  /* ── Collapsed strip ── */
  if (collapsed) {
    return (
      <div className="w-9 bg-white border-r border-gray-200 flex flex-col items-center py-2 gap-2 flex-shrink-0 h-full transition-all">
        <button
          onClick={() => setCollapsed(false)}
          title="Show order list"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
        >
          <PanelLeftOpen size={15} />
        </button>
        <button
          onClick={() => navigate("/requisitions/add")}
          title="New order"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
        >
          <Plus size={15} />
        </button>
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
        <div className="flex-1" />
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh"
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={`text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={() => navigate("/requisitions/add")}
          title="New order"
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Plus size={13} className="text-gray-500" />
        </button>
        <button
          onClick={() => setCollapsed(true)}
          title="Hide order list"
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <PanelLeftClose size={13} className="text-gray-500" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 px-2 pt-1.5 gap-1">
        <button
          onClick={() => handleFilterChange("all")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
            activeFilter === "all"
              ? "bg-white text-[#017e84] border-b-2 border-[#017e84]"
              : "bg-gray-50 text-gray-500 hover:text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange("draft")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
            activeFilter === "draft"
              ? "bg-white text-[#017e84] border-b-2 border-[#017e84]"
              : "bg-gray-50 text-gray-500 hover:text-gray-700"
          }`}
        >
          Drafts
        </button>
      </div>

      {/* Search Bar */}
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
          {(isSearching || (search && debouncedSearch !== search)) ? (
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
        {search && !isSearching && debouncedSearch === search && (
          <div className="mt-1.5 text-[10px] text-gray-500">
            {orders.length > 0
              ? `${orders.length} result${orders.length !== 1 ? "s" : ""} found`
              : "No results found"}
          </div>
        )}
        {search && search !== debouncedSearch && (
          <div className="mt-1.5 text-[10px] text-gray-400">
            Typing...
          </div>
        )}
      </div>

      {/* Info row with limit dropdown */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={11} className="text-gray-400" />
          <span className="text-xs text-gray-400">
            {activeFilter === "draft" ? "Showing drafts only" : "All requisitions"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!search && total > 0 && (
            <span className="text-xs text-gray-400">{total} total</span>
          )}
          {search && orders.length > 0 && (
            <span className="text-xs text-gray-400">{orders.length} found</span>
          )}
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#017e84]"
            disabled={!!search}
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto">
        {loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={24} className="text-[#017e84] animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading requisitions...</p>
          </div>
        )}

        {!loading && !search && orders.length === 0 && activeFilter === "all" && (
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

        {!loading && !search && orders.length === 0 && activeFilter === "draft" && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <SlidersHorizontal size={20} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 font-medium text-center">
              No drafts available
            </p>
            <p className="text-xs text-gray-400 text-center">
              Save a requisition as draft to see it here
            </p>
          </div>
        )}

        {!loading && search && orders.length === 0 && debouncedSearch === search && (
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

        {orders.map((order) => {
          const isActive = String(order.id) === String(orderId);
          const isDraft = order.order_status === 0 || order.status === "0";

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
              onClick={() => handleOrderClick(order)}
              className={`relative flex items-center gap-3 px-3 py-3 border-b border-gray-100 cursor-pointer transition-all ${
                isActive
                  ? "bg-[#e8f5f5] border-l-2 border-l-[#017e84]"
                  : "border-l-2 border-l-transparent hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 border border-gray-200">
                  {order.requisition_no?.slice(-4) || (isDraft ? "DRFT" : "MRN")}
                </div>
                {isDraft && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border border-white"></div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {order.requisition_no}
                  </p>
                  {isDraft && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Draft
                    </span>
                  )}
                </div>
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

              <div className="relative" ref={openMenuId === order.id ? menuRef : null}>
                <button
                  onClick={(e) => toggleMenu(e, order.id)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200/80 text-gray-500 flex-shrink-0 transition-colors"
                >
                  <MoreVertical size={14} />
                </button>

                {openMenuId === order.id && (
                  <div className="absolute right-0 top-6 z-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
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

      {/* Pagination - Only show when not searching */}
      {!search && totalPages > 1 && (
        <div className="border-t border-gray-200 px-2 py-2 bg-white flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-500">
              {currentPage} / {totalPages}
            </span>
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}