// pages/masters/BomList.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import useBom from "../../hooks/useBom";
import Pagination from "../../components/pagination";

export default function BomList() {
  const navigate = useNavigate();
  const { getBoms, deleteBom, loading } = useBom();

  const [boms, setBoms] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const debounceTimeoutRef = useRef(null);

  /* ==========================
     FETCH BOMS (server‑side)
  ========================== */
  const fetchBoms = useCallback(async () => {
    try {
      let result;
      
      if (debouncedSearch.trim() !== "") {
        // Search mode: no pagination params
        result = await getBoms({ search: debouncedSearch });
      } else {
        // Normal paginated mode
        result = await getBoms({ limit, page, search: "" });
      }
      
      if (result?.success) {
        setBoms(result.data || []);
        
        if (debouncedSearch.trim() !== "") {
          // Search results: no pagination, treat as single page
          setTotalPages(1);
          setTotalRecords(result.data?.length || 0);
        } else if (result.pagination) {
          setTotalPages(result.pagination.total_pages || 1);
          setTotalRecords(result.pagination.total_records || 0);
        } else {
          setTotalPages(1);
          setTotalRecords(result.data?.length || 0);
        }
        setError("");
      } else {
        setError(result?.message || "Failed to load BOMs");
        setBoms([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch BOMs error:", error);
      setBoms([]);
      setTotalRecords(0);
      setTotalPages(1);
      setError("Failed to load BOMs");
    }
  }, [limit, page, debouncedSearch]);

  /* ==========================
     DEBOUNCED SEARCH
  ========================== */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    setIsSearching(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setIsSearching(false);
    }, 500);
  };

  /* ==========================
     CLEAR SEARCH
  ========================== */
  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setIsSearching(false);
    setError("");
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  /* ==========================
     DELETE
  ========================== */
  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Delete BOM "${name}"? This action cannot be undone.`)) return;
    const result = await deleteBom(id);
    if (result?.success) {
      if (boms.length === 1 && page > 1 && !debouncedSearch) {
        setPage(page - 1); // go to previous page if last item on current page
      } else {
        fetchBoms(); // refresh current page
      }
    } else {
      setError(result?.message || "Failed to delete BOM");
    }
  };

  /* ==========================
     LIMIT CHANGE
  ========================== */
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  /* ==========================
     TRIGGER FETCH
  ========================== */
  useEffect(() => {
    fetchBoms();
  }, [fetchBoms]);

  /* ==========================
     CLEANUP TIMEOUT
  ========================== */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const isSearchActive = debouncedSearch.trim() !== "";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">BOMs</h1>
          {!loading && totalRecords > 0 && !isSearchActive && (
            <p className="text-sm text-gray-400 mt-0.5">
              {totalRecords} {totalRecords === 1 ? "BOM" : "BOMs"} total
            </p>
          )}
          {isSearchActive && boms.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              Found {boms.length} {boms.length === 1 ? "BOM" : "BOMs"}
            </p>
          )}
        </div>

        {/* Search & Show entries */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-[20vw] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by BOM name…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#017e84]"
            />
            {(isSearching || (search && debouncedSearch !== search)) ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#017e84] border-t-transparent"></div>
              </div>
            ) : search ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={limit}
              onChange={handleLimitChange}
              disabled={isSearchActive}
              className={`border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#017e84] ${
                isSearchActive ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>

          <button
            onClick={() => navigate("/masters/bom/add")}
            className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
          >
            <Plus size={18} /> Add BOM
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BOM Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No of items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              // Skeleton rows
              Array.from({ length: Math.min(limit, 50) }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="h-4 bg-gray-200 rounded w-8" />
                  </td>
                </tr>
              ))
            ) : boms.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  {isSearchActive 
                    ? `No BOMs found matching "${search}". Try a different search term.`
                    : "No BOMs found. Click 'Add BOM' to create one."}
                </td>
              </tr>
            ) : (
              boms.map((bom, idx) => (
                <tr
                  key={bom.bom_id}
                  onClick={() => navigate(`/masters/bom/edit/${bom.bom_id}`)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{bom.bom_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{bom.article_no}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{bom.product_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {Array.isArray(bom.items) ? bom.items.length : 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{bom.uom_name}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/masters/bom/edit/${bom.bom_id}`);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, bom.bom_id, bom.bom_name)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Only show when not searching */}
      {!loading && totalPages > 1 && !isSearchActive && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
      
      {/* Clear search button when no results */}
      {isSearchActive && boms.length === 0 && !loading && (
        <div className="mt-4 text-center">
          <button
            onClick={handleClearSearch}
            className="text-sm text-[#017e84] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}