import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react";
import useUomCategory from "../../hooks/useUomCategory";
import Pagination from "../../components/pagination";

export default function UomCategoryList() {
  const navigate = useNavigate();
  const { getUomCategories, deleteUomCategory, loading } = useUomCategory();
  const [uoms, setUoms] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(true);
  const debounceTimeoutRef = useRef(null);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1); // reset to first page on new search

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 500);
  };

  // Fetch categories with search, pagination
  const fetchCategories = useCallback(async () => {
    setFetchLoading(true);
    const payload = {
      limit,
      page,
      search: debouncedSearch,
    };
    const res = await getUomCategories(payload);
    if (res.success) {
      setUoms(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.total_pages || 1);
        setTotalRecords(res.pagination.total_records || 0);
      } else {
        // fallback if no pagination object
        setTotalPages(1);
        setTotalRecords(res.data?.length || 0);
      }
    } else {
      setUoms([]);
      setTotalPages(1);
      setTotalRecords(0);
    }
    setFetchLoading(false);
  }, [limit, page, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this UOM category?")) return;
    const res = await deleteUomCategory(id);
    if (res.success) {
      // If last item on page and not first page, go to previous page
      if (uoms.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchCategories();
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/masters/uomcategories/edit/${id}`);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const isSearchActive = debouncedSearch.trim() !== "";

  if (fetchLoading && page === 1 && !debouncedSearch) {
    // Only show full‑page loader on initial load
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#017e84]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">UOM Categories</h1>

      {/* Search & Show entries row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative w-[20vw] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by UOM name…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#017e84]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show</label>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#017e84]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
                <Link
          to="/masters/uomcategories/add"
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add UOM
        </Link>
      </div>
      
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fetchLoading ? (
              // Skeleton rows while loading (after initial load)
              Array.from({ length: limit }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                </tr>
              ))
            ) : uoms.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                  {isSearchActive
                    ? "No UOM categories match your search."
                    : "No UOM categories found. Click 'Add UOM' to create one."}
                </td>
              </tr>
            ) : (
              uoms.map((uom) => (
                <tr key={uom.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{uom.uom_name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        uom.status === "1"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {uom.status === "1" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(uom.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(uom.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
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

      {/* Pagination */}
      {!fetchLoading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}