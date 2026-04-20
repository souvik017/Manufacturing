// pages/masters/ProductTypeList.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import useProduct from "../../hooks/useProduct";
import Pagination from "../../components/pagination";
import { formatDate } from "../../utils/FormatDate";

export default function ProductTypeList() {
  const { getProductTypes, deleteProductType, loading } = useProduct();
  const [types, setTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const fetchTypes = useCallback(async () => {
    try {
      let result;
      
      if (debouncedSearch.trim() !== "") {
        // Search mode: no pagination params
        result = await getProductTypes({ search: debouncedSearch });
      } else {
        // Normal paginated mode
        result = await getProductTypes({ limit, page, search: "" });
      }
      
      if (result?.success) {
        setTypes(result.data || []);
        
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
      }
    } catch (error) {
      console.error("Fetch types error:", error);
      setTypes([]);
      setTotalRecords(0);
      setTotalPages(1);
    }
  }, [limit, page, debouncedSearch]);

  // Debounced search handler
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

  // Clear search
  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setIsSearching(false);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product type?")) {
      const result = await deleteProductType(id);
      if (result.success) {
        if (types.length === 1 && page > 1 && !debouncedSearch) {
          setPage(page - 1);
        } else {
          fetchTypes();
        }
      }
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  // Helper to get the name field (different APIs may use different keys)
  const getTypeName = (type) => {
    return type.item_type_name || type.type_name || type.name || "";
  };

  const isSearchActive = debouncedSearch.trim() !== "";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Product Types</h1>
          {!loading && totalRecords > 0 && !isSearchActive && (
            <p className="text-sm text-gray-400 mt-0.5">
              {totalRecords} {totalRecords === 1 ? "type" : "types"} total
            </p>
          )}
          {isSearchActive && types.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              Found {types.length} {types.length === 1 ? "type" : "types"}
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
              placeholder="Search by type name…"
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

          <Link
            to="/masters/producttype/add"
            className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
          >
            <Plus size={18} /> Add Type
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Sl no</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: Math.min(limit, 50) }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="h-4 bg-gray-200 rounded w-8" />
                  </td>
                </tr>
              ))
            ) : types.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  {isSearchActive 
                    ? `No product types found matching "${search}". Try a different search term.`
                    : "No product types found. Click 'Add Type' to create one."}
                </td>
              </tr>
            ) : (
              types.map((type, idx) => (
                <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {!isSearchActive ? (page - 1) * limit + idx + 1 : idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {getTypeName(type)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {type.updated_at ? formatDate(type.updated_at) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      to={`/masters/producttype/edit/${type.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(type.id)}
                      disabled={loading}
                      title="Delete"
                      className="inline-flex items-center text-red-600 hover:text-red-800 disabled:opacity-40"
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
      {isSearchActive && types.length === 0 && !loading && (
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