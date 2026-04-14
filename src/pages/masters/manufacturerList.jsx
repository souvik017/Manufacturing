// pages/masters/ManufacturerList.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import useManufacture from "../../hooks/useManufacture";
import Pagination from "../../components/pagination";

export default function ManufacturerList() {
  const { getManufacturers, deleteManufacturer, loading } = useManufacture();
  const [manufacturers, setManufacturers] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  const fetchManufacturers = useCallback(async () => {
    const result = await getManufacturers({ limit, page, search });
    if (result?.success) {
      setManufacturers(result.data || []);
      if (result.pagination) {
        setTotalPages(result.pagination.total_pages || 1);
        setTotalRecords(result.pagination.total_records || 0);
      } else {
        setTotalPages(1);
        setTotalRecords(result.data?.length || 0);
      }
      setError("");
    } else {
      setError(result?.message || "Failed to load manufacturers");
    }
  }, [limit, page, search]);

  // Fetch when limit, page, or debounced search changes
  useEffect(() => {
    fetchManufacturers();
  }, [fetchManufacturers]); // fetchManufacturers changes when limit/page/search change

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // No extra fetch – useEffect will trigger when search changes
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete manufacturer "${name}"? This action cannot be undone.`)) return;
    const result = await deleteManufacturer(id);
    if (result.success) {
      if (manufacturers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchManufacturers(); // refresh current page
      }
    } else {
      setError(result?.message || "Failed to delete manufacturer");
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1); // reset to first page
    // useEffect will automatically call fetchManufacturers because limit changed
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Manufacturers</h1>
          {!loading && totalRecords > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {totalRecords} {totalRecords === 1 ? "manufacturer" : "manufacturers"} total
            </p>
          )}
        </div>


        
      {/* Search & Show entries */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative w-[20vw] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by manufacturer name…"
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
          to="/masters/manufacturers/add"
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add Manufacturer
        </Link>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">S.No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: Math.min(limit, 50) }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="h-4 bg-gray-200 rounded w-8" />
                  </td>
                </tr>
              ))
            ) : manufacturers.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                  No manufacturers found. Click "Add Manufacturer" to create one.
                </td>
              </tr>
            ) : (
              manufacturers.map((manufacturer, idx) => {
                const name = manufacturer.manufacturer_name || manufacturer.name;
                const id = manufacturer.id || manufacturer._id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{name}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        to={`/masters/manufacturers/edit/${id}`}
                        state={{ manufacturer }}
                        className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1"
                      >
                        <Edit size={16} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(id, name)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}